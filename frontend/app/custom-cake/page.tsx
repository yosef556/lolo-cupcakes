"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { createCustomCakeRequest, CustomCakeRequestResponseDto } from "@/lib/api";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { 
  CheckCircle2, 
  Copy, 
  AlertCircle, 
  Sparkles,
  Heart,
  Square,
  Circle,
  Layers,
  Upload,
  RotateCw,
  Flame,
  Award,
  Check,
  MessageCircle,
  ExternalLink
} from "lucide-react";

export default function CustomCakeRequestPage() {
  const { cleanWhatsAppNumber } = useStoreSettings();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [requestedDate, setRequestedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5); // default 5 days ahead
    return d.toISOString().split("T")[0];
  });
  const [servingsNeeded, setServingsNeeded] = useState<number>(15);
  const [flavorPreference, setFlavorPreference] = useState("شوكولاتة نوتيلا فاخرة");
  const [cakeShape, setCakeShape] = useState<"ROUND" | "HEART" | "SQUARE">("ROUND");
  const [messageOnCake, setMessageOnCake] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  // Advanced Interactive Cake Builder States
  const [selectedTiers, setSelectedTiers] = useState<1 | 2 | 3>(1);
  const [hasCandles, setHasCandles] = useState(true);
  const [hasMacarons, setHasMacarons] = useState(true);
  const [hasBerries, setHasBerries] = useState(true);
  const [hasGoldLeaf, setHasGoldLeaf] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [rotateAngle, setRotateAngle] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<CustomCakeRequestResponseDto | null>(null);
  const [copied, setCopied] = useState(false);

  const flavorVisuals = useMemo(() => {
    switch (flavorPreference) {
      case "شوكولاتة نوتيلا فاخرة":
        return {
          name: "شوكولاتة نوتيلا بلجيكية",
          topColor: "#4A2E2B",
          bodyGradient: "from-[#3E2723] via-[#4A2E2B] to-[#2B1713]",
          sideShadow: "#1D0D0B",
          dripColor: "#27120E",
          pipingColor: "#F5E6D3",
          accentBadge: "نكهة شوكولاتة بلجيكية غنية 🍫",
          glow: "rgba(62, 39, 35, 0.5)",
        };
      case "ريد فيلفيت مع كريمة الجبن":
        return {
          name: "ريد فيلفيت ملكي",
          topColor: "#A72638",
          bodyGradient: "from-[#9E1B32] via-[#B22234] to-[#781223]",
          sideShadow: "#4E0A14",
          dripColor: "#FFFDD0",
          pipingColor: "#FFFDF5",
          accentBadge: "ريد فيلفيت مخملي فاخر 🌹",
          glow: "rgba(158, 27, 50, 0.5)",
        };
      case "فانيليا مدغشقر مع توت بري":
        return {
          name: "فانيليا وتوت طبيعي",
          topColor: "#FFF5E6",
          bodyGradient: "from-[#FFF5E6] via-[#FFE8EC] to-[#FFD6DF]",
          sideShadow: "#E8B4C0",
          dripColor: "#FF4D79",
          pipingColor: "#FFFFFF",
          accentBadge: "فانيليا مدغشقر وتوت طازج 🍓",
          glow: "rgba(255, 77, 121, 0.4)",
        };
      case "فستق حلبي مع مستكة":
        return {
          name: "بستاشيو إيطالي فاخر",
          topColor: "#D2E8B8",
          bodyGradient: "from-[#C5E1A5] via-[#D4EDB9] to-[#9CCC65]",
          sideShadow: "#689F38",
          dripColor: "#7CB342",
          pipingColor: "#FFF9C4",
          accentBadge: "فستق حلبي ومستكة ملكية 🌿",
          glow: "rgba(197, 225, 165, 0.5)",
        };
      case "لوتس كراميل مقرمش":
        return {
          name: "لوتس كراميل كرانش",
          topColor: "#EBB164",
          bodyGradient: "from-[#E09436] via-[#EBB164] to-[#B36814]",
          sideShadow: "#733F08",
          dripColor: "#8D4B0E",
          pipingColor: "#FFF3E0",
          accentBadge: "كراميل لوتس مقرمش 🍯",
          glow: "rgba(224, 148, 54, 0.5)",
        };
      default:
        return {
          name: "تورتة لولو الوردية الفاخرة",
          topColor: "#FCE4EC",
          bodyGradient: "from-rose-400 via-pink-400 to-rose-500",
          sideShadow: "#C2185B",
          dripColor: "#FFFFFF",
          pipingColor: "#89CFF0",
          accentBadge: "خلطة الشيف الخاصة ✨",
          glow: "rgba(255, 77, 121, 0.4)",
        };
    }
  }, [flavorPreference]);

  const estimatedPriceRange = useMemo(() => {
    let baseMin = 650;
    let baseMax = 900;
    if (selectedTiers === 2) {
      baseMin = 1200;
      baseMax = 1650;
    } else if (selectedTiers === 3) {
      baseMin = 1950;
      baseMax = 2900;
    }
    if (cakeShape === "HEART") {
      baseMin += 80;
      baseMax += 120;
    }
    if (hasMacarons) {
      baseMin += 100;
      baseMax += 150;
    }
    if (hasGoldLeaf) {
      baseMin += 120;
      baseMax += 180;
    }
    return { min: baseMin, max: baseMax };
  }, [selectedTiers, cakeShape, hasMacarons, hasGoldLeaf]);

  const handleCopyRef = () => {
    if (!createdRequest) return;
    navigator.clipboard.writeText(createdRequest.publicReference || createdRequest.requestReference || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("يرجى إدخال اسمك ورقم الهاتف للتواصل");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Build comprehensive specifications note
    const specsNote = [
      `[الشكل: ${cakeShape === "ROUND" ? "دائري كلاسيك" : cakeShape === "HEART" ? "قلب رومانسي" : "مربع عصري"}]`,
      `[عدد الأدوار: ${selectedTiers} دور]`,
      `[النكهة: ${flavorPreference}]`,
      hasMacarons ? "[إضافة ماكرون فرنسي]" : "",
      hasBerries ? "[إضافة توت وفواكه طبيعية]" : "",
      hasGoldLeaf ? "[إضافة أوراق الذهب الغذائية]" : "",
      notes.trim() ? `[ملاحظات العميل: ${notes.trim()}]` : "",
    ].filter(Boolean).join(" ");

    try {
      const response = await createCustomCakeRequest(
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          requestedDate,
          servingsNeeded,
          flavorPreference,
          messageOnCake: messageOnCake.trim() || undefined,
          notes: specsNote,
        },
        referenceImage
      );

      setCreatedRequest(response);
      setSubmitting(false);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "حدث خطأ أثناء إرسال طلب التورتة، يرجى المحاولة مرة أخرى");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="text-right space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#E8F6FC] text-[#5BBBE7] border border-[#CEECFA]">
          <Sparkles className="w-3.5 h-3.5 text-[#5BBBE7]" />
          <span>ورشة تفصيل تورتات المناسبات الملكية ثلاثية الأبعاد 🎂</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          صمم تورتة أحلامك الخاصة مع شيف لولو
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          خصص حجم وشكل ونكهة وإضافات التورتة التفاعلية وشاهد المعاينة الحية الفورية لأدق تفاصيلها قبل إرسال طلب التسعير المباشر لمطبخنا.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Desktop 5 cols): Advanced 3D Cake Visualizer Stage */}
        <div className={`lg:col-span-5 p-6 rounded-[36px] border shadow-luxury space-y-6 sticky top-24 transition-colors duration-500 ${
          isNightMode 
            ? "bg-slate-900 border-slate-700 text-white" 
            : "bg-white border-rose-100 text-slate-900"
        }`}>
          
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b pb-3 border-rose-100/50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              <h3 className="font-black text-sm">المعاينة الحية للتورتة (Live 3D Preview)</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Night Celebration Lighting Toggle */}
              <button
                type="button"
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
                  isNightMode 
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
                title="أجواء الاحتفال الليلية"
              >
                <span>✨</span>
                <span>{isNightMode ? "أجواء ليلية" : "إضاءة نهارية"}</span>
              </button>

              {/* Rotate View Angle */}
              <button
                type="button"
                onClick={() => setRotateAngle((prev) => (prev + 45) % 360)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="تدوير زاوية العرض"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Cake Visual Canvas */}
          <div 
            className={`relative h-80 sm:h-96 w-full rounded-3xl border flex flex-col items-center justify-end p-6 overflow-hidden transition-all duration-700 shadow-inner ${
              isNightMode 
                ? "bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/40 border-slate-800" 
                : "bg-gradient-to-b from-[#E8F6FC]/60 via-white to-pink-50/50 border-rose-100"
            }`}
            style={{ perspective: "1000px" }}
          >
            {/* Ambient Background Sparkles */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-6 left-8 text-amber-300 animate-pulse text-sm">✦</div>
              <div className="absolute top-12 right-10 text-pink-300 animate-ping text-xs">✨</div>
              <div className="absolute top-24 left-16 text-rose-300 animate-bounce text-xs">🌸</div>
            </div>

            {/* Flavor & Badge Pill */}
            <div className="absolute top-4 inset-x-0 flex justify-center z-20">
              <span className="text-[11px] font-black px-3.5 py-1 rounded-full shadow-md backdrop-blur-md bg-white/90 text-rose-600 border border-rose-200">
                {flavorVisuals.accentBadge}
              </span>
            </div>

            {/* Cake Assembly Stack (3D Isometric-styled) */}
            <div 
              className="flex flex-col items-center justify-end w-full relative z-10 transition-transform duration-500 ease-out"
              style={{ transform: `rotateY(${rotateAngle}deg)` }}
            >
              
              {/* TOPPER / CANDLES & SPARKLE */}
              {hasCandles && (
                <div className="flex items-end justify-center gap-3 -mb-2 z-30">
                  <div className="flex flex-col items-center animate-bounce">
                    <span className="w-2.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B] animate-pulse" />
                    <span className="w-1 h-3 bg-amber-100 rounded-t" />
                  </div>
                  <div className="flex flex-col items-center animate-pulse">
                    <Flame className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_#F59E0B]" />
                    <span className="w-1.5 h-4 bg-white rounded-t shadow-sm" />
                  </div>
                  <div className="flex flex-col items-center animate-bounce delay-150">
                    <span className="w-2.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B] animate-pulse" />
                    <span className="w-1 h-3 bg-amber-100 rounded-t" />
                  </div>
                </div>
              )}

              {/* CROWN TOPPINGS: Berries / Macarons on Top Tier */}
              <div className="flex items-center justify-center gap-1.5 -mb-2 z-20">
                {hasBerries && (
                  <span className="text-base filter drop-shadow">🍓🫐</span>
                )}
                {hasMacarons && (
                  <span className="w-4 h-2.5 rounded-full bg-pink-300 border border-pink-400 shadow-sm inline-block" />
                )}
                {hasGoldLeaf && (
                  <span className="text-xs text-amber-300 drop-shadow animate-pulse">✨</span>
                )}
                {hasMacarons && (
                  <span className="w-4 h-2.5 rounded-full bg-[#89CFF0] border border-[#5BBBE7] shadow-sm inline-block" />
                )}
              </div>

              {/* TIER 3 (Top Tier - Only if 3 tiers selected) */}
              {selectedTiers >= 3 && (
                <div className="relative flex flex-col items-center animate-in zoom-in-90 duration-300 z-20">
                  {/* Top Frosting Cap */}
                  <div 
                    className="w-28 h-6 rounded-[50%] shadow-inner border border-white/40"
                    style={{ backgroundColor: flavorVisuals.topColor }}
                  />
                  {/* Cylinder Body */}
                  <div 
                    className={`w-28 h-12 -mt-3 rounded-b-2xl bg-gradient-to-r ${flavorVisuals.bodyGradient} shadow-md relative overflow-hidden flex items-center justify-center`}
                  >
                    {/* Drips */}
                    <div 
                      className="absolute top-0 inset-x-0 h-3 rounded-b-lg opacity-80"
                      style={{ backgroundColor: flavorVisuals.dripColor }}
                    />
                    <span className="text-[9px] font-black text-white/80 z-10">الدور الثالث</span>
                  </div>
                </div>
              )}

              {/* TIER 2 (Middle Tier - If 2 or 3 tiers) */}
              {selectedTiers >= 2 && (
                <div className="relative flex flex-col items-center animate-in zoom-in-90 duration-300 z-15 -mt-2">
                  {/* Top Frosting Cap */}
                  <div 
                    className="w-44 h-8 rounded-[50%] shadow-inner border border-white/40"
                    style={{ backgroundColor: flavorVisuals.topColor }}
                  />
                  {/* Cylinder Body */}
                  <div 
                    className={`w-44 h-14 -mt-4 rounded-b-2xl bg-gradient-to-r ${flavorVisuals.bodyGradient} shadow-md relative overflow-hidden flex items-center justify-center`}
                  >
                    {/* Drips */}
                    <div 
                      className="absolute top-0 inset-x-0 h-3.5 rounded-b-lg opacity-80"
                      style={{ backgroundColor: flavorVisuals.dripColor }}
                    />
                    {hasGoldLeaf && (
                      <span className="absolute top-3 left-4 text-[10px] text-amber-300">✨</span>
                    )}
                    {hasMacarons && (
                      <span className="absolute bottom-1 right-2 w-3.5 h-2 rounded-full bg-emerald-200 border border-emerald-300" />
                    )}
                    <span className="text-[10px] font-black text-white/80 z-10">الدور الثاني</span>
                  </div>
                </div>
              )}

              {/* TIER 1 (Base Tier - Always Present) */}
              <div className="relative flex flex-col items-center z-10 -mt-2">
                {/* Top Frosting Cap */}
                <div 
                  className={`h-10 rounded-[50%] shadow-inner border border-white/40 ${
                    cakeShape === "ROUND" ? "w-60 sm:w-68" : cakeShape === "HEART" ? "w-56 sm:w-64" : "w-60 sm:w-68 rounded-xl"
                  }`}
                  style={{ backgroundColor: flavorVisuals.topColor }}
                />
                
                {/* Cylinder Body */}
                <div 
                  className={`h-20 sm:h-22 -mt-5 rounded-b-3xl bg-gradient-to-r ${flavorVisuals.bodyGradient} shadow-xl relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                    cakeShape === "ROUND" ? "w-60 sm:w-68" : cakeShape === "HEART" ? "w-56 sm:w-64" : "w-60 sm:w-68 rounded-b-2xl"
                  }`}
                >
                  {/* Organic Drip Glaze */}
                  <div 
                    className="absolute top-0 inset-x-0 h-4 rounded-b-xl opacity-85 shadow-sm"
                    style={{ backgroundColor: flavorVisuals.dripColor }}
                  />

                  {/* Accents on Base Tier */}
                  {hasGoldLeaf && (
                    <div className="absolute right-4 bottom-3 text-xs text-amber-300 font-serif">★ ✦</div>
                  )}
                  {hasMacarons && (
                    <div className="absolute left-3 bottom-2 flex gap-1">
                      <span className="w-3.5 h-2 rounded-full bg-pink-300 border border-pink-400" />
                      <span className="w-3.5 h-2 rounded-full bg-[#89CFF0] border border-[#5BBBE7]" />
                    </div>
                  )}

                  {/* CUSTOM CALLIGRAPHY INSCRIPTION RIBBON */}
                  <div className="z-10 max-w-[85%] px-3 py-1 rounded-xl bg-white/95 text-rose-600 font-black text-xs shadow-lg border border-rose-200 text-center truncate animate-in zoom-in-95">
                    {messageOnCake ? `"${messageOnCake}"` : "تورتة لولو كب كيك الملكية 👑"}
                  </div>
                </div>
              </div>

              {/* ROYAL GOLD PEDESTAL STAND */}
              <div className="w-72 sm:w-80 h-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-xl border-t border-amber-200 -mt-0.5 z-5" />
              <div className="w-32 h-2 rounded-b-xl bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 opacity-80" />
            </div>
          </div>

          {/* Interactive Tier & Shape Selectors */}
          <div className="space-y-4 pt-2">
            
            {/* Tiers Switcher */}
            <div>
              <label className="text-xs font-bold block mb-1.5">عدد أدوار التورتة:</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((tierNum) => (
                  <button
                    key={tierNum}
                    type="button"
                    onClick={() => {
                      setSelectedTiers(tierNum as 1 | 2 | 3);
                      setServingsNeeded(tierNum === 1 ? 15 : tierNum === 2 ? 30 : 50);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      selectedTiers === tierNum
                        ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/50"
                    }`}
                  >
                    <span>{tierNum}</span>
                    <span>{tierNum === 1 ? "دور واحد" : tierNum === 2 ? "دورين" : "3 أدوار"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Switcher */}
            <div>
              <label className="text-xs font-bold block mb-1.5">شكل قالب التورتة:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCakeShape("ROUND")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    cakeShape === "ROUND"
                      ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/50"
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>دائري</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCakeShape("HEART")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    cakeShape === "HEART"
                      ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/50"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>قلب رومانسي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCakeShape("SQUARE")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    cakeShape === "SQUARE"
                      ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/50"
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>مربع مودرن</span>
                </button>
              </div>
            </div>

            {/* Toppings Toggles */}
            <div>
              <label className="text-xs font-bold block mb-1.5">إضافات وتفاصيل التزيين الملكية:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setHasCandles(!hasCandles)}
                  className={`p-2 rounded-xl border font-bold flex items-center justify-between transition ${
                    hasCandles ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span>🕯️ شموع الاحتفال</span>
                  {hasCandles && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHasMacarons(!hasMacarons)}
                  className={`p-2 rounded-xl border font-bold flex items-center justify-between transition ${
                    hasMacarons ? "bg-pink-50 border-pink-300 text-pink-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span>🍬 ماكرون فرنسي</span>
                  {hasMacarons && <Check className="w-3.5 h-3.5 text-pink-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHasBerries(!hasBerries)}
                  className={`p-2 rounded-xl border font-bold flex items-center justify-between transition ${
                    hasBerries ? "bg-red-50 border-red-300 text-red-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span>🍓 توت وفواكه طازجة</span>
                  {hasBerries && <Check className="w-3.5 h-3.5 text-red-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHasGoldLeaf(!hasGoldLeaf)}
                  className={`p-2 rounded-xl border font-bold flex items-center justify-between transition ${
                    hasGoldLeaf ? "bg-yellow-50 border-yellow-300 text-yellow-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span>✨ أوراق ذهب عيار 24</span>
                  {hasGoldLeaf && <Check className="w-3.5 h-3.5 text-yellow-600" />}
                </button>
              </div>
            </div>

            {/* Approximate Price Estimation Widget */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50/40 to-[#E8F6FC] border border-rose-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">السعر التقديري المبدئي:</span>
                <span className="text-base font-black text-rose-600">
                  {estimatedPriceRange.min} ~ {estimatedPriceRange.max} ج.م
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * السعر التقديري يشمل التصميم المختار، ويتم إرسال العرض المعتمد فور مراجعة الشيف لدرجة تعقيد التنفيذ.
              </p>
            </div>

          </div>

        </div>

        {/* Right Column (Desktop 7 cols): Customization Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-[36px] border border-rose-100 shadow-sm space-y-8">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Customer Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-[#89CFF0] text-white font-black flex items-center justify-center text-xs shadow-sm">
                  1
                </span>
                <h3 className="font-black text-base text-slate-900">بيانات التواصل والتأكيد</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم بالكامل *:</label>
                  <input
                    type="text"
                    required
                    placeholder="سارة محمود"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف المصري *:</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="010XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-[#89CFF0] font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني (اختياري لاستلام العرض):</label>
                  <input
                    type="email"
                    placeholder="sara@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Cake Specifications */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-[#89CFF0] text-white font-black flex items-center justify-center text-xs shadow-sm">
                  2
                </span>
                <h3 className="font-black text-base text-slate-900">مواصفات التورتة والمناسبة</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ المناسبة المطلوب *:</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">عدد الأفراد التقديري *:</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={servingsNeeded}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 10;
                      setServingsNeeded(val);
                      if (val <= 16) setSelectedTiers(1);
                      else if (val <= 35) setSelectedTiers(2);
                      else setSelectedTiers(3);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#89CFF0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">النكهة والحشوة المفضلة *:</label>
                  <select
                    value={flavorPreference}
                    onChange={(e) => setFlavorPreference(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#89CFF0]"
                  >
                    <option value="شوكولاتة نوتيلا فاخرة">شوكولاتة نوتيلا بلجيكية غنية</option>
                    <option value="ريد فيلفيت مع كريمة الجبن">ريد فيلفيت مخملي مع كريمة الجبن النيوزيلندية</option>
                    <option value="فانيليا مدغشقر مع توت بري">فانيليا مدغشقر مع توت بري طازج</option>
                    <option value="فستق حلبي مع مستكة">بستاشيو إيطالي مع مستكة يونانية فاخرة</option>
                    <option value="لوتس كراميل مقرمش">كراميل مملح مع بسكويت لوتس مقرمش</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    العبارة المكتوبة على التورتة (تظهر فورياً في المعاينة الحية):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: Happy Birthday Lolo أو مبروك التخرج يا سارة"
                    value={messageOnCake}
                    onChange={(e) => setMessageOnCake(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">تفاصيل وملاحظات التصميم والألوان الإضافية:</label>
                  <textarea
                    rows={3}
                    placeholder="اوصف ألوان التورتة، الثيم الخاص بالحفل، أو أي عناصر خاصة تريد إضافتها..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Reference Image Upload */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-[#89CFF0] text-white font-black flex items-center justify-center text-xs shadow-sm">
                  3
                </span>
                <h3 className="font-black text-base text-slate-900">صورة مرجعية أو تصميم مقارب للتورتة (اختياري)</h3>
              </div>

              <div className="border-2 border-dashed border-rose-200 hover:border-[#89CFF0] rounded-2xl p-6 text-center transition bg-rose-50/20">
                <input
                  type="file"
                  id="cake-ref-img"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReferenceImage(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="cake-ref-img" className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-[#5BBBE7] mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    {referenceImage ? (
                      <span className="text-emerald-600 font-black">تم اختيار: {referenceImage.name}</span>
                    ) : (
                      <span>اضغط هنا لاختيار صورة من جهازك (JPG / PNG / WEBP)</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    يمكنك رفع صورة من بنترست أو إنستغرام لتقريب الفكرة لشيف لولو
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#89CFF0] text-white font-black text-sm shadow-rose-glow hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري إرسال مواصفات التورتة للشيف...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-white" />
                  <span>إرسال طلب تفصيل التورتة واعتماد التسعير 🎂</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>

      {/* Success Modal */}
      {createdRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                تم استلام طلب التورتة بنجاح ✨
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                كود المتابعة: {createdRequest.publicReference || createdRequest.requestReference}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                سيقوم شيف لولو كب كيك بمراجعة التصميم والمكونات وإرسال عرض السعر المعتمد لك فورياً.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الطلب:</span>
                <span className="font-bold text-amber-600">{createdRequest.statusLabelAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">موعد المناسبة:</span>
                <span className="font-bold text-slate-900">{createdRequest.requestedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد الأفراد:</span>
                <span className="font-bold text-slate-900">{createdRequest.servingsNeeded} فرد</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyRef}
                className="w-full py-3.5 rounded-2xl border border-rose-200 hover:bg-rose-50 text-slate-800 font-black text-xs transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? "تم نسخ كود المتابعة بنجاح!" : "نسخ كود المتابعة للرجوع إليه لاحقاً"}</span>
              </button>

              <a
                href={`https://wa.me/${cleanWhatsAppNumber || "201069915609"}?text=${encodeURIComponent(
                  `مرحباً شيف لولو كب كيك 🎂 لقد أرسلت طلب تفصيل تورتة برقم كود: ${createdRequest.publicReference || createdRequest.requestReference} لمناسبة يوم ${createdRequest.requestedDate}. أود التأكيد معكم عبر واتساب.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال تفاصيل التورتة فوراً للشيف عبر واتساب 📲</span>
              </a>

              <Link
                href={`/custom-cake/${createdRequest.publicReference || createdRequest.requestReference}?token=${createdRequest.accessToken || createdRequest.trackingToken || ""}`}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>الانتقال لصفحة عرض السعر ومتابعة التورتة</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
