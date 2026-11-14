"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Phone, User, MapPin, ArrowLeft, ShieldCheck, Heart } from "lucide-react";

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
