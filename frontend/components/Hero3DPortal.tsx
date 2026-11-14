"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { Sparkles, ArrowDown, ChevronLeft, X, Clock } from "lucide-react";
import { playJoyfulChime, playWhooshSound } from "@/lib/soundFx";

interface Hero3DPortalProps {
  onExploreShop?: () => void;
}

export default function Hero3DPortal({ onExploreShop }: Hero3DPortalProps) {
  const [isWarping, setIsWarping] = useState(false);
  const [warpStep, setWarpStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const portalCanvasRef = useRef<HTMLCanvasElement>(null);
  const warpCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Effect for 3D Perspective Stage
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  // 1. Interactive 3D Portal Vortex Canvas inside the Hero Door
  useEffect(() => {
    const canvas = portalCanvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 4.5;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Golden & Champagne Luxury Stardust Galaxy
      const particleCount = 280;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorPalette = [
        new THREE.Color(0xd4af37), // Pure Gold
        new THREE.Color(0xc5a059), // Champagne Gold
        new THREE.Color(0xd98880), // Rose Gold
        new THREE.Color(0xfff7ed), // Warm Cream
        new THREE.Color(0xe0d0c8), // Silk
      ];

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2.4 + 0.2;
        const z = (Math.random() - 0.5) * 5;

        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = Math.sin(theta) * radius;
        positions[i * 3 + 2] = z;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        particles.rotation.z += 0.005;
        particles.rotation.y += 0.002;

        const pos = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 2] += 0.018;
          if (pos[i * 3 + 2] > 2.5) {
            pos[i * 3 + 2] = -2.5;
          }
        }
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!canvas) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch {
      // Graceful fallback
    }
  }, []);

  // 2. Full-Screen 3D Fly-Through Warp Experience
  useEffect(() => {
    if (!isWarping) return;
    const canvas = warpCanvasRef.current;
    if (!canvas) return;

    let warpAnimId: number;
    let warpRenderer: THREE.WebGLRenderer;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 20;

      warpRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      warpRenderer.setSize(window.innerWidth, window.innerHeight);
      warpRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const starCount = 900;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      const palette = [
        new THREE.Color(0xd4af37),
        new THREE.Color(0xc5a059),
        new THREE.Color(0xd98880),
        new THREE.Color(0xffffff),
      ];

      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 45;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
        starPos[i * 3 + 2] = Math.random() * 80 - 40;

        const col = palette[Math.floor(Math.random() * palette.length)];
        starColors[i * 3] = col.r;
        starColors[i * 3 + 1] = col.g;
        starColors[i * 3 + 2] = col.b;
      }

      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.16,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      const starTunnel = new THREE.Points(starGeo, starMat);
      scene.add(starTunnel);

      const animateWarp = () => {
        warpAnimId = requestAnimationFrame(animateWarp);
        const positions = starGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < starCount; i++) {
          positions[i * 3 + 2] += 0.85;
          if (positions[i * 3 + 2] > 25) {
            positions[i * 3 + 2] = -45;
          }
        }
        starGeo.attributes.position.needsUpdate = true;
        starTunnel.rotation.z += 0.004;

        warpRenderer.render(scene, camera);
      };

      animateWarp();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        warpRenderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(warpAnimId);
        window.removeEventListener("resize", handleResize);
        starGeo.dispose();
        starMat.dispose();
        warpRenderer.dispose();
      };
    } catch {
      // Graceful fallback
    }
  }, [isWarping]);

  const handleStartWarp = () => {
    playWhooshSound();
    setIsWarping(true);
    setWarpStep(0);
  };

  const handleNextStep = () => {
    playJoyfulChime();
    if (warpStep < 2) {
      setWarpStep(warpStep + 1);
    } else {
      handleFinishWarp();
    }
  };

  const handleFinishWarp = () => {
    playJoyfulChime();
    setIsWarping(false);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#D4AF37", "#C5A059", "#D98880", "#181415", "#F7F1E5"],
      });
    } catch {
      // Ignore
    }

    const elem = document.getElementById("stock-showcase-section") || document.getElementById("products-catalog-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    } else if (onExploreShop) {
      onExploreShop();
    }
  };

  const storyStops = [
    {
      step: "01",
      subtitle: "LES INGRÉDIENTS NOBLES",
      title: "مكونات نقية 100% دون أي مساومة",
      desc: "نعتمد الزبدة النيوزيلندية الطبيعية النقية، وفانيليا بوربون مدغشقر الأصلية، والشوكولاتة البلجيكية الفاخرة لنضمن مذاقاً مخملياً لا يُضاهى في كل قطعة كب كيك وتورتة.",
    },
    {
      step: "02",
      subtitle: "L'ATELIER SUR-MESURE",
      title: "إبداع يدوي وتصميم حصري لمناسباتك",
      desc: "نصمم ونخبز كل تورتة يدوياً كقطعة فنية فريدة تعبر عن لحظتكم السعيدة، سواء كانت حفل زفاف، خطوبة، أو مناسبة عائلية تستحق أرقى وألذ احتفال.",
    },
    {
      step: "03",
      subtitle: "LIVRAISON HAUTE PRÉCISION",
      title: "تسليم فوري مبرد بنفس اليوم",
      desc: "أسطول سيارات مكيفة مخصصة لنقل الحلويات الفاخرة بدرجة حرارة محكمة، لضمان وصول التورتات والكب كيك بنفس قوام ونضارة خروجها من أفراننا بالمعادي.",
    },
  ];

  return (
    <>
      {/* ========================================================
          AWWWARDS-LEVEL 3D HERO STAGE
          ======================================================== */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[85vh] lg:min-h-[88vh] flex flex-col items-center justify-center overflow-hidden py-10 select-none"
      >
        {/* Ambient Subtle Silk Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-gradient-to-r from-[#D98880]/15 via-[#C5A059]/12 to-[#D98880]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
          
          {/* Top Luxury Seal Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold bg-white/80 border border-[#DEC9B3] text-[#7A6E71] shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-[#181415] font-black tracking-wider uppercase">L&apos;ATELIER ROYAL</span>
            <span className="text-[#DEC9B3]">•</span>
            <span className="text-[#5C5452]">دار الحلويات الملكية والكب كيك الفاخر في القاهرة</span>
          </div>

          {/* 3D TYPOGRAPHY STAGE + CENTRAL 3D GLASS PORTAL */}
          <div
            className="perspective-container w-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-12 my-2 transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 5}deg)`,
            }}
          >
            {/* Right Side: LOLO Typography */}
            <div className="order-2 lg:order-1 text-center lg:text-right space-y-1">
              <span className="block text-6xl sm:text-7xl lg:text-8xl font-black text-[#181415] tracking-tight font-serif drop-shadow-sm">
                LOLO
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-[#A84841] tracking-wider">
                لـولـو كـب كـيـك
              </span>
              <span className="text-[11px] text-[#7A6E71] tracking-[0.2em] uppercase block font-sans-luxury">
                HAUTE PÂTISSERIE • LE CAIRE
              </span>
            </div>

            {/* Central 3D Frosted Glass Portal Frame */}
            <div className="order-1 lg:order-2 relative group cursor-pointer" onClick={handleStartWarp}>
              
              {/* Outer Golden Halo Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/30 via-[#D98880]/25 to-[#C5A059]/30 rounded-[44px] blur-xl opacity-60 group-hover:opacity-100 transition duration-700" />
              
              {/* The Glass Device / Doorway */}
              <div className="relative w-64 h-84 sm:w-72 sm:h-96 rounded-[40px] bg-white/75 backdrop-blur-2xl border-2 border-white/90 shadow-[0_25px_60px_rgba(40,25,20,0.08)] p-3 flex flex-col items-center justify-between overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                
                {/* Internal Three.js Particle Vortex Canvas */}
                <canvas
                  ref={portalCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none rounded-[36px]"
                />

                {/* Top Badge */}
                <div className="relative z-10 pt-2">
                  <span className="px-3 py-1 rounded-full bg-[#181415] text-[#F5EBE6] font-bold text-[9px] uppercase tracking-[0.2em] border border-[#C5A059]/40 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                    <span>FLY INTO THE PORTAL</span>
                  </span>
                </div>

                {/* Center Monogram / Portal Focal Point */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-2 py-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-[#181415]/90 border border-[#D4AF37]/50 shadow-xl flex items-center justify-center group-hover:border-[#D4AF37] transition-colors">
                    <div className="text-center">
                      <span className="font-serif font-black text-[#D4AF37] text-2xl tracking-wider block leading-none">LC</span>
                      <span className="text-[7px] text-[#A09088] uppercase tracking-[0.2em] block mt-1">ATELIER</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#181415] tracking-tight">
                      بوابة الحلويات الملكية
                    </h3>
                    <span className="text-[10px] text-[#A84841] font-bold tracking-wider block mt-0.5">
                      انقر لخوض تجربة الاستكشاف ثلاثية الأبعاد
                    </span>
                  </div>
                </div>

                {/* Bottom Trigger Action */}
                <div className="relative z-10 pb-2 w-full px-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartWarp();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-[#181415] hover:bg-[#2D2628] text-[#F5EBE6] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C5A059]/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>ادخل العالم الملكي</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Left Side: CUPCAKES Typography */}
            <div className="order-3 text-center lg:text-left space-y-1">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-black text-[#181415] tracking-tight font-serif drop-shadow-sm">
                CUPCAKES
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-[#C5A059] tracking-wider">
                بـاتـيـسـري رفـيـع
              </span>
              <span className="text-[11px] text-[#7A6E71] tracking-[0.2em] uppercase block font-sans-luxury">
                ARTISANAL SWEET CREATIONS
              </span>
            </div>
          </div>

          {/* Editorial Tagline & Luxury Action CTA */}
          <div className="max-w-2xl mx-auto space-y-4 mt-8">
            <p className="text-sm sm:text-base text-[#4A4042] font-medium leading-relaxed">
              فن الحلويات الفرنسية الرفيعة يلتقي مع دفء الاحتفالات المصرية. نبتكر كب كيك وتورتات تخلّد أبهى مناسباتكم بأجود المكونات الطبيعية والزبدة النيوزيلندية الخالصة.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartWarp}
                className="px-7 py-3.5 rounded-2xl bg-[#181415] hover:bg-[#2D2628] text-white font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2.5 border border-[#C5A059]/40"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>ابدأ رحلة الطيران داخل البوابة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById("stock-showcase-section") || document.getElementById("products-catalog-section");
                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-[#FDF6F5] text-[#181415] font-bold text-xs sm:text-sm border border-[#DEC9B3] hover:border-[#D98880] transition shadow-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-[#C5A059]" />
                <span>تسليم فوري بالستوك اليوم (المعادي والقاهرة)</span>
              </button>
            </div>
          </div>

          {/* Scroll Down Gentle Hint */}
          <div className="mt-10 flex items-center gap-2 text-[11px] text-[#A09088] font-medium">
            <span>مرر للأسفل لاكتشاف التشكيلة اليومية</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#C5A059] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ========================================================
          FULLSCREEN 3D FLY-THROUGH WARP OVERLAY (LIKE IN VIDEO)
          ======================================================== */}
      {isWarping && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-between p-6 bg-[#0E0C0D]/95 text-white select-none backdrop-blur-2xl animate-in fade-in duration-500">
          
          {/* Warp Canvas Background */}
          <canvas
            ref={warpCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Top Header Bar */}
          <div className="relative z-20 w-full max-w-5xl flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#181415] border border-[#C5A059] flex items-center justify-center">
                <span className="font-serif font-black text-[#D4AF37] text-sm">LC</span>
              </div>
              <div>
                <span className="font-black text-sm block tracking-wide">عالم لولو كب كيك الملكي</span>
                <span className="text-[10px] text-[#C5A059] tracking-[0.2em] uppercase block">
                  L&apos;EXPÉRIENCE HAUTE PÂTISSERIE
                </span>
              </div>
            </div>

            {/* Close / Skip */}
            <button
              onClick={handleFinishWarp}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <span>الدخول للمتجر مباشرة</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Story Stop Station Card */}
          <div className="relative z-20 max-w-xl w-full text-center space-y-6 my-auto animate-in zoom-in-95 duration-500">
            
            {/* Step Counter Indicator */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === warpStep ? "w-10 bg-[#D4AF37] shadow-md" : "w-2.5 bg-white/30"
                  }`}
                />
              ))}
            </div>

            {/* Active Card Body */}
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[32px] p-8 sm:p-10 shadow-2xl space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.25em] border border-white/10">
                <span>{storyStops[warpStep].subtitle}</span>
              </div>

              <div className="text-[#D4AF37] text-xs font-mono font-bold tracking-widest block">
                محطة {storyStops[warpStep].step} من 03
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {storyStops[warpStep].title}
              </h3>

              <p className="text-xs sm:text-sm text-[#E0D0C8] leading-relaxed font-medium">
                {storyStops[warpStep].desc}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-[#181415] font-black text-xs sm:text-sm shadow-xl hover:brightness-105 transition flex items-center gap-2"
              >
                <span>{warpStep < 2 ? "المحطة التالية في الرحلة" : "الهبوط في المتجر وتصفح التشكيلة"}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Live Indicator */}
          <div className="relative z-20 text-[10px] text-white/40 tracking-[0.25em] uppercase font-sans-luxury">
            60 FPS HARDWARE ACCELERATED • LE CAIRE
          </div>
        </div>
      )}
    </>
  );
}
