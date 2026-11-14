"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function BrandWatermark() {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for user uploaded custom logo
    const saved = localStorage.getItem("store_logo_url");
    if (saved) {
      setCustomLogo(saved);
    }

    const handleStorage = () => {
      const updated = localStorage.getItem("store_logo_url");
      if (updated) setCustomLogo(updated);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Seamless Repeating Luxury Monogram Pattern (SVG Tilted Watermark) */}
      <div 
        className="absolute inset-0 opacity-[0.032] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF1A53' fill-opacity='1' transform='rotate(-22 120 120)'%3E%3Cpath d='M120 50 C110 50 102 58 102 68 C94 69 88 76 88 84 C88 94 96 102 106 103 L106 122 C106 125 109 128 112 128 L128 128 C131 128 134 125 134 122 L134 103 C144 102 152 94 152 84 C152 76 146 69 138 68 C138 58 130 50 120 50 Z M120 38 C122.5 38 124.5 36 124.5 33.5 C124.5 31 120 25 120 25 C120 25 115.5 31 115.5 33.5 C115.5 36 117.5 38 120 38 Z'/%3E%3Ctext x='120' y='152' font-family='Arial, sans-serif' font-weight='900' font-size='13' text-anchor='middle' letter-spacing='2'%3ELOLO CUPCAKES%3C/text%3E%3Ctext x='120' y='168' font-family='Arial, sans-serif' font-weight='700' font-size='8' text-anchor='middle' letter-spacing='3'%3EHAUTE P%C3%82TISSERIE%3C/text%3E%3Ctext x='120' y='182' font-family='Arial, sans-serif' font-weight='700' font-size='8' text-anchor='middle'%3E%D9%84%D9%88%D9%84%D9%88 %D9%83%D8%A8 %D9%83%D9%8A%D9%83%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />

      {/* 2. Custom User Logo Watermark Overlay (If uploaded) */}
      {customLogo && (
        <div className="absolute -top-10 -left-10 w-[420px] h-[420px] opacity-[0.035] filter grayscale contrast-150 rotate-[-12deg]">
          <Image
            src={customLogo}
            alt=""
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* 3. Large Decorative Watermark Monogram Seals (Corner & Center Ambiance) */}
      <div className="absolute top-[25%] -right-24 w-96 h-96 rounded-full border-[3px] border-dashed border-rose-300/20 opacity-40 flex items-center justify-center rotate-12">
        <div className="w-80 h-80 rounded-full border border-rose-400/20 flex flex-col items-center justify-center text-rose-500/10">
          <span className="text-8xl font-black font-serif">LC</span>
          <span className="text-xs font-bold uppercase tracking-[0.4em]">Cairo • Pâtisserie</span>
        </div>
      </div>

      <div className="absolute top-[68%] -left-20 w-[450px] h-[450px] rounded-full border-[2px] border-rose-300/15 opacity-40 flex items-center justify-center -rotate-12">
        <div className="w-[380px] h-[380px] rounded-full border border-dashed border-rose-400/20 flex flex-col items-center justify-center text-rose-500/10">
          <span className="text-9xl font-black font-serif">LC</span>
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Artisanal Bakery 2026</span>
        </div>
      </div>
    </div>
  );
}
