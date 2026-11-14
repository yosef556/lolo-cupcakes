"use client";

import React, { useState, useEffect } from "react";
import { Crown, Check, Gift } from "lucide-react";

interface LoyaltyPointsWidgetProps {
  onApplyPointsDiscount: (discountAmount: number) => void;
  orderSubtotal: number;
}

export default function LoyaltyPointsWidget({ onApplyPointsDiscount, orderSubtotal }: LoyaltyPointsWidgetProps) {
  const [points, setPoints] = useState<number>(140);
  const [isRedeemed, setIsRedeemed] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("lolo_loyalty_points");
    if (saved) {
      setPoints(parseInt(saved) || 140);
    } else {
      localStorage.setItem("lolo_loyalty_points", "140");
    }
  }, []);

  const handleToggleRedeem = () => {
    if (isRedeemed) {
      setIsRedeemed(false);
      onApplyPointsDiscount(0);
    } else {
      if (points < 100) {
        alert("تحتاج إلى 100 نقطة على الأقل لاستبدالها بخصم نقدي");
        return;
      }
      setIsRedeemed(true);
      onApplyPointsDiscount(50); // 100 points = 50 EGP discount
    }
  };

  const potentialEarnedPoints = Math.floor(orderSubtotal / 10);

  return (
    <div className="bg-gradient-to-br from-amber-50/80 via-white to-rose-50/40 p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3.5 text-slate-800">
      
      <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-sm">
            <Crown className="w-4 h-4 fill-slate-900" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900">نادي لولو للمكافآت الملكية (VIP Club) 👑</h4>
            <span className="text-[10px] text-amber-800 font-bold">عضوية فضية مميزة • تكسب نقاطاً مع كل طلب</span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-white text-amber-700 text-xs font-black border border-amber-300 shadow-sm">
          {points} نقطة
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-800 block">استبدال 100 نقطة بخصم 50 ج.م فوري:</span>
          <span className="text-[10px] text-slate-500 block">
            ستحصل أيضاً على +{potentialEarnedPoints} نقطة إضافية عند إتمام هذا الطلب ✨
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleRedeem}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
            isRedeemed
              ? "bg-emerald-600 text-white"
              : "bg-amber-400 hover:bg-amber-500 text-slate-900"
          }`}
        >
          {isRedeemed ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>تم تفعيل خصم 50 ج.م</span>
            </>
          ) : (
            <>
              <Gift className="w-3.5 h-3.5" />
              <span>استبدال النقاط الآن</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
