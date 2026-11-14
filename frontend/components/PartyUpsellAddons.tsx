"use client";

import React from "react";
import { Plus, Check } from "lucide-react";

export interface UpsellItem {
  id: string;
  nameAr: string;
  price: number;
  icon: string;
  description: string;
}

export const PARTY_ADDONS: UpsellItem[] = [
  { id: "addon-candle", nameAr: "شموع أرقام ذهبية مضيئة", price: 25, icon: "🕯️", description: "أرقام أعياد ميلاد براقة تناسب كافة الأعمار" },
  { id: "addon-card", nameAr: "كارت إهداء ملكي بخط اليد", price: 30, icon: "💌", description: "ورق قطني فاخر يكتب فيه الشيف إهداءك الخاص" },
  { id: "addon-balloon", nameAr: "بالون هيليوم فاخر للمناسبات", price: 45, icon: "🎈", description: "بالون هيليوم يدوم طويلاً بعبارات مبهجة" },
  { id: "addon-knife", nameAr: "طقم تقطيع تورتة مذهب فاخر", price: 60, icon: "🔪", description: "سكينة وشوكة مذهبة من الستانلس ستيل الفاخر" },
  { id: "addon-sparkler", nameAr: "نافورة شرار نارية آمنة للحفلات", price: 35, icon: "🎆", description: "شعلة احتفالية آمنة تُشعل فرحة المناسبة" },
];

interface PartyUpsellAddonsProps {
  selectedAddonIds: string[];
  onToggleAddon: (addon: UpsellItem) => void;
}

export default function PartyUpsellAddons({ selectedAddonIds, onToggleAddon }: PartyUpsellAddonsProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3.5">
      
      <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🎉</span>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900">أكمل احتفالك بلحظة لا تُنسى ✨</h4>
            <span className="text-[10px] text-slate-500">إضافات حصرية وتجهيزات مناسبات بأسعار رمزية</span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          خصم خاص مع الطلب
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PARTY_ADDONS.map((item) => {
          const isSelected = selectedAddonIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggleAddon(item)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                isSelected
                  ? "bg-rose-50 border-rose-500 shadow-sm"
                  : "bg-white border-rose-100 hover:bg-rose-50/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{item.nameAr}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pr-2">
                <span className="font-black text-xs text-rose-600">+{item.price} ج.م</span>
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                    isSelected ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
