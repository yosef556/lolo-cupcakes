"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { getPublicStoreSettings } from "@/lib/api";

export interface HeroSlideDto {
  src: string;
  title: string;
  tag: string;
  sub: string;
}

export interface CakeSlideDto {
  src: string;
  title: string;
  flavor: string;
  tiers: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlideDto[] = [
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

export const DEFAULT_CAKE_SLIDES: CakeSlideDto[] = [
  {
    src: "/images/custom-cake-hero.jpg",
    title: "تورتة زفاف ملكية 3 أدوار",
    flavor: "فانيليا مدغشقر وتوت أحمر",
    tiers: "3 أدوار فاخرة",
  },
  {
    src: "/placeholders/cake-1.jpg",
    title: "تورتة شوكولاتة بلجيكية وتوت بري",
    flavor: "شوكولاتة داكنة 70% وجناش كريمي",
    tiers: "دورين مناسبات",
  },
  {
    src: "/placeholders/cake-2.jpg",
    title: "تورتة احتفالات مبهجة بالورد الطبيعي",
    flavor: "ريد فيلفيت وكريمة الجبن الإيطالية",
    tiers: "تصميم خاص بالطلب",
  },
];

export interface StoreSettingsContextValue {
  settings: Record<string, string>;
  loading: boolean;
  storeName: string;
  storePhone: string;
  contactWhatsApp: string;
  cleanWhatsAppNumber: string; // e.g. "201016197035"
  managerWhatsApp: string;
  cleanManagerWhatsAppNumber: string; // e.g. "201069915609"
  storeAddress: string;
  storeWorkingHours: string;
  storeLogoUrl: string;
  facebookPageUrl: string;
  facebookPageId: string;
  minOrderAmount: number;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaText: string;
  heroImageUrl: string;
  promoBannerActive: boolean;
  promoBannerText: string;
  heroSlides: HeroSlideDto[];
  cakeSlides: CakeSlideDto[];
  refreshSettings: () => Promise<void>;
}

function formatCleanEgyptianNumber(raw?: string, fallback = "201016197035"): string {
  if (!raw) return fallback;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return fallback;
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("01")) return "2" + digits;
  if (digits.startsWith("1")) return "20" + digits;
  return digits;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  settings: {},
  loading: true,
  storeName: "لولو كب كيك",
  storePhone: "01069915609",
  contactWhatsApp: "201016197035",
  cleanWhatsAppNumber: "201016197035",
  managerWhatsApp: "01069915609",
  cleanManagerWhatsAppNumber: "201069915609",
  storeAddress: "الشيخ زايد، الجيزة، مصر",
  storeWorkingHours: "يومياً من 9:00 صباحاً حتى 11:30 مساءً",
  storeLogoUrl: "",
  facebookPageUrl: "https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR",
  facebookPageId: "109283746592817",
  minOrderAmount: 150,
  heroTitle: "أشهى الحلويات والتورتات المخبوزة طازجة اليوم",
  heroSubtitle: "نكهات أصيلة، مكونات فاخرة طبيعية 100%، وتوصيل دقيق لكافة مناطق القاهرة والشيخ زايد",
  heroBadge: "مخبز لولو كب كيك بالقاهرة • جودة فندقية فاخرة",
  heroCtaText: "اكتشف قائمة الحلويات الشهية 🧁",
  heroImageUrl: "/placeholders/cake-1.jpg",
  promoBannerActive: true,
  promoBannerText: "🎉 عروض نهاية الأسبوع: خصم 15% على جميع التورتات والبوكسات العائلية بكود: LOLO15",
  heroSlides: DEFAULT_HERO_SLIDES,
  cakeSlides: DEFAULT_CAKE_SLIDES,
  refreshSettings: async () => {},
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getPublicStoreSettings();
      if (data && typeof data === "object") {
        setSettings(data);
      }
    } catch {
      // Fallback gracefully without breaking UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = useMemo<StoreSettingsContextValue>(() => {
    const storeName = settings["store_name_ar"]?.trim() || "لولو كب كيك";
    const storePhone = settings["store_phone"]?.trim() || settings["contact_phone"]?.trim() || "01069915609";
    const contactWhatsApp = settings["contact_whatsapp"]?.trim() || "201016197035";
    const managerWhatsApp = settings["store_manager_whatsapp"]?.trim() || storePhone;
    const storeAddress = settings["store_address_ar"]?.trim() || "الشيخ زايد، الجيزة، مصر";
    const storeWorkingHours = settings["store_working_hours"]?.trim() || "يومياً من 9:00 صباحاً حتى 11:30 مساءً";
    const storeLogoUrl = settings["store_logo_url"]?.trim() || "";
    const facebookPageUrl = settings["facebook_page_url"]?.trim() || "https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR";
    const facebookPageId = settings["facebook_page_id"]?.trim() || "109283746592817";
    const minOrderAmount = parseFloat(settings["min_order_amount"] || "150") || 150;
    const heroTitle = settings["hero_title"]?.trim() || "أشهى الحلويات والتورتات المخبوزة طازجة اليوم";
    const heroSubtitle = settings["hero_subtitle"]?.trim() || "نكهات أصيلة، مكونات فاخرة طبيعية 100%، وتوصيل دقيق لكافة مناطق القاهرة والشيخ زايد";
    const heroBadge = settings["hero_badge"]?.trim() || "مخبز لولو كب كيك بالقاهرة • جودة فندقية فاخرة";
    const heroCtaText = settings["hero_cta_text"]?.trim() || "اكتشف قائمة الحلويات الشهية 🧁";
    const heroImageUrl = settings["hero_image_url"]?.trim() || "/placeholders/cake-1.jpg";
    const promoBannerActive = settings["promo_banner_active"] !== "false";
    const promoBannerText = settings["promo_banner_text"]?.trim() || "🎉 عروض نهاية الأسبوع: خصم 15% على جميع التورتات والبوكسات العائلية بكود: LOLO15";

    let heroSlides = DEFAULT_HERO_SLIDES;
    if (settings["hero_slides"]) {
      try {
        const p = JSON.parse(settings["hero_slides"]);
        if (Array.isArray(p) && p.length > 0) heroSlides = p;
      } catch {}
    }

    let cakeSlides = DEFAULT_CAKE_SLIDES;
    if (settings["cake_slides"]) {
      try {
        const p = JSON.parse(settings["cake_slides"]);
        if (Array.isArray(p) && p.length > 0) cakeSlides = p;
      } catch {}
    }

    return {
      settings,
      loading,
      storeName,
      storePhone,
      contactWhatsApp,
      cleanWhatsAppNumber: formatCleanEgyptianNumber(contactWhatsApp, "201016197035"),
      managerWhatsApp,
      cleanManagerWhatsAppNumber: formatCleanEgyptianNumber(managerWhatsApp, "201069915609"),
      storeAddress,
      storeWorkingHours,
      storeLogoUrl,
      facebookPageUrl,
      facebookPageId,
      minOrderAmount,
      heroTitle,
      heroSubtitle,
      heroBadge,
      heroCtaText,
      heroImageUrl,
      promoBannerActive,
      promoBannerText,
      heroSlides,
      cakeSlides,
      refreshSettings: fetchSettings,
    };
  }, [settings, loading, fetchSettings]);

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
