"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  getOrderTracking, 
  getPaymentInstructions, 
  uploadPaymentProof, 
  cancelCustomerOrder,
  OrderTrackingDto, 
  PaymentInstructionDto 
} from "@/lib/api";
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  Copy, 
  AlertCircle, 
  Truck, 
  Store, 
  CreditCard, 
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Sparkles,
  PackageCheck,
  Printer,
  XCircle,
  Cake
} from "lucide-react";
import { useStoreSettings } from "@/components/StoreSettingsContext";

function OrderTrackingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const initialToken = searchParams.get("token") || "";
  const { cleanWhatsAppNumber } = useStoreSettings();

  const [token, setToken] = useState(initialToken);
  const [order, setOrder] = useState<OrderTrackingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("تغيير في خطة المناسبة أو ظروف طارئة");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  // Payment Instructions & Proof Upload State
  const [instructions, setInstructions] = useState<PaymentInstructionDto[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [senderPhone, setSenderPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchTracking = useCallback((effectiveToken?: string) => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    getOrderTracking(orderNumber, effectiveToken || undefined)
      .then((data) => {
        setOrder(data);
        if (data.trackingToken && !token) {
          setToken(data.trackingToken);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || "الطلب غير موجود أو حدث خطأ أثناء جلب التفاصيل");
        setLoading(false);
      });
  }, [orderNumber, token]);

  useEffect(() => {
    fetchTracking(token);
    getPaymentInstructions().then(setInstructions).catch(() => []);
  }, [token, fetchTracking]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !order) return;

    setUploading(true);
    setUploadError(null);

    try {
      await uploadPaymentProof(orderNumber, token || order.trackingToken || "", proofFile, {
        senderPhone: senderPhone.trim() || undefined,
        senderName: senderName.trim() || undefined,
        transactionRef: transactionRef.trim() || undefined,
      });
      setUploadSuccess(true);
      setUploading(false);
      // Refresh tracking to show updated payment status and timeline
      fetchTracking(token);
    } catch (err: unknown) {
      const error = err as Error;
      setUploadError(error.message || "فشل رفع إيصال السداد، يرجى التحقق من نوع وحجم الملف");
      setUploading(false);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await cancelCustomerOrder(orderNumber, cancelReason);
      setCancelMsg("تم إلغاء الطلب بنجاح بناءً على رغبتك.");
      setCancelModalOpen(false);
      fetchTracking(token);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "تعذر إلغاء الطلب، قد يكون قيد التحضير بالفعل.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto border border-rose-200">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-800">جاري تحميل حالة وتفاصيل الطلب...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mx-auto border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">تعذر الوصول لبيانات الطلب</h2>
        <p className="text-xs text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => { setToken(""); fetchTracking(); }}
          className="px-6 py-3 rounded-2xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow"
        >
          إعادة المحاولة والتحقق
        </button>
      </div>
    );
  }

  const isCash = order.paymentMethod === "CASH" || (!order.paymentMethod && (order.paymentMethodLabelAr?.includes("كاش") || false));
  const isManualTransfer = order.paymentMethod === "MANUAL_TRANSFER" || (order.paymentMethodLabelAr?.includes("تحويل") || false);
  const isPaidOrVerified = order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED";
  const isManualPending = isManualTransfer && !isPaidOrVerified;

  // Visual 5-Stage Stepper calculation
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return 0;
      case "PREPARING":
        return 1;
      case "READY":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "COMPLETED":
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.orderStatus);

  const STAGES = [
    { title: "استلام وتأكيد", desc: "تم تسجيل الطلب", icon: "📝" },
    { title: "الخَبز والفرن", desc: "تحضير طازج", icon: "👩‍🍳" },
    { title: "التزيين والتغليف", desc: "لمسات نهائية فاخرة", icon: "🎁" },
    { title: order.fulfillmentType === "PICKUP" ? "جاهز للاستلام" : "مع المندوب المبرد", desc: order.fulfillmentType === "PICKUP" ? "بالفرع الرئيسي" : "سيارة مبردة", icon: order.fulfillmentType === "PICKUP" ? "🏬" : "🛵" },
    { title: "تم التسليم", desc: "بالهناء والشفاء", icon: "😋" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Summary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> طلب مسجل وموثق
            </span>
            <span className="text-xs text-slate-400">• {new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {order.publicOrderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            {order.fulfillmentType === "DELIVERY" ? <Truck className="w-3.5 h-3.5 text-rose-500" /> : <Store className="w-3.5 h-3.5 text-rose-500" />}
            <span>{order.fulfillmentTypeLabelAr} — الموعد: {order.scheduledForDate} ({order.scheduledForTimeRange})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">حالة الطلب</span>
            <span className="font-extrabold text-xs text-rose-600">{order.orderStatusLabelAr}</span>
          </div>

          <div className={`px-4 py-2 rounded-2xl border text-center ${
            order.paymentStatus === "PAID" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span className="text-[10px] opacity-75 block">حالة السداد</span>
            <span className="font-extrabold text-xs">{order.paymentStatusLabelAr}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-center">
            <span className="text-[10px] text-slate-300 block">المبلغ الإجمالي</span>
            <span className="font-black text-sm">{order.totalAmount.toFixed(2)} ج.م</span>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs print:hidden"
            title="طباعة الفاتورة والإيصال"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة الإيصال 🖨️</span>
          </button>

          {order.orderStatus === "PENDING" && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs print:hidden"
              title="إلغاء الطلب قبل بدء التحضير"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>إلغاء الطلب ❌</span>
            </button>
          )}
        </div>
      </div>

      {cancelMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{cancelMsg}</span>
        </div>
      )}

      {/* 5-Step Visual Progress Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-rose-500" />
            <span>مسار تجهيز وتسليم طلبك الحي 🚀</span>
          </h3>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            المرحلة {currentStepIndex + 1} من 5
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {STAGES.map((stg, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border text-center relative transition-all ${
                  isCurrent 
                    ? "bg-rose-500 text-white border-rose-500 shadow-rose-glow scale-[1.02]"
                    : isCompleted
                    ? "bg-emerald-50/80 text-emerald-900 border-emerald-200"
                    : "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
                )}
                <div className="text-2xl mb-1">{stg.icon}</div>
                <div className="font-black text-xs">{stg.title}</div>
                <div className={`text-[10px] mt-0.5 ${isCurrent ? "text-rose-100" : isCompleted ? "text-emerald-700" : "text-slate-400"}`}>
                  {isCompleted ? "تم بنجاح ✓" : isCurrent ? "قيد التنفيذ الآن..." : stg.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Order Items Summary Card */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Cake className="w-5 h-5 text-rose-500" />
              <span>محتويات طلبك من الحلويات الفاخرة</span>
            </h3>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
              {order.items.length} أصناف
            </span>
          </div>

          <div className="divide-y divide-rose-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-900 text-sm block">{item.productNameAr || item.productName}</span>
                  {(item.optionsSnapshot || item.options) && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">{item.optionsSnapshot || item.options}</span>
                  )}
                  <span className="text-[11px] text-slate-400 block">
                    الكمية: {item.quantity} × {item.unitPrice.toFixed(2)} ج.م
                  </span>
                </div>
                <div className="text-left font-black text-rose-600 text-sm font-mono">
                  {item.lineTotal.toFixed(2)} ج.م
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-1.5 text-xs pt-3">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono">{((order.subtotal || order.totalAmount) - (order.deliveryFee || 0) + (order.discountAmount || 0)).toFixed(2)} ج.م</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>خصم الكوبون:</span>
                <span className="font-mono">-{order.discountAmount.toFixed(2)} ج.م</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <span>رسوم التوصيل:</span>
              <span className="font-mono">{order.deliveryFee ? `${order.deliveryFee.toFixed(2)} ج.م` : "مجاناً"}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 border-t border-rose-100 pt-2">
              <span>الإجمالي النهائي:</span>
              <span className="text-rose-600 font-mono">{order.totalAmount.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Concierge Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm">هل تود الاستفسار أو إعطاء ملاحظات للمندوب؟</h4>
            <p className="text-xs text-emerald-100 mt-0.5">فريق خدمة العملاء متواجد على مدار الساعة لمتابعة شحنتك</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${cleanWhatsAppNumber || "201016197035"}?text=${encodeURIComponent(
            `مرحباً لولو كب كيك 🧁 أتابع طلبي رقم: ${order.publicOrderNumber}\nحالة الطلب: ${order.orderStatusLabelAr}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>تواصل عبر واتساب 📲</span>
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Timeline & Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100 shadow-sm space-y-6">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-rose-100 pb-4">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>سجل التحركات والمراحل المسجلة</span>
            </h3>

            <div className="relative pl-4 space-y-6 before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200">
              {order.timeline.map((event, index) => (
                <div key={index} className="relative flex items-start gap-4 pr-8">
                  <div className="absolute right-1.5 top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
                  <div className="flex-1 bg-rose-50/40 p-4 rounded-2xl border border-rose-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{event.statusLabelAr}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-xs text-slate-600 leading-relaxed">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Instructions & Proof Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Cash on Delivery Card (USER REQUEST: Never show upload receipt form for Cash) */}
          {isCash && (
            <div className="bg-white p-6 rounded-[32px] border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                  💵
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">الدفع نقداً عند الاستلام (كاش)</h3>
                  <span className="text-[11px] text-emerald-600 font-bold">طلبك مؤكد ولا يتطلب أي إيصالات إلكترونية</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  سيقوم المندوب أو موظف الفرع بتحصيل المبلغ المطلوب <strong className="text-emerald-700 font-black">({order.totalAmount.toFixed(2)} ج.م)</strong> عند تسليم الحلويات طازجة إليكم.
                </p>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>حالة السداد: الدفع عند الاستلام معتمد ومسجل.</span>
                </div>
              </div>
              <a
                href={`https://wa.me/${cleanWhatsAppNumber || "201016197035"}?text=${encodeURIComponent(
                  `مرحباً إدارة لولو كب كيك 🧁 أتابع طلبي رقم ${order.publicOrderNumber} (الدفع عند الاستلام كاش بمبلغ ${order.totalAmount} ج.م)`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل مع الإدارة عبر واتساب 📲</span>
              </a>
            </div>
          )}

          {/* Paid / Verified Card */}
          {isPaidOrVerified && (
            <div className="bg-white p-6 rounded-[32px] border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                  ✅
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">تم سداد وتأكيد الدفع بنجاح</h3>
                  <span className="text-[11px] text-emerald-600 font-bold">حسابك مدفوع بالكامل ومؤكد</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  تم استلام وتدقيق سداد الطلب بنجاح بمبلغ <strong className="text-emerald-700 font-black">{order.totalAmount.toFixed(2)} ج.م</strong>. طلبك يجري تجهيزه بأعلى معايير الجودة الملكية!
                </p>
              </div>
            </div>
          )}

          {/* Payment Proof Upload Card (Only shown if manual payment is unpaid or pending verification) */}
          {isManualPending && (
            <div className="bg-white p-6 rounded-[32px] border border-rose-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-base text-slate-900">إثبات سداد التحويل</h3>
              </div>

              {/* Payment Instructions Accordion */}
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  إذا اخترت الدفع عبر إنستاباي أو المحافظ الذكية، يرجى التحويل ثم رفع صورة أو لقطة شاشة للإيصال أدناه:
                </p>

                <div className="space-y-2">
                  {instructions.filter((i) => i.method !== "CASH").map((ins) => (
                    <div key={ins.method} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
                      <span className="font-bold text-xs text-slate-900 block">{ins.titleAr}</span>
                      <div className="space-y-1 text-xs">
                        {ins.fields.map((f, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-slate-500">{f.labelAr}:</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                              <span>{f.value}</span>
                              {f.copyable && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(f.value, f.labelAr)}
                                  className="p-1 text-slate-400 hover:text-slate-700 transition"
                                  title="نسخ"
                                >
                                  {copiedKey === f.labelAr ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp Receipt Forward Button */}
              <a
                href={`https://wa.me/${cleanWhatsAppNumber || "201016197035"}?text=${encodeURIComponent(
                  `مرحباً إدارة لولو كب كيك 🧁 أود إرسال إيصال سداد طلبي رقم ${order.publicOrderNumber} بمبلغ ${order.totalAmount} ج.م`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الإيصال للإدارة عبر واتساب مباشرة 📲</span>
              </a>

              {/* Upload Form */}
              <form onSubmit={handleUploadProof} className="space-y-3 pt-2 border-t border-rose-100">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">ملف الإيصال (صورة أو PDF بحد أقصى 5MB) *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    required
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-700 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500 file:text-white hover:file:bg-rose-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">اسم المُحوِّل</label>
                    <input
                      type="text"
                      placeholder="اسم صاحب الحساب"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">هاتف المُحوِّل</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="010XXXXXXXX"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs text-right focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">الرقم المرجعي</label>
                    <input
                      type="text"
                      placeholder="رقم العملية..."
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                </div>

                {uploadSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>تم استلام إيصال السداد بنجاح وبانتظار تدقيق واعتماد الإدارة.</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !proofFile}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري رفع وتوثيق الإيصال...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-white" />
                      <span>إرسال إيصال السداد للمراجعة الفورية</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  * رفع الإيصال لا يعني السداد الفوري، حيث يتم تدقيقه بواسطة إدارة المتجر قبل تغيير حالة الدفع إلى (تم السداد).
                </p>
              </form>
            </div>
          )}

          {/* Customer Privacy Notice */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>خصوصية وسرية بياناتك محمية تماماً</span>
            </div>
            <p className="leading-relaxed">
              احتفظ برابط هذه الصفحة أو رمز التتبع السري للاطلاع على التحديثات في أي وقت دون الحاجة لكلمة مرور.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-black text-base text-rose-600 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>إلغاء الطلب #{order.publicOrderNumber}</span>
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              يمكنك إلغاء طلبك طالما أنه ما زال في حالة (قيد المراجعة). هل أنت متأكد من رغبتك في الإلغاء؟
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">سبب الإلغاء (اختياري):</label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="أخبرنا بسبب الإلغاء لمساعدتنا في تحسين الخدمة..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black transition disabled:opacity-50 shadow-sm"
                >
                  {cancelling ? "جاري الإلغاء..." : "تأكيد إلغاء الطلب ❌"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <React.Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 font-medium">جاري تحميل بيانات الطلب...</div>}>
      <OrderTrackingContent />
    </React.Suspense>
  );
}
