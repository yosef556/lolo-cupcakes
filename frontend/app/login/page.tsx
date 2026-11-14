"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { Lock, Mail, ArrowLeft, ShieldCheck, Heart, KeyRound, X, CheckCircle2 } from "lucide-react";
import { resetPassword as apiResetPassword } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // If already logged in, redirect to profile
  React.useEffect(() => {
    if (isLoggedIn) {
      router.push("/profile");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await login(identifier.trim(), password);
      router.push("/profile");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "فشل تسجيل الدخول، يرجى التأكد من صحة البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim() || !forgotNewPassword) return;

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      await apiResetPassword(forgotIdentifier.trim(), forgotNewPassword);
      setForgotSuccess("تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.");
      setIdentifier(forgotIdentifier.trim());
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setForgotError(error.message || "تعذر إعادة تعيين كلمة المرور، يرجى التحقق من البريد أو الهاتف");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-[36px] border border-pink-100 dark:border-pink-900/40 shadow-2xl shadow-pink-100/50 dark:shadow-black/50 relative z-10">
        
        {/* Header with Luxury Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo href="/" size="lg" className="flex-col !items-center mb-1" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight pt-1">
            مرحباً بك مجدداً 🌸
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            سجل دخولك لمتابعة طلباتك السابقة والحصول على تجربة شراء أسرع
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              البريد الإلكتروني أو رقم الهاتف:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="example@mail.com أو 010xxxxxxxx"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-2xl border border-pink-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                كلمة المرور:
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotIdentifier(identifier);
                }}
                className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 transition"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
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
                className="w-full pr-10 pl-4 py-3 rounded-2xl border border-pink-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white font-black text-xs shadow-lg shadow-pink-200 dark:shadow-none transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول الآن ✨</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-pink-100/70 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            ليس لديك حساب بعد؟{" "}
            <Link href="/register" className="font-black text-pink-600 dark:text-pink-400 hover:text-pink-700 transition inline-flex items-center gap-1">
              <span>إنشاء حساب جديد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>بياناتك محفوظة بأمان وسرية تامة في قاعدة بياناتنا</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 sm:p-8 rounded-[32px] border border-pink-200 dark:border-pink-900 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-pink-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 flex items-center justify-center text-pink-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">استعادة كلمة المرور</h3>
                <p className="text-[11px] text-slate-500">أدخل بريدك أو رقم هاتفك لتعيين كلمة مرور جديدة</p>
              </div>
            </div>

            {forgotSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-800 dark:text-rose-300 font-bold">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  البريد أو الهاتف المسجل:
                </label>
                <input
                  type="text"
                  required
                  placeholder="example@mail.com أو 010xxxxxxxx"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  كلمة المرور الجديدة:
                </label>
                <input
                  type="password"
                  required
                  placeholder="أدخل كلمة مرور جديدة قوية"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {forgotLoading ? "جاري التحديث..." : "حفظ كلمة المرور الجديدة ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
