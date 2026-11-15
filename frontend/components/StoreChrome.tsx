"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import BrandWatermark from "./BrandWatermark";
import WhatsAppConcierge from "./WhatsAppConcierge";

export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    // Standalone Luxury Admin Portal: Matches brand palette, modern enterprise SaaS
    return (
      <main className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative z-10 font-sans transition-colors duration-200" dir="rtl">
        {children}
      </main>
    );
  }

  // Public Store Experience
  return (
    <>
      <BrandWatermark />
      <Navbar />
      <CartDrawer />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
      <WhatsAppConcierge />
    </>
  );
}
