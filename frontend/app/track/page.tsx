"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { lookupOrders, OrderTrackingDto } from "@/lib/api";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { 
  Search, 
  Sparkles, 
  Package, 
  ArrowLeft, 
  MessageCircle, 
  ChevronRight,
  HelpCircle
} from "lucide-react";

export default function TrackSearchPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { cleanWhatsAppNumber } = useStoreSettings();

  const [query, setQuery] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<OrderTrackingDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = query.trim();
    if (!cleanQ) {
      setError("يرجى إدخال رقم الطلب (مثال: LC-20261112-9903) أو رقم هاتفك");
      return;
    }

    // If it looks like an order number (starts with LC- or contains dash) and token is provided:
    if (cleanQ.toUpperCase().startsWith("LC-") && token.trim()) {
      router.push(`/orders/${cleanQ.toUpperCase()}?token=${encodeURIComponent(token.trim())}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const results = await lookupOrders(cleanQ);
      setLoading(false);
      if (results.length === 0) {
        // If lookup gave empty, but looks like an order number, try direct navigate
        if (cleanQ.toUpperCase().startsWith("LC-")) {
          router.push(`/orders/${cleanQ.toUpperCase()}`);
          return;
        }
        setError("لم يتم العثور على أي طلبات مسجلة بهذا الرقم، يرجى التأكد من الرقم والمحاولة مرة أخرى.");
      } else if (results.length === 1) {
        const order = results[0];
        router.push(`/orders/${order.publicOrderNumber}${order.trackingToken ? `?token=${order.trackingToken}` : ""}`);
      } else {
        setSearchResults(results);
      }
    } catch {
      setLoading(false);
      if (cleanQ.toUpperCase().startsWith("LC-")) {
        router.push(`/orders/${cleanQ.toUpperCase()}`);
        return;
      }
      setError("تعذر البحث عن الطلب حالياً، يرجى المحاولة بعد قليل أو التواصل مع خدمة العملاء.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-[#E8F6FC] text-[#5BBBE7] flex items-center justify-center mx-auto shadow-inner border border-[#CEECFA]">
          <Package className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-100">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>بوابة المتابعة الفورية والتتبع المباشر</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          تتبع مسار طلبك الملكي
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          تابع مراحل إعداد طلبك لحظة بلحظة، من بدء الخبز في المطبخ وحتى خروجه مع المندوب ووصوله لباب منزلك.
        </p>
      </div>

      {/* Main Search Box */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100/80 shadow-luxury space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              رقم الطلب أو رقم الهاتف المسجل *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="مثال: LC-20261112-9903 أو 010xxxxxxxx"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3.5 pl-10 rounded-2xl border border-rose-200/80 text-xs text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] shadow-sm transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 mr-1">
              * يمكنك كتابة رقم هاتفك لعرض جميع طلباتك السابقة دفعة واحدة.
            </p>
          </div>

          {/* Optional Token Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-[11px] font-bold text-[#5BBBE7] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showTokenInput ? "إخفاء رمز التتبع السري" : "هل لديك رمز تتبع سري إضافي؟ (اختياري)"}</span>
            </button>
            {showTokenInput && (
              <div className="mt-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="رمز التتبع السري (إن وجد)"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-mono text-center text-slate-700"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#89CFF0] text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-rose-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري البحث والتحقق...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>تتبع مسار الطلب الآن 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Multiple Search Results if phone matched multiple */}
        {searchResults && searchResults.length > 0 && (
          <div className="pt-4 border-t border-rose-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">الطلبات المسجلة برقمك ({searchResults.length}):</h3>
            <div className="space-y-2">
              {searchResults.map((ord) => (
                <Link
                  key={ord.publicOrderNumber}
                  href={`/orders/${ord.publicOrderNumber}${ord.trackingToken ? `?token=${ord.trackingToken}` : ""}`}
                  className="p-3.5 rounded-2xl border border-rose-100 hover:border-[#89CFF0] bg-rose-50/30 hover:bg-[#E8F6FC]/40 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono font-black text-xs text-slate-900 block">{ord.publicOrderNumber}</span>
                    <span className="text-[11px] text-slate-500">{ord.scheduledForDate} • {ord.totalAmount} ج.م</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      {ord.orderStatusLabelAr}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#5BBBE7] group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logged-In User Quick Order Cards */}
      {user && profile && profile.recentOrders && profile.recentOrders.length > 0 && (
        <div className="bg-white p-6 rounded-[28px] border border-rose-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-rose-100 pb-2">
            <h3 className="text-xs font-black text-slate-900">طلباتك الأخيرة المسجلة بحسابك:</h3>
            <Link href="/profile" className="text-[11px] font-bold text-[#5BBBE7] hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {profile.recentOrders.slice(0, 3).map((ord) => (
              <Link
                key={ord.publicOrderNumber}
                href={`/orders/${ord.publicOrderNumber}${ord.trackingToken ? `?token=${ord.trackingToken}` : ""}`}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900 block">{ord.publicOrderNumber}</span>
                  <span className="text-[10px] text-slate-500">{ord.scheduledForDate} • {ord.totalAmount} ج.م</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                  <span>{ord.orderStatusLabelAr}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Direct WhatsApp Help */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-800">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>هل تواجه صعوبة في العثور على رقم طلبك؟</span>
        </div>
        <a
          href={`https://wa.me/${cleanWhatsAppNumber || "201069915609"}?text=${encodeURIComponent("مرحباً شيف لولو كب كيك، أود الاستفسار عن حالة طلبي 🧁")}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
        >
          تحدث مع خدمة العملاء
        </a>
      </div>

    </div>
  );
}
