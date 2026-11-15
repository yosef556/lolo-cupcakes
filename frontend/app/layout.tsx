import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/components/CartContext";
import { StoreSettingsProvider } from "@/components/StoreSettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import StoreChrome from "@/components/StoreChrome";
import PreloaderGate from "@/components/PreloaderGate";
import InteractiveBackground from "@/components/InteractiveBackground";

import { sql } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lolo-cupcakes.vercel.app';
  let title = "لولو كب كيك | Lolo Cupcakes - تورتات وحلويات فاخرة";
  let description = "اطلب تورتتك المخصصة والكب كيك الفاخر أونلاين مع توصيل مبرد وسريع في القاهرة والشيخ زايد و 6 أكتوبر.";
  let imageUrl = `${siteUrl}/og-image.png`;

  try {
    const rows = await sql`SELECT setting_key as key, setting_value as value FROM store_settings WHERE setting_key IN ('store_name_ar', 'store_tab_title', 'social_share_title', 'social_share_description', 'social_share_image_url', 'store_logo_url')`;
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.key && r.value) map[r.key] = r.value;
    }

    if (map['social_share_title']?.trim()) {
      title = map['social_share_title'].trim();
    } else if (map['store_tab_title']?.trim()) {
      title = map['store_tab_title'].trim();
    } else if (map['store_name_ar']?.trim()) {
      title = `${map['store_name_ar'].trim()} | حلويات وتورتات فاخرة`;
    }

    if (map['social_share_description']?.trim()) {
      description = map['social_share_description'].trim();
    }

    const rawImg = map['social_share_image_url']?.trim() || map['store_logo_url']?.trim();
    if (rawImg) {
      imageUrl = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    }
  } catch {
    // fallback gracefully
  }

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: ["كب كيك", "تورتة مخصصة", "تورتات مناسبات", "حلويات فاخرة", "تورتة أعياد ميلاد", "القاهرة", "الشيخ زايد", "6 أكتوبر", "Lolo Cupcakes"],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Lolo Cupcakes Cairo",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
      locale: "ar_EG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("store_tab_title");
                if (t && t.trim()) document.title = t.trim();
                var f = localStorage.getItem("store_favicon_url");
                if (f && f.trim()) {
                  var link = document.querySelector("link[rel~='icon']");
                  if (link) link.href = f.trim();
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#FFFDFE] dark:bg-[#0c0d12] text-slate-800 dark:text-slate-100 selection:bg-rose-100 selection:text-rose-600 min-h-screen flex flex-col justify-between relative transition-colors duration-300">
        <ThemeProvider>
          <StoreSettingsProvider>
            <AuthProvider>
              <WishlistProvider>
                <PreloaderGate />
                <InteractiveBackground />
                <CartProvider>
                  <StoreChrome>
                    {children}
                  </StoreChrome>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </StoreSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
