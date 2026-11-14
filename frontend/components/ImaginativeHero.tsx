"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  Cake, 
  Truck, 
  Clock, 
  ArrowLeft, 
  Star, 
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import confetti from "canvas-confetti";
import { playJoyfulChime } from "@/lib/soundFx";
import { useStoreSettings } from "@/components/StoreSettingsContext";

const DEFAULT_HERO_SLIDES = [
  {
    src: "/images/hero-dessert.jpg",
    title: "تشكيلة المناسبات والاحتفالات الملكية",
    tag: "الأكثر طلباً ★",
    sub: "مخبوزة طازجة اليوم بحرفية فندقية",
  },
  {
    src: "/placeholders/cake-1.jpg",
    title: "تورتات الشوكولاتة والتوت البري الفاخرة",
    tag: "تورتات فاخرة 🎂",
    sub: "شوكولاتة بلجيكية 70% وزبدة نيوزيلندية",
  },
  {
    src: "/placeholders/cupcake-1.jpg",
    title: "كب كيك الفراولة والفانيليا الفرنسية",
    tag: "طازج يومياً 🍓",
    sub: "قوام مخملي هش وخفيف",
  },
  {
    src: "/placeholders/gateau-1.jpg",
    title: "قطع الجاتوه وحلويات النخبة الفاخرة",
    tag: "حلويات النخبة ✨",
    sub: "مثالية للمناسبات وتجمعات العائلة",
  },
  {
    src: "/images/custom-cake-hero.jpg",
    title: "تورتات الأفراح والمناسبات الخاصة 3D",
    tag: "تفصيل خاص 👑",
    sub: "تصميم متقن حسب رغبتكم بالكامل",
  },
];

