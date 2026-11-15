"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Compass, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface LocationData {
  neighborhood: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  isOutOfZone?: boolean;
}

interface DeliveryLocationPickerProps {
  onLocationSelect: (data: LocationData) => void;
  selectedZoneName?: string;
  initialCoords?: { lat: number; lng: number } | null;
  isOutOfZone?: boolean;
  zoneWarning?: string | null;
}

/**
 * Checks whether coordinates or address string fall within Sheikh Zayed & 6th of October boundaries.
 * Coordinates bounding box:
 * Longitude: 30.68 to 31.14 (West Cairo / Giza desert plateau)
 * Latitude: 29.75 to 30.18 (From Southern October industrial zone / Wahat up to Northern expansions / Zayed 2000 / New Zayed)
 */
export function isLocationInZayedOctober(lat: number, lng: number, addressText?: string): boolean {
  const inCoords = lng >= 30.68 && lng <= 31.14 && lat >= 29.75 && lat <= 30.18;
  if (inCoords) return true;

  if (addressText) {
    const t = addressText.toLowerCase();
    const keywords = [
      "زايد", "zayed", "اكتوبر", "أكتوبر", "october", "الواحات", "الخمائل",
      "حدائق اكتوبر", "حدائق الأهرام", "بيفرلي", "beverly", "الحصري", "دريم لاند",
      "دريم", "dreamland", "sheikh zayed", "6th of october"
    ];
    for (const kw of keywords) {
      if (t.includes(kw)) return true;
    }
  }
  return false;
}

