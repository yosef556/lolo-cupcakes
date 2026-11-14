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
  vodafoneCashNumber: string;
  instapayAddress: string;
  minOrderAmount: number;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaText: string;
  heroImageUrl: string;
  promoBannerActive: boolean;
  promoBannerText: string;
  storeTabTitle: string;
  storeFaviconUrl: string;
  heroSlides: HeroSlideDto[];
  cakeSlides: CakeSlideDto[];
  refreshSettings: () => Promise<void>;
}

export function broadcastSettingsChange() {
  if (typeof window !== "undefined") {
    try {
      const channel = new BroadcastChannel("lolo_settings_channel");
      channel.postMessage({ type: "SETTINGS_UPDATED", timestamp: Date.now() });
      channel.close();
    } catch {}
  }
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
  storePhone: "01042814669",
  contactWhatsApp: "201042814669",
  cleanWhatsAppNumber: "201042814669",
  managerWhatsApp: "01042814669",
  cleanManagerWhatsAppNumber: "201042814669",
  storeAddress: "الحي الحادي عشر بجوار سوبر ماركت الاسواني ، قسم ثان الشيخ زايد، محافظة الجيزة",
  storeWorkingHours: "يومياً من 9:00 صباحاً حتى 11:30 مساءً",
  storeLogoUrl: "/custom-logo.png",
  facebookPageUrl: "https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR",
  facebookPageId: "109283746592817",
  vodafoneCashNumber: "01042814669",
  instapayAddress: "01042814669",
  minOrderAmount: 150,
  heroTitle: "أشهى الحلويات والتورتات المخبوزة طازجة اليوم",
  heroSubtitle: "نكهات أصيلة، مكونات فاخرة طبيعية 100%، وتوصيل دقيق لكافة مناطق القاهرة والشيخ زايد",
  heroBadge: "مخبز لولو كب كيك بالقاهرة • جودة فندقية فاخرة",
  heroCtaText: "اكتشف قائمة الحلويات الشهية 🧁",
  heroImageUrl: "/placeholders/cake-1.jpg",
  promoBannerActive: true,
  promoBannerText: "🎉 عروض نهاية الأسبوع: خصم 15% على جميع التورتات والبوكسات العائلية بكود: LOLO15",
  storeTabTitle: "لولو كب كيك | Lolo Cupcakes - أشهى الحلويات والتورتات",
  storeFaviconUrl: "/favicon.ico",
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

    if (typeof window === "undefined") return;

    // 1. Instant cross-tab sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("lolo_settings_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "SETTINGS_UPDATED") {
          fetchSettings();
        }
      };
    } catch {}

    // 2. Tab focus & visibility revalidation (re-sync instantly when user switches back to tab or mobile app)
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        fetchSettings();
      }
    };
    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    // 3. Periodic light background poll (every 20 seconds)
    const interval = setInterval(fetchSettings, 20000);

    return () => {
      channel?.close();
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
      clearInterval(interval);
    };
  }, [fetchSettings]);

  const value = useMemo<StoreSettingsContextValue>(() => {
    const storeName = settings["store_name_ar"]?.trim() || "لولو كب كيك";
    const storePhone = settings["store_phone"]?.trim() || settings["contact_phone"]?.trim() || "01042814669";
    const contactWhatsApp = settings["contact_whatsapp"]?.trim() || "201042814669";
    const managerWhatsApp = settings["store_manager_whatsapp"]?.trim() || storePhone;
    const storeAddress = settings["store_address_ar"]?.trim() || "الحي الحادي عشر بجوار سوبر ماركت الاسواني ، قسم ثان الشيخ زايد، محافظة الجيزة";
    const storeWorkingHours = settings["store_working_hours"]?.trim() || "يومياً من 9:00 صباحاً حتى 11:30 مساءً";
    const storeLogoUrl = settings["store_logo_url"]?.trim() || "/custom-logo.png";
    const facebookPageUrl = settings["facebook_page_url"]?.trim() || "https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR";
    const facebookPageId = settings["facebook_page_id"]?.trim() || "109283746592817";
    const vodafoneCashNumber = settings["payment_vodafone_cash_number"]?.trim() || storePhone;
    const instapayAddress = settings["payment_instapay_address"]?.trim() || storePhone;
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

    const storeTabTitle = settings["store_tab_title"]?.trim() || (storeName ? `${storeName} | أشهى الحلويات والتورتات` : "لولو كب كيك | Lolo Cupcakes");
    const storeFaviconUrl = settings["store_favicon_url"]?.trim() || storeLogoUrl || "/favicon.ico";

    return {
      settings,
      loading,
      storeName,
      storePhone,
      contactWhatsApp,
      cleanWhatsAppNumber: formatCleanEgyptianNumber(contactWhatsApp, "201042814669"),
      managerWhatsApp,
      cleanManagerWhatsAppNumber: formatCleanEgyptianNumber(managerWhatsApp, "201042814669"),
      storeAddress,
      storeWorkingHours,
      storeLogoUrl,
      facebookPageUrl,
      facebookPageId,
      vodafoneCashNumber,
      instapayAddress,
      minOrderAmount,
      heroTitle,
      heroSubtitle,
      heroBadge,
      heroCtaText,
      heroImageUrl,
      promoBannerActive,
      promoBannerText,
      storeTabTitle,
      storeFaviconUrl,
      heroSlides,
      cakeSlides,
      refreshSettings: fetchSettings,
    };
  }, [settings, loading, fetchSettings]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (value.storeTabTitle) {
      document.title = value.storeTabTitle;
    }
    const iconUrl = value.storeFaviconUrl || value.storeLogoUrl || "/favicon.ico";
    if (iconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = iconUrl;
    }
  }, [value.storeTabTitle, value.storeFaviconUrl, value.storeLogoUrl]);

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
