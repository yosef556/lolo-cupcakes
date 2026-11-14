"use client";

import React, { useState } from "react";
import { X, Send, ChevronUp, ChevronDown, Sparkles, MessageCircle, Phone, Cake, Zap, PackageCheck } from "lucide-react";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { playJoyfulChime } from "@/lib/soundFx";

export default function ChefLoloMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const { cleanWhatsAppNumber, storePhone } = useStoreSettings();

  const handleOpenWhatsApp = (customMessage?: string) => {
    playJoyfulChime();
    const phone = cleanWhatsAppNumber || "201016197035";
    const msg = encodeURIComponent(
      customMessage || "مرحباً بكم، أود الاستفسار عن الحلويات والتورتات المتاحة اليوم في لولو كب كيك 🌸"
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none pointer-events-auto">
      
      {/* Expanded Sweet Pastel Concierge Drawer */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] border-2 border-pink-200 shadow-2xl p-5 max-w-xs sm:max-w-sm w-full space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300 text-right text-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-sky-400 p-[2px] shadow-md shadow-pink-200">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-500 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">مساعد لولو كب كيك الذكي</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-extrabold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل الآن • خدمة عملاء المعادي والقاهرة</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            أهلاً بك في لولو كب كيك! 🧁 يسعدنا مساعدتك في اختيار وتفصيل تورتتك أو حجز طلبك الفوري الآن:
          </p>

          {/* Quick Actions List */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOpenWhatsApp("مرحباً، أود تفصيل تورتة خاصة لمناسبة قادمة وحساب التكلفة التقريبية 🎂")}
              className="w-full p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100/70 border border-pink-200/80 text-xs font-black text-slate-800 transition flex items-center justify-between text-right group"
            >
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-pink-500" />
                <span>تفصيل تورتة خاصة لمناسبة أو فرح</span>
              </div>
              <Send className="w-3.5 h-3.5 text-pink-500 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenWhatsApp("مرحباً، أود معرفة الحلويات المتاحة للتسليم الفوري اليوم بالمعادي ⚡")}
              className="w-full p-2.5 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/80 text-xs font-black text-slate-800 transition flex items-center justify-between text-right group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-500" />
                <span>أصناف الستوك المتاحة للتسليم الفوري الآن</span>
              </div>
              <Send className="w-3.5 h-3.5 text-sky-500 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenWhatsApp("مرحباً، أود الاستفسار عن حالة وتاريخ تسليم طلبي القائم في لولو كب كيك 📦")}
              className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 transition flex items-center justify-between text-right group"
            >
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-purple-500" />
                <span>متابعة موعد أو حالة طلب قائم</span>
              </div>
              <Send className="w-3.5 h-3.5 text-purple-500 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Direct Call Option */}
          <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold">
              <Phone className="w-3.5 h-3.5 text-sky-500" />
              <span>اتصال هاتفي مباشر:</span>
            </span>
            <a href={`tel:${(storePhone || "01069915609").replace(/\s+/g, '')}`} dir="ltr" className="font-black text-pink-600 hover:text-pink-700 transition">
              {storePhone || "010 6991 5609"}
            </a>
          </div>
        </div>
      )}

      {/* Floating Concierge Pill Button */}
      <button
        type="button"
        onClick={() => {
          playJoyfulChime();
          setIsOpen(!isOpen);
        }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 text-white shadow-xl shadow-pink-200 hover:shadow-sky-300 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/60"
      >
        {/* Animated Icon Avatar */}
        <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
          <MessageCircle className="w-4 h-4 text-pink-500" />
        </div>

        {/* Text */}
        <div className="text-right hidden sm:block">
          <span className="text-xs font-black block text-white leading-tight">مساعد لولو</span>
          <span className="text-[9px] text-sky-100 block font-bold">تواصل مباشر</span>
        </div>

        {/* Pulse Dot */}
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

        {/* Toggle Icon */}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-white/80" /> : <ChevronUp className="w-3.5 h-3.5 text-white/80" />}
      </button>
    </div>
  );
}