export default function DeliveryLocationPicker({
  onLocationSelect,
  selectedZoneName,
  initialCoords,
  isOutOfZone: externalOutOfZone,
  zoneWarning,
}: DeliveryLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  // Default coordinates center at Sheikh Zayed / 6th of October (Arkan / Zayed center)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      return { lat: initialCoords.lat, lng: initialCoords.lng };
    }
    return { lat: 30.0384, lng: 30.9833 };
  });

  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [localOutOfZone, setLocalOutOfZone] = useState<boolean>(false);

  // Sync coords if initialCoords prop updates from parent
  useEffect(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      setCurrentCoords({ lat: initialCoords.lat, lng: initialCoords.lng });
    }
  }, [initialCoords?.lat, initialCoords?.lng]);

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    setIsLocating(true);
    setLocationStatus("جاري الاتصال بالأقمار الصناعية والتقاط الإحداثيات الدقيقة لموقعك...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);
        setCurrentCoords({ lat, lng });

        let resolvedAddress = `موقع جغرافي دقيق [${lat.toFixed(5)}, ${lng.toFixed(5)}] (دقة: ±${accuracy}م)`;
        let neighborhoodGuess = selectedZoneName || "الشيخ زايد و 6 أكتوبر";

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
              const city = addr.city || addr.town || addr.state || "";

              neighborhoodGuess = suburb || road || city || "الشيخ زايد و 6 أكتوبر";
              const detectedParts = [road, suburb, city].filter(Boolean);
              if (detectedParts.length > 0) {
                resolvedAddress = detectedParts.join("، ");
              }
            }
          }
        } catch {
          // Fallback to coordinates string
        }

        // Check if inside Sheikh Zayed & 6th of October geofence
        const inside = isLocationInZayedOctober(lat, lng, resolvedAddress);
        setLocalOutOfZone(!inside);
        setDetectedAddress(resolvedAddress);

        if (inside) {
          setLocationStatus(`✅ تم التقاط موقعك بنجاح داخل نطاق التوصيل المعتمد (الشيخ زايد و 6 أكتوبر) بدقة ±${accuracy}م`);
        } else {
          setLocationStatus(
            `⚠️ موقعك الحالي يقع خارج نطاق التوصيل المتاح لدينا. التوصيل متوفر حصرياً لسكان (الشيخ زايد و 6 أكتوبر) فقط.`
          );
        }

        setIsLocating(false);

        onLocationSelect({
          neighborhood: neighborhoodGuess,
          lat,
          lng,
          formattedAddress: resolvedAddress,
          isOutOfZone: !inside,
        });
      },
      (error) => {
        setIsLocating(false);
        let msg = "تعذر تحديد الموقع الجغرافي تلقائياً";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "تم رفض إذن الوصول للموقع، يرجى السماح بالإذن في إعدادات المتصفح أو الهاتف لتأكيد موقع التوصيل.";
        } else if (error.code === error.TIMEOUT) {
          msg = "استغرق تحديد الموقع وقتاً طويلاً، يرجى المحاولة مجدداً والتأكد من تفعيل الـ GPS.";
        }
        setLocationStatus(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const isOutOfZone = externalOutOfZone ?? localOutOfZone;

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 space-y-4 ${
      isOutOfZone
        ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 ring-2 ring-rose-400/40"
        : "bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/90 border-rose-200/90 dark:border-slate-800 shadow-sm"
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
            isOutOfZone
              ? "bg-rose-600 text-white"
              : "bg-gradient-to-tr from-pink-500 to-rose-400 text-white"
          }`}>
            <Compass className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                تحديد موقع التوصيل الدقيق والخريطة التفاعلية (GPS) 📍
              </h4>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                زايد وأكتوبر حصرياً
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              سيارات مبردة لضمان وصول التورتات والحلويات طازجة في نفس اليوم
            </p>
          </div>
        </div>

        {/* GPS Quick Button */}
        <button
          type="button"
          onClick={handleGpsLocate}
          disabled={isLocating}
          className={`px-4 py-2.5 rounded-xl border text-xs font-black transition flex items-center gap-2 shadow-sm self-start sm:self-auto active:scale-95 disabled:opacity-50 ${
            isLocating
              ? "bg-rose-100 text-rose-700 border-rose-300 dark:bg-slate-800 dark:text-rose-400 dark:border-slate-700"
              : "bg-white dark:bg-slate-800 border-rose-300 dark:border-slate-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400"
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-rose-500" : ""}`} />
          <span>{isLocating ? "جاري التقاط الموقع بالأقمار الصناعية..." : "📍 تحديد موقعي الحالي تلقائياً"}</span>
        </button>
      </div>

      {/* Out of Zone Alert Banner */}
      {isOutOfZone && (
        <div className="p-4 rounded-2xl bg-rose-100/90 dark:bg-rose-950/80 border-2 border-rose-500 dark:border-rose-600 text-rose-950 dark:text-rose-200 flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-black text-xs sm:text-sm text-rose-900 dark:text-rose-100">
              ⚠️ عذراً، موقعك الحالي يقع خارج نطاق التوصيل المتاح لدينا
            </h5>
            <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-200">
              {zoneWarning || "خدمة التوصيل بالسيارات المبردة متوفرة حصرياً لسكان (الشيخ زايد و 6 أكتوبر) فقط. يمكنك تعديل طريقة الاستلام إلى 'استلام من الفرع' (بدون أي رسوم توصيل) لمتابعة تأكيد طلبك."}
            </p>
          </div>
        </div>
      )}

      {/* In Zone Success Banner */}
      {!isOutOfZone && detectedAddress && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>✅ تم التحقق: موقعك داخل نطاق التوصيل المعتمد (الشيخ زايد و 6 أكتوبر).</span>
        </div>
      )}

      {/* Status Notice */}
      {locationStatus && (
        <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xs ${
          isOutOfZone
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
            : "bg-white dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        }`}>
          <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Interactive Map Visual Pin with OpenStreetMap Embed */}
      <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-rose-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-950">
        <iframe
          key={`${currentCoords.lat.toFixed(5)}-${currentCoords.lng.toFixed(5)}`}
          title="Delivery Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentCoords.lng - 0.015}%2C${currentCoords.lat - 0.01}%2C${currentCoords.lng + 0.015}%2C${currentCoords.lat + 0.01}&layer=mapnik&marker=${currentCoords.lat}%2C${currentCoords.lng}`}
          className="w-full h-full border-0 pointer-events-none opacity-90"
        />

        {/* Map Top Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-pink-200 dark:border-slate-700 shadow-sm text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOutOfZone ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-ping"}`} />
            <span>إحداثيات: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
          </div>
          {isOutOfZone ? (
            <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-xl shadow-xs">
              خارج النطاق ⚠️
            </span>
          ) : (
            <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-xl shadow-xs">
              نطاق زايد وأكتوبر ✅
            </span>
          )}
        </div>

        {/* Address and Google Maps Footer Overlay */}
        {detectedAddress && (
          <div className="absolute bottom-3 inset-x-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-pink-200 dark:border-slate-700 shadow-sm text-[11px] text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span className="font-bold truncate">{detectedAddress}</span>
            </div>
            <a
              href={`https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-pink-300 font-bold text-[10px] hover:bg-pink-200 dark:hover:bg-slate-700 transition flex items-center gap-1 shrink-0"
            >
              <span>فتح بجوجل ماب</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
