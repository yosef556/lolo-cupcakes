"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Phone, User, MapPin, ArrowLeft, ShieldCheck, Heart, Navigation, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optional GPS Location Recommendation State (USER REQUEST: نصيحة اختيارية أثناء التسجيل)
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; mapsUrl: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleCaptureRegisterGps = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع الجغرافي");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        const loc = { lat, lng, mapsUrl };
        setGpsLocation(loc);
        localStorage.setItem("user_gps_location", JSON.stringify(loc));
        setGpsLoading(false);

        // Reverse geocoding to auto-fill address input
        try {
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
              const city = addr.city || addr.town || "القاهرة";
              const detected = [road, suburb, city].filter(Boolean).join("، ");
              if (detected) {
                setAddress(detected);
              }
            }
          }
        } catch {}
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // If already logged in, redirect to profile
  React.useEffect(() => {
    if (isLoggedIn) {
      router.push("/profile");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("كلمة المرور يجب أن لا تقل عن 6 أحرف");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: address.trim() || undefined,
      });
      router.push("/profile");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-100/50 relative z-10">
        
        {/* Header with Luxury Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo href="/" size="lg" className="flex-col !items-center mb-1" />
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight pt-1">
            إنشاء حساب جديد 🧁
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            انضم إلى عائلة لولو كب كيك واستمتع بتجربة تسوق سريعة ومميزة
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              الاسم بالكامل *:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="سارة أحمد"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-pink-200 text-xs font-medium text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              البريد الإلكتروني *:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="sara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-pink-200 text-xs font-medium text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              رقم الهاتف المحمول (واتساب) *:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                placeholder="010xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-pink-200 text-xs font-medium text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              كلمة المرور (6 أحرف على الأقل) *:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-pink-200 text-xs font-medium text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          {/* Friendly Location Recommendation Tip (Optional at registration) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-pink-50 to-rose-50 border border-sky-200/80 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                💡
              </div>
              <div className="text-[11px] text-slate-700 leading-relaxed">
                <span className="font-black text-sky-900 block mb-0.5">نصيحة لتسريع استلام طلباتك مستقبلاً:</span>
                تحديد موقعك الجغرافي الآن اختياري، ويسهل ملء بياناتك بنقرة واحدة عند طلب أي أوردر. يمكنك تحديده الآن عبر الـ GPS أو تخطيه وإكماله عند إجراء أول طلب.
              </div>
            </div>

            {gpsLocation ? (
              <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold shadow-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  تم التقاط موقعك وحفظه لتسهيل طلباتك القادمة ✅
                </span>
                <button
                  type="button"
                  onClick={() => setGpsLocation(null)}
                  className="text-[10px] text-rose-500 hover:underline shrink-0"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCaptureRegisterGps}
                  disabled={gpsLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-[11px] shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                  <span>{gpsLoading ? "جاري الالتقاط..." : "📍 تحديد موقعي الحالي عبر GPS (اختياري)"}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  أو تخطي لاحقاً
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              عنوان التوصيل المفضل (اختياري):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="مثال: المعادي، شارع 9، عمارة 15"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-pink-200 text-xs font-medium text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white font-black text-xs shadow-lg shadow-pink-200 hover:shadow-sky-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري إنشاء الحساب...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>إنشاء الحساب والبدء الآن 🌸</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-pink-100/70">
          <p className="text-xs text-slate-500 font-medium">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-black text-pink-600 hover:text-pink-700 transition inline-flex items-center gap-1">
              <span>تسجيل الدخول</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>تخزين مشفر ومحمي في قاعدة بيانات النظام</span>
        </div>
      </div>
    </div>
  );
}
