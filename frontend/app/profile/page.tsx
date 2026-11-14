"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Clock, 
  Calendar, 
  LogOut, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, loading: authLoading, logout, updateProfile } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || "");
      setEditPhone(profile.phone || "");
      setEditAddress(profile.address || "");
      setEditAvatar(profile.avatarUrl || user?.avatarUrl || "");
    }
  }, [profile, user]);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg(null);
    try {
      await updateProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        avatarUrl: editAvatar.trim() || undefined,
      });
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "فشل تحديث البيانات");
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">مكتمل ومُسلَّم ✨</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black">في الطريق للتوصيل 🛵</span>;
      case "READY":
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black">جاهز للاستلام 🎀</span>;
      case "PREPARING":
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">قيد الخَبز والتحضير 🍰</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 text-[11px] font-black">مؤكد ومجدول 🧁</span>;
      case "CANCELLED":
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black">قيد المراجعة</span>;
    }
  };

  const orders = profile?.recentOrders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 rounded-[36px] p-6 sm:p-10 text-white shadow-xl shadow-pink-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black shadow-inner overflow-hidden">
              {(profile?.avatarUrl || user?.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={(profile?.avatarUrl || user?.avatarUrl) || ""} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                user.fullName ? user.fullName.charAt(0) : "🌸"
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="absolute -bottom-1 -left-1 w-7 h-7 bg-white text-pink-600 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition border border-pink-100"
              title="تغيير صورة الحساب"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-black tracking-wider uppercase border border-white/20">
                VIP Member
              </span>
            </div>
            <p className="text-pink-100 text-xs sm:text-sm mt-0.5">
              أهلاً بك في حسابك الشخصي لدى متجر <span className="font-bold">Lolo Cupcakes</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2.5 rounded-2xl bg-white text-pink-600 hover:bg-pink-50 text-xs font-black shadow-sm transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{editing ? "إلغاء التعديل" : "تعديل البيانات"}</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-black border border-white/30 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>تم تحديث وحفظ بياناتك الشخصية بنجاح! ✨</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: User Info & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card / Edit Form (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-pink-100 shadow-sm space-y-6">
            <h3 className="font-black text-base text-slate-900 border-b border-pink-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-pink-500" />
              <span>البيانات الشخصية</span>
            </h3>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                {/* Avatar Picker & Preview */}
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-3">
                  <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-pink-500" />
                    <span>صورة البروفايل الشخصية:</span>
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-pink-200 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                      {editAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editAvatar} alt="معاينة" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-pink-200 hover:border-pink-400 text-pink-600 font-bold transition shadow-2xs text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>اختيار صورة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                setErrorMsg("حجم الصورة يجب ألا يتجاوز 2 ميجابايت");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  setEditAvatar(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      
                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar("")}
                          className="block text-[11px] text-rose-500 hover:underline font-bold"
                        >
                          إزالة الصورة
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان التوصيل المفضل:</label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="مثال: المعادي، شارع 9، عمارة 15..."
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition disabled:opacity-50 shadow-sm"
                  >
                    {saveLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">الاسم:</span>
                    <span className="font-black text-slate-900">{user.fullName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">البريد الإلكتروني:</span>
                    <span className="font-bold text-slate-900" dir="ltr">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">رقم الهاتف:</span>
                    <span className="font-bold text-slate-900" dir="ltr">{user.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">عنوان التوصيل المعتمد:</span>
                    <span className="font-medium text-slate-800">
                      {profile?.address || "لم يتم تعيين عنوان مفضل بعد"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 rounded-[32px] border border-pink-100 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-pink-600 font-black">
              <Sparkles className="w-4 h-4" />
              <span>مساعدة ودعم فوري</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              هل لديك أي استفسار حول طلبك أو ترغب في تعديل تفاصيل كعكة مخصصة؟ فريق خدمة العملاء متاح دائماً.
            </p>
            <a
              href="https://wa.me/201069915609?text=مرحباً%20لولو%20كب%20كيك%20🧁%20أنا%20عميل%20مسجل%20ولدي%20استفسار"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب سريعة</span>
            </a>
          </div>
        </div>

        {/* Right Column: Order History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-pink-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-pink-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-500" />
                <h3 className="font-black text-base text-slate-900">سجل طلباتي السابقة</h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs font-black">
                  {orders.length}
                </span>
              </div>

              <Link
                href="/shop"
                className="text-xs font-black text-pink-600 hover:text-pink-700 transition flex items-center gap-1"
              >
                <span>طلب حلويات جديدة</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 flex items-center justify-center text-pink-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm text-slate-800">لا توجد طلبات مسجلة حتى الآن</h4>
                  <p className="text-xs text-slate-400">
                    استكشف قائمة الحلويات الفاخرة واختر الكب كيك المفضل لديك الآن!
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 text-white text-xs font-black shadow-md hover:brightness-105 transition"
                >
                  <span>تصفح قائمة الحلويات 🧁</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-pink-100/80 bg-gradient-to-br from-white via-pink-50/20 to-sky-50/20 hover:border-pink-300 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{order.publicOrderNumber}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.scheduledForDate}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{order.scheduledForTimeRange}</span>
                        </span>
                      </div>

                      {getStatusBadge(order.orderStatus)}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="font-bold">طريقة الاستلام:</span>
                          <span className="font-black text-pink-600">
                            {order.fulfillmentType === "DELIVERY" ? "توصيل للمنزل 🛵" : "استلام من الفرع 🏪"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          طريقة الدفع: {order.paymentMethod === "CASH" ? "نقداً عند الاستلام" : "تحويل فودافون كاش / إنستاباي"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">الإجمالي:</span>
                          <span className="font-black text-sm text-pink-600">
                            {order.totalAmount.toFixed(2)} ج.م
                          </span>
                        </div>

                        <Link
                          href={`/orders/${order.publicOrderNumber}?token=${order.trackingToken}`}
                          className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 font-bold text-xs transition flex items-center gap-1 shadow-xs"
                        >
                          <span>تتبع</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