export default function ImaginativeHero() {
  const { heroTitle, heroSubtitle, heroBadge } = useStoreSettings();
  const [activeTopping, setActiveTopping] = useState<string>("all");
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Hero Carousel State (User Request: مجموعة من الصور بتتغير كل كام ثانية والادمن ليه تحكم فيها)
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("store_hero_slides");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isCarouselHovered, slides.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMouseTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseTilt({ x: 0, y: 0 });
  }, []);

  const handleToppingClick = (toppingId: string) => {
    setActiveTopping(toppingId);
    playJoyfulChime();
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#FF5E8E", "#38BDF8", "#F472B6", "#7DD3FC", "#FDE047"],
      });
    } catch {
      // Ignore
    }
  };

  const ingredients = [
    { id: "strawberry", label: "فراولة طازجة 🍓", desc: "منتقاة يومياً بأعلى نضارة" },
    { id: "chocolate", label: "شوكولاتة بلجيكية 🍫", desc: "كاكاو فاخر 70% نقي" },
    { id: "butter", label: "زبدة نيوزيلندية 🧈", desc: "قوام مخملي طبيعي 100%" },
    { id: "sparkles", label: "تزيين فني يدوي ✨", desc: "حرفية فندقية راقية" },
  ];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12 select-none"
    >
      <div className="relative rounded-3xl sm:rounded-[44px] glass-dream p-5 sm:p-14 lg:p-16 border-2 border-pink-200/70 dark:border-pink-900/40 shadow-2xl overflow-hidden">
        
        {/* Soft Ambient Radial Lights Inside the Hero Frame */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-pink-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-sky-300/30 to-sky-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-pink-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center relative z-10">
          
          {/* Right Column: Hero Content & Typography */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-right">
            
            {/* Top Playful Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black bg-white/95 dark:bg-slate-800/90 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 shadow-sm hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
              <span>{heroBadge || "حلويات وتورتات طازجة تُخبز بكل حب يومياً في القاهرة"}</span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-6xl lg:text-[62px] font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight">
              {heroTitle || (
                <>
                  طعم الفرحة والسعادة <br />
                  <span className="pink-blue-gradient-text">في كل لحظة واحتفال</span>
                </>
              )}
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
              {heroSubtitle || "كب كيك هش، تورتات مناسبات وأفراح بتصميمات خيالية ثلاثية الأبعاد تليق بأحبابكم، وقطع جاتوه وحلويات شرقية وغربية طازجة بأجود المكونات الطبيعية والزبدة النيوزيلندية النقية."}
            </p>

            {/* Interactive Ingredient Pills */}
            <div className="pt-1">
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 block mb-2">
                اضغط لاكتشاف سر مذاقنا الطبيعي 100%:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {ingredients.map((ing) => {
                  const isSelected = activeTopping === ing.id;
                  return (
                    <button
                      key={ing.id}
                      onClick={() => handleToppingClick(ing.id)}
                      className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-black transition-all duration-200 border ${
                        isSelected
                          ? "bg-gradient-to-r from-pink-500 to-sky-500 text-white border-transparent shadow-md scale-105"
                          : "bg-white/90 dark:bg-slate-800/90 hover:bg-pink-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-pink-200/80 dark:border-slate-700 shadow-sm"
                      }`}
                    >
                      {ing.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs font-extrabold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 border border-pink-100 dark:border-pink-900/40 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:border-pink-300 transition">
                <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span>طبيعية 100% بدون إضافات</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:border-sky-300 transition">
                <Clock className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>مواعيد تسليم دقيقة بالساعة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 border border-pink-100 dark:border-pink-900/40 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:border-pink-300 transition">
                <Truck className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span>توصيل مبرد وسريع</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <Link 
                href="/shop?availability=IN_STOCK"
                className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 text-white font-black text-sm shadow-xl shadow-pink-200 dark:shadow-none hover:shadow-sky-300 hover:brightness-105 active:scale-95 btn-pop transition flex items-center gap-3 group"
              >
                <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span>تسليم فوري من الستوك اليوم</span>
                <ArrowLeft className="w-4 h-4 text-white/90 group-hover:-translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/custom-cake"
                className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300 font-black text-sm hover:bg-sky-50 dark:hover:bg-slate-700 btn-pop transition flex items-center gap-3 shadow-sm"
              >
                <Cake className="w-5 h-5 text-sky-500" />
                <span>صمم تورتتك الخاصة 3D</span>
              </Link>

              <Link 
                href="/shop"
                className="text-xs font-black text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition flex items-center justify-center gap-1.5 px-3 py-2"
              >
                <span>استكشف القائمة كاملة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Left Column: 3D Interactive Dessert Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div 
              className="relative mx-auto max-w-md lg:max-w-none transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`,
              }}
            >
              
              {/* Main Showcase Image Frame with Dynamic Multi-Image Carousel */}
              <div 
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
                className="relative rounded-[32px] sm:rounded-[36px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 group transition-all duration-500"
              >
                <div className="relative aspect-[4/3] sm:aspect-square w-full bg-gradient-to-br from-pink-50 to-sky-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                  {slides.map((s, idx) => (
                    <div
                      key={s.src + idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        idx === activeSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                      }`}
                    >
                      <Image
                        src={s.src}
                        alt={s.title}
                        fill
                        priority={idx === 0}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                    </div>
                  ))}

                  {/* Manual Arrow Controls */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-md"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide((prev) => (prev + 1) % slides.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-md"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    {slides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveSlide(dotIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === activeSlide ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`الشريحة ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 left-3 sm:left-4 z-20 p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-100 dark:border-pink-900/40 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate max-w-[170px] sm:max-w-xs">
                      {slides[activeSlide]?.title || "تشكيلة المناسبات والاحتفالات"}
                    </span>
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 block font-bold">
                      {slides[activeSlide]?.sub || "مخبوزة طازجة اليوم بحرفية"}
                    </span>
                  </div>
                  <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 text-white font-black text-[11px] sm:text-xs shadow-sm flex-shrink-0">
                    {slides[activeSlide]?.tag || "الأكثر طلباً ★"}
                  </span>
                </div>
              </div>

              {/* Floating Top Rating Badge (Hidden on mobile to prevent overflow) */}
              <div className="hidden sm:flex absolute -top-5 -right-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3.5 rounded-2xl border border-pink-100 dark:border-pink-900/40 shadow-xl items-center gap-3 animate-float-gentle">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-700 flex items-center justify-center text-amber-500 shadow-inner">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-black text-sm">
                    <span>4.9</span>
                    <span className="text-[10px] text-slate-400 font-semibold">(2,500+ تقييم)</span>
                  </div>
                  <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold block">أعلى تقييم بالرضا</span>
                </div>
              </div>

              {/* Floating Bottom Delivery Badge (Hidden on mobile to prevent overflow) */}
              <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/40 shadow-xl items-center gap-3 animate-float-reverse">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-700 flex items-center justify-center text-sky-500">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">توصيل مبرد سريع</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">سيارات مخصصة لحفظ الكيك</span>
                </div>
              </div>

              {/* Mobile Micro Trust Strip (Clean & integrated) */}
              <div className="flex sm:hidden items-center justify-around gap-2 pt-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">⭐ 4.9 تقييم ممتاز</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1">🛵 توصيل مبرد بالساعة</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
