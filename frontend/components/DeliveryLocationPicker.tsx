"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Check, Compass, ExternalLink } from "lucide-react";

export interface LocationData {
  neighborhood: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface DeliveryLocationPickerProps {
  onLocationSelect: (data: LocationData) => void;
  selectedZoneName?: string;
}

const CAIRO_NEIGHBORHOODS = [
  { name: "المعادي (الفرع الرئيسي)", lat: 29.9602, lng: 31.2569, fee: 35, speed: "30-45 دقيقة" },
  { name: "التجمع الخامس والقاهرة الجديدة", lat: 30.0074, lng: 31.4285, fee: 55, speed: "45-60 دقيقة" },
  { name: "مصر الجديدة والنزهة", lat: 30.0911, lng: 31.3255, fee: 45, speed: "40-50 دقيقة" },
  { name: "مدينة نصر", lat: 30.0566, lng: 31.3301, fee: 45, speed: "40-50 دقيقة" },
  { name: "الزمالك وجاردن سيتي", lat: 30.0609, lng: 31.2197, fee: 45, speed: "35-45 دقيقة" },
  { name: "الدقي والمهندسين", lat: 30.0384, lng: 31.2119, fee: 45, speed: "35-45 دقيقة" },
  { name: "الشيخ زايد و 6 أكتوبر", lat: 30.0321, lng: 30.9841, fee: 65, speed: "60-75 دقيقة" },
  { name: "المقطم والهضبة الوسطى", lat: 30.0125, lng: 31.2991, fee: 40, speed: "35-45 دقيقة" },
];

export default function DeliveryLocationPicker({ onLocationSelect, selectedZoneName }: DeliveryLocationPickerProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<(typeof CAIRO_NEIGHBORHOODS)[0] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: CAIRO_NEIGHBORHOODS[0].lat,
    lng: CAIRO_NEIGHBORHOODS[0].lng,
  });
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Sync selectedZoneName if provided
  React.useEffect(() => {
    if (selectedZoneName) {
      const match = CAIRO_NEIGHBORHOODS.find((n) => selectedZoneName.includes(n.name) || n.name.includes(selectedZoneName));
      if (match) {
        setSelectedNeighborhood(match);
      }
    }
  }, [selectedZoneName]);

  const handleSelectNeighborhood = (item: typeof CAIRO_NEIGHBORHOODS[0]) => {
    setSelectedNeighborhood(item);
    setCurrentCoords({ lat: item.lat, lng: item.lng });
    setDetectedAddress(`${item.name}، القاهرة الكبرى`);
    setLocationStatus(`تم تحديد الحي: ${item.name}`);
    onLocationSelect({
      neighborhood: item.name,
      lat: item.lat,
      lng: item.lng,
      formattedAddress: `${item.name}، القاهرة الكبرى`,
    });
  };

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    // Reset preset neighborhood selection so it does not stay pinned to a suggestion
    setSelectedNeighborhood(null);
    setIsLocating(true);
    setLocationStatus("جاري الاتصال بالأقمار الصناعية وتحديد الإحداثيات الدقيقة...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);
        setCurrentCoords({ lat, lng });

        let resolvedAddress = `موقع جغرافي دقيق [${lat.toFixed(5)}, ${lng.toFixed(5)}] (دقة: ${accuracy}م)`;
        let neighborhoodGuess = selectedZoneName || "القاهرة";

        try {
          // OpenStreetMap Reverse Geocoding in Arabic
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`,
            { headers: { "Accept-Language": "ar" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.pedestrian || addr.street || "";
              const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "";
              const city = addr.city || addr.town || addr.state || "القاهرة";

              neighborhoodGuess = suburb || road || city;
              resolvedAddress = [road, suburb, city].filter(Boolean).join("، ");
            }
          }
        } catch {
          // Fallback to coordinates
        }

        setDetectedAddress(resolvedAddress);
        setLocationStatus(`تم التقاط الموقع بنجاح بدقة عالية (±${accuracy} متر) 🎯`);
        setIsLocating(false);

        onLocationSelect({
          neighborhood: neighborhoodGuess,
          lat,
          lng,
          formattedAddress: resolvedAddress,
        });
      },
      (error) => {
        setIsLocating(false);
        let msg = "تعذر تحديد الموقع الجغرافي تلقائياً";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "تم رفض إذن الوصول للموقع، يرجى تفعيله في المتصفح أو اختيار الحي يدوياً من القائمة أدناه";
        } else if (error.code === error.TIMEOUT) {
          msg = "استغرق تحديد الموقع وقتاً طويلاً، يرجى اختيار الحي من القائمة أدناه";
        }
        setLocationStatus(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 p-5 rounded-3xl border border-rose-200/90 shadow-sm space-y-4 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900">تحديد موقع التوصيل الجغرافي بدقة (GPS) 📍</h4>
            <span className="text-[10px] text-slate-500">نقل مبرد لضمان وصول الكعكات سليمة وطازجة</span>
          </div>
        </div>

        {/* GPS Quick Button */}
        <button
          type="button"
          onClick={handleGpsLocate}
          disabled={isLocating}
          className="px-4 py-2 rounded-xl bg-white border border-rose-300 hover:border-rose-400 hover:bg-rose-50 text-rose-600 text-xs font-black transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-rose-500" : ""}`} />
          <span>{isLocating ? "جاري الالتقاط..." : "تحديد موقعي التلقائي (GPS) 🎯"}</span>
        </button>
      </div>

      {/* Status Notice */}
      {locationStatus && (
        <div className="p-3 rounded-2xl bg-white border border-pink-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
          <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Interactive Map Visual Pin with OpenStreetMap Embed */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-rose-200 shadow-inner bg-slate-100">
        <iframe
          title="Delivery Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentCoords.lng - 0.015}%2C${currentCoords.lat - 0.01}%2C${currentCoords.lng + 0.015}%2C${currentCoords.lat + 0.01}&layer=mapnik&marker=${currentCoords.lat}%2C${currentCoords.lng}`}
          className="w-full h-full border-0 pointer-events-none opacity-85"
        />

        {/* Map Overlay Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-pink-200 shadow-sm text-[11px] font-black text-slate-900 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>إحداثيات: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
        </div>

        {detectedAddress && (
          <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-pink-200 shadow-sm text-[11px] text-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
              <span className="font-bold truncate">{detectedAddress}</span>
            </div>
            <a
              href={`https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-0.5 rounded-lg bg-pink-100 text-pink-700 font-bold text-[10px] hover:bg-pink-200 transition flex items-center gap-1 flex-shrink-0"
            >
              <span>فتح بجوجل ماب</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>

      {/* Quick Neighborhood Picker */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-600 block">
          أو اختر منطقتك السكنية بالقاهرة الكبرى للتحديد السريع:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CAIRO_NEIGHBORHOODS.map((item) => {
            const isSelected = selectedNeighborhood?.name === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectNeighborhood(item)}
                className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                    : "bg-white border-rose-200 hover:bg-rose-50/50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold ${isSelected ? "text-rose-100" : "text-slate-500"}`}>
                    {item.speed}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="font-black text-xs line-clamp-1">{item.name}</span>
                <span className={`text-[10px] mt-0.5 font-bold ${isSelected ? "text-rose-100" : "text-rose-600"}`}>
                  توصيل: {item.fee} ج.م
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
