"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  getCustomCakeRequest, 
  acceptCustomCakeQuote, 
  declineCustomCakeQuote, 
  CustomCakeRequestResponseDto 
} from "@/lib/api";
import { 
  Cake, 
  Clock, 
  CheckCircle2, 
  Tag,
  Lock,
  RefreshCw,
  AlertCircle 
} from "lucide-react";

function CustomCakeDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const ref = params.ref as string;
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [request, setRequest] = useState<CustomCakeRequestResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback((effectiveToken: string) => {
    if (!ref || !effectiveToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    getCustomCakeRequest(ref, effectiveToken)
      .then((data) => {
        setRequest(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || "رمز الوصول غير صحيح أو الطلب غير موجود");
        setLoading(false);
      });
  }, [ref]);

  useEffect(() => {
    if (token) {
      fetchDetail(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchDetail]);

  const handleAccept = async (quoteId: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const updated = await acceptCustomCakeQuote(ref, quoteId, token);
      setRequest(updated);
      setActionLoading(false);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل قبول عرض السعر");
      setActionLoading(false);
    }
  };

  const handleDecline = async (quoteId: string) => {
    if (!token) return;
    if (!confirm("هل أنت متأكد من رغبتك في رفض عرض السعر هذا؟")) return;
    setActionLoading(true);
    try {
      const updated = await declineCustomCakeQuote(ref, quoteId, token);
      setRequest(updated);
      setActionLoading(false);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل تسجيل الرفض");
      setActionLoading(false);
    }
  };

  if (!token && !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-brand-gold/20 flex items-center justify-center text-brand-gold mx-auto shadow-inner border border-brand-gold/40">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-brand-cocoa">مطلوب رمز الوصول للطلب</h2>
        <p className="text-xs text-brand-cocoa-light leading-relaxed">
          لحماية بياناتك، يتطلب استعراض عرض سعر التورتة {ref} إدخال رمز الوصول السري الخاص بك.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); setToken(tokenInput.trim()); }} className="space-y-3 pt-2">
          <input
            type="text"
            placeholder="أدخل رمز الوصول (Access Token)"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-brand-pink/40 text-xs font-mono text-center text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-sm"
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-gold via-brand-gold to-brand-gold-dark text-brand-espresso text-xs font-black hover:brightness-110 active:scale-95 transition shadow-gold-glow"
          >
            تأكيد وعرض تفاصيل الطلب
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-brand-gold/15 flex items-center justify-center text-brand-gold mx-auto border border-brand-gold/30">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold text-brand-cocoa">جاري تحميل طلب التورتة وعروض الأسعار...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mx-auto border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-brand-cocoa">تعذر الوصول لبيانات التورتة</h2>
        <p className="text-xs text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => { setToken(""); setTokenInput(""); }}
          className="px-6 py-3 rounded-xl bg-brand-cocoa text-brand-cream text-xs font-bold hover:bg-brand-cocoa-dark transition shadow"
        >
          إعادة المحاولة برمز آخر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-pink/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">طلب تورتة خاصة</span>
            <span className="text-xs text-brand-cocoa-light">• {new Date(request.createdAt).toLocaleDateString("ar-EG")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-cocoa font-mono">
            {request.publicReference}
          </h1>
          <p className="text-xs text-brand-cocoa-light mt-1">
            العميل: <strong className="text-brand-cocoa">{request.customerName}</strong> ({request.customerPhone})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-brand-pink-light border border-brand-pink/40 text-brand-cocoa text-center">
            <span className="text-[10px] text-brand-cocoa-light block">حالة الطلب</span>
            <span className="font-extrabold text-xs">{request.statusLabelAr}</span>
          </div>
        </div>
      </div>

      {/* Request Specifications Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-pink/30 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-brand-cocoa border-b border-brand-pink/20 pb-3 flex items-center gap-2">
          <Cake className="w-4 h-4 text-brand-gold" />
          <span>المواصفات المطلوبة من العميل</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-brand-cocoa-light block mb-0.5">تاريخ المناسبة:</span>
            <span className="font-bold text-brand-cocoa">{request.requestedDate}</span>
          </div>

          <div>
            <span className="text-brand-cocoa-light block mb-0.5">عدد الأفراد:</span>
            <span className="font-bold text-brand-cocoa">{request.servingsNeeded || "—"} فرد</span>
          </div>

          <div>
            <span className="text-brand-cocoa-light block mb-0.5">النكهة المفضلة:</span>
            <span className="font-bold text-brand-cocoa">{request.flavorPreference || "—"}</span>
          </div>

          <div>
            <span className="text-brand-cocoa-light block mb-0.5">صورة مرجعية:</span>
            <span className="font-bold text-brand-cocoa">{request.hasReferenceImage ? "مرفقة ومحفوظة بأمان" : "بدون صورة"}</span>
          </div>
        </div>

        {request.messageOnCake && (
          <div className="p-3 rounded-xl bg-brand-cream/40 border border-brand-pink/20 text-xs">
            <span className="font-bold text-brand-cocoa">العبارة المطلوبة: </span>
            <span className="text-brand-cocoa-light">&ldquo;{request.messageOnCake}&rdquo;</span>
          </div>
        )}

        {request.notes && (
          <div className="text-xs text-brand-cocoa-light leading-relaxed">
            <strong className="text-brand-cocoa">ملاحظات إضافية: </strong>
            {request.notes}
          </div>
        )}
      </div>

      {/* Quotations Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-pink/30 shadow-md space-y-6">
        <h3 className="font-bold text-base text-brand-cocoa flex items-center gap-2 border-b border-brand-pink/20 pb-4">
          <Tag className="w-5 h-5 text-brand-gold" />
          <span>عروض الأسعار المقدمة من الإدارة</span>
        </h3>

        {request.quotes.length === 0 ? (
          <div className="text-center py-10 text-brand-cocoa-light space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-pink-light flex items-center justify-center text-2xl mx-auto">
              ⏳
            </div>
            <p className="font-bold text-sm text-brand-cocoa">طلبك قيد المراجعة الفنية والتسعير</p>
            <p className="text-xs max-w-sm mx-auto">
              يقوم الشيف حالياً بدراسة المكونات والتصميم المطلوب وسيظهر عرض السعر الرسمي هنا فور اعتماده.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {request.quotes.map((q) => {
              const isPending = q.status === "PENDING" && !q.expired;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border transition space-y-4 ${
                    q.status === "ACCEPTED"
                      ? "bg-green-50/60 border-green-300"
                      : q.expired || q.status === "EXPIRED"
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-brand-pink-light/30 border-brand-pink/50 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-brand-cocoa-light block">السعر المعروض</span>
                      <span className="text-2xl font-black text-brand-cocoa">
                        {q.quotedPrice.toFixed(2)} <span className="text-xs font-bold">ج.م</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        q.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : q.status === "DECLINED"
                          ? "bg-red-100 text-red-800"
                          : q.expired || q.status === "EXPIRED"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-brand-cocoa text-brand-gold"
                      }`}>
                        {q.statusLabelAr}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/80 border border-brand-pink/20 text-xs text-brand-cocoa space-y-1">
                    <span className="font-bold block text-brand-cocoa">التفاصيل الفنية والشروط:</span>
                    <p className="leading-relaxed whitespace-pre-line text-brand-cocoa-light">{q.termsAndDetails}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-brand-cocoa-light pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      <span>صلاحية العرض حتى: {new Date(q.expiresAt).toLocaleString("ar-EG")}</span>
                    </span>

                    {/* Action buttons if pending */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDecline(q.id)}
                          className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-600 font-bold text-xs hover:bg-red-50 transition"
                        >
                          رفض العرض
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAccept(q.id)}
                          className="px-5 py-2 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition shadow flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>قبول وتأكيد التصميم</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default function CustomCakeDetailPage() {
  return (
    <React.Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-brand-cocoa-light font-medium">جاري تحميل تفاصيل الطلب...</div>}>
      <CustomCakeDetailContent />
    </React.Suspense>
  );
}
