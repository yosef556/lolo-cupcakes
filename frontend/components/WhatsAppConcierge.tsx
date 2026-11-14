"use client";

import React, { useState } from "react";
import { MessageCircle, X, Sparkles, Send, Cake, Clock } from "lucide-react";
import { useStoreSettings } from "@/components/StoreSettingsContext";

export default function WhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");
  const { cleanWhatsAppNumber } = useStoreSettings();

  const phoneNumber = cleanWhatsAppNumber || "201016197035";

  const handleSendWhatsApp = (customText?: string) => {
    const textToSend = customText || quickMsg || "مرحباً لولو كب كيك، أود الاستفسار عن الحلويات والتورتات المتاحة اليوم 🧁";
    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3 select-none">
      
      {/* Expanded Quick Inquiry Modal */}
      {isOpen && (
        <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl p-5 max-w-xs sm:max-w-sm w-full space-y-4 animate-in slide-in-from-bottom-5 duration-300 text-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">مساعد لولو كب كيك الفوري 🧁</h4>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل الآن • يرد في دقائق</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="إغلاق المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            أهلاً بك! يمكنك مراسلتنا فوراً عبر واتساب لأي استفسار أو تفصيل تورتة خاصة أو تأكيد حجزك.
          </p>

          {/* Quick Questions Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block">استفسارات سريعة شائعة:</span>
            
            <button
              type="button"
              onClick={() => handleSendWhatsApp("مرحباً، أود تفصيل تورتة خاصة لمناسبة قريبة 🎂")}
              className="w-full text-right p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 text-xs font-bold transition flex items-center justify-between border border-rose-200/60"
            >
              <span className="flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-rose-500" />
                <span>أود تفصيل تورتة خاصة لمناسبة</span>
              </span>
              <Send className="w-3 h-3 text-rose-400 rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => handleSendWhatsApp("مرحباً، هل متاح توصيل سريع لنفس اليوم؟ 🛵")}
              className="w-full text-right p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 text-xs font-bold transition flex items-center justify-between border border-rose-200/60"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>هل متاح توصيل سريع لنفس اليوم؟</span>
              </span>
              <Send className="w-3 h-3 text-rose-400 rotate-180" />
            </button>
          </div>

          {/* Direct Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="اكتب رسالتك للشيف مباشرة..."
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendWhatsApp()}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleSendWhatsApp()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center flex-shrink-0"
              title="إرسال عبر واتساب"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-400">
            سيتم فتح محادثة رسمية آمنة ومشفرة على تطبيق واتساب
          </div>
        </div>
      )}

      {/* Main Floating Pulse Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="تواصل معنا عبر واتساب"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>

        <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">محادثة الشيف الفورية 💬</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

    </div>
  );
}
