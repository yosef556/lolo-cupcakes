"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { playJoyfulChime } from "@/lib/soundFx";

interface PreloaderGateProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function PreloaderGate({ onComplete, forceShow = false }: PreloaderGateProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    const hasVisited = typeof window !== "undefined" ? sessionStorage.getItem("lolo_preloader_seen") : null;
    if (hasVisited && !forceShow) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            playJoyfulChime();
            setFadeout(true);
            setTimeout(() => {
              setVisible(false);
              sessionStorage.setItem("lolo_preloader_seen", "true");
              onComplete?.();
            }, 500);
          }, 200);
          return 100;
        }
        const increment = prev < 50 ? 5 : prev < 85 ? 8 : 12;
        return Math.min(prev + increment, 100);
      });
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete, forceShow]);

  const handleSkip = () => {
    playJoyfulChime();
    setFadeout(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("lolo_preloader_seen", "true");
      onComplete?.();
    }, 250);
  };

  if (!visible) return null;

  const getStatusText = () => {
    if (progress < 35) return "انتقاء المكونات الطبيعية والزبدة النيوزيلندية الفاخرة...";
    if (progress < 70) return "إعداد الأفران وتجهيز الحشوات اللذيذة...";
    if (progress < 95) return "تزيين الكب كيك والكعكات المخملية بلمسة حب خاصة...";
    return "أهلاً بكم في عالم لولو كب كيك!";
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-3xl text-slate-800 transition-all duration-600 select-none ${
        fadeout ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Ambient Glow Behind Gate */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-300/30 to-sky-300/30 rounded-full blur-[100px]" />

      <div className="relative flex flex-col items-center text-center max-w-md w-full px-6 space-y-8 z-10">
        
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-400 via-rose-400 to-sky-400 p-[3px] shadow-xl shadow-pink-200/50 animate-bounce">
            <div className="w-full h-full bg-white rounded-[21px] flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-2">
          <span className="text-xs font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            أشهى الحلويات والتورتات في القاهرة
          </span>
          <h2 className="text-3xl sm:text-4xl font-black pink-blue-gradient-text tracking-tight">
            لـولـو كـب كـيـك
          </h2>
          <p className="text-xs text-slate-500 font-bold transition-all duration-300 min-h-[1.5rem]">
            {getStatusText()}
          </p>
        </div>

        {/* Sweet Pastel Progress Bar */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-pink-600 tracking-wider">{progress}%</span>
            <span className="text-slate-400 text-[11px]">جاري تجهيز المتجر</span>
          </div>

          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-pink-100">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-sky-400 rounded-full transition-all duration-150 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip Action */}
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-pink-200 text-xs font-black transition shadow-sm hover:scale-105"
        >
          <span>تخطي والدخول الآن</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-6 text-[11px] text-slate-400 font-bold">
        المعادي • القاهرة والجيزة | استلام فوري وشحن مبرد
      </div>
    </div>
  );
}
