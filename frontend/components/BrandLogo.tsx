"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { Sparkles } from "lucide-react";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  showText = true,
  href,
  className = "",
}: BrandLogoProps) {
  const { storeLogoUrl } = useStoreSettings();
  const [activeLogo, setActiveLogo] = useState<string>("/logo.png");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem("store_logo_url") : null;
    const effective = storeLogoUrl?.trim() || local?.trim() || "/logo.png";
    setActiveLogo(effective);
    setImageError(false);
  }, [storeLogoUrl]);

  const sizeClasses = {
    xs: { box: "w-8 h-8", text: "text-sm", sub: "text-[8px]" },
    sm: { box: "w-10 h-10", text: "text-base", sub: "text-[9px]" },
    md: { box: "w-12 h-12", text: "text-xl", sub: "text-[10px]" },
    lg: { box: "w-16 h-16", text: "text-2xl", sub: "text-xs" },
    xl: { box: "w-20 h-20", text: "text-3xl", sub: "text-sm" },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Logo Emblem Container */}
      <div
        className={`relative ${sizeClasses.box} rounded-full overflow-hidden border-2 border-pink-300 dark:border-pink-500/50 shadow-md bg-white flex-shrink-0 group-hover:scale-105 transition-all duration-300 ring-2 ring-pink-100 dark:ring-pink-900/30 flex items-center justify-center p-0.5`}
      >
        {!imageError && activeLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeLogo}
            alt="Lolo Cupcakes Logo"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-pink-500 via-rose-400 to-[#89cff0] flex items-center justify-center text-white font-serif font-black">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-200" />
          </div>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col items-start text-right">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`${sizeClasses.text} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 dark:from-pink-400 dark:via-rose-300 dark:to-sky-400`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Lolo Cupcakes
            </span>
            <span className="hidden sm:inline-block text-[8px] px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-extrabold border border-pink-200 dark:border-pink-800 uppercase tracking-wider">
              Atelier
            </span>
          </div>
          <span className={`${sizeClasses.sub} text-slate-400 dark:text-slate-400 font-bold tracking-[0.22em] uppercase font-sans -mt-0.5`}>
            Sweet Atelier • Cairo
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
