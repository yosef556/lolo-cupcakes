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

export const metadata: Metadata = {
  title: "لولو كب كيك | Lolo Cupcakes - تورتات وحلويات فاخرة بالقاهرة",
  description: "دار حلويات مصرية فاخرة تصنع الكب كيك الطازج وتورتات المناسبات المخصصة وحلويات النخبة بأيدي خبراء الحلويات باستخدام أرقى المكونات الطبيعية.",
  keywords: ["كب كيك", "تورتة مخصصة", "تورتات مناسبات", "حلويات فاخرة", "تورتة أعياد ميلاد", "القاهرة", "الشيخ زايد", "Lolo Cupcakes"],
  openGraph: {
    title: "لولو كب كيك | Lolo Cupcakes - حلويات وتورتات فاخرة",
    description: "اطلب تورتتك المخصصة والكب كيك الفاخر أونلاين مع توصيل مبرد وسريع في القاهرة والجيزة.",
    url: "https://lolocupcakes.com",
    siteName: "Lolo Cupcakes Cairo",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Lolo Cupcakes Logo",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "لولو كب كيك | Lolo Cupcakes - حلويات وتورتات فاخرة",
    description: "اطلب تورتتك المخصصة والكب كيك الفاخر أونلاين مع توصيل مبرد وسريع في القاهرة والجيزة.",
    images: ["/logo.png"],
  },
};

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
