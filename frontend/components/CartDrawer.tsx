"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { useStoreSettings } from "./StoreSettingsContext";
import { X, Trash2, ShoppingBag, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, removeFromCart } = useCart();
  const { minOrderAmount } = useStoreSettings();

  if (!isDrawerOpen) return null;

  const getItemImage = (productNameAr: string) => {
    if (productNameAr?.includes("فانيليا")) return "/placeholders/cupcake-1.jpg";
    if (productNameAr?.includes("شوكولاتة")) return "/placeholders/cake-1.jpg";
    if (productNameAr?.includes("كراميل")) return "/placeholders/cupcake-2.jpg";
    if (productNameAr?.includes("فراولة")) return "/placeholders/cake-2.jpg";
    if (productNameAr?.includes("بوكس")) return "/placeholders/box-1.jpg";
    if (productNameAr?.includes("جاتوه") || productNameAr?.includes("فستق")) return "/placeholders/gateau-1.jpg";
    return "/placeholders/cupcake-1.jpg";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-r border-rose-100 animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black">سلة المشتريات اللذيذة</h2>
                <span className="text-[11px] text-white/90 block font-semibold">
                  {cart?.totalQuantity || 0} قطع مضافة
                </span>
              </div>
            </div>

            <button 
              onClick={closeDrawer}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-rose-50">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-200">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-black text-lg text-slate-900">سلتك فارغة حالياً</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    استكشف أشهى حلويات وكب كيك لولو واصنع لحظتك السعيدة اليوم
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs hover:brightness-105 active:scale-95 transition shadow-sm"
                >
                  تصفح قائمة الحلويات 🍰
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const img = getItemImage(item.productNameAr);
                return (
                  <div key={item.id} className="py-4 flex gap-4 items-start group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative flex-shrink-0 border border-rose-200 shadow-sm bg-rose-50">
                      <Image
                        src={img}
                        alt={item.productNameAr}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-sm truncate">{item.productNameAr}</h3>
                      {item.variantNameAr && (
                        <p className="text-xs text-rose-600 font-bold">{item.variantNameAr}</p>
                      )}
                      
                      {item.optionDescriptions?.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {item.optionDescriptions.join(" • ")}
                        </p>
                      )}
                      
                      {item.addonDescriptions?.length > 0 && (
                        <p className="text-[11px] text-amber-600 font-bold mt-0.5 truncate">
                          + {item.addonDescriptions.join(" • ")}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs text-slate-500 font-medium">
                          العدد: <strong className="text-slate-900 font-black">{item.quantity}</strong>
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-sm text-rose-600">
                            {item.lineTotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition self-center"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart && cart.items.length > 0 && (
            <div className="p-6 bg-gradient-to-b from-white to-rose-50/50 border-t border-rose-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">المجموع المبدئي</span>
                  <span className="text-[10px] text-slate-400 font-bold">غير شامل رسوم التوصيل والخصم</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rose-600">
                    {cart.subtotal.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">ج.م</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>الأسعار والإجماليات معتمدة ومحسوبة مباشرة من السيرفر</span>
              </div>

              {cart.subtotal < minOrderAmount ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center justify-between font-black mb-1.5">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>الحد الأدنى للطلب: {minOrderAmount} ج.م</span>
                      </span>
                      <span className="text-amber-700">متبقي {(minOrderAmount - cart.subtotal).toFixed(2)} ج.م</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((cart.subtotal / minOrderAmount) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed text-center"
                  >
                    أضف المزيد للوصول للحد الأدنى ({minOrderAmount} ج.م)
                  </button>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-black text-sm shadow-rose-glow hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <span>متابعة إتمام الطلب كزائر 🍰</span>
                  <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
