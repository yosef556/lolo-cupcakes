"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { getPublicStoreSettings } from "@/lib/api";

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
  storeAddress: "شارع 9 الرئيسي، ميدان فيكتوريا، المعادي، القاهرة",
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
    const storeAddress = settings["store_address_ar"]?.trim() || "شارع 9 الرئيسي، ميدان فيكتوريا، المعادي، القاهرة";
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
