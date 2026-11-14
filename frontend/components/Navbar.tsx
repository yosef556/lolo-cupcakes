"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { useAuth } from "@/context/AuthContext";
import { getPublicStoreSettings } from "@/lib/api";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useWishlist } from "@/context/WishlistContext";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Clock, 
  Truck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Heart,
  Globe
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { cart, openDrawer } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [storePhone, setStorePhone] = useState("010 6991 5609");
  const { favoritesCount } = useWishlist();
  const [currentLang, setCurrentLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const savedLang = typeof window !== "undefined" ? (localStorage.getItem("lolo_lang") as "ar" | "en" | null) : null;
    if (savedLang) setCurrentLang(savedLang);
  }, []);

  const toggleLang = () => {
    const next = currentLang === "ar" ? "en" : "ar";
    setCurrentLang(next);
    localStorage.setItem("lolo_lang", next);
  };

  useEffect(() => {
    getPublicStoreSettings()
      .then((settings) => {
        if (settings["store_phone"]) {
          setStorePhone(settings["store_phone"]);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "قائمة الحلويات", href: "/shop" },
    { label: "تورتات المناسبات", href: "/custom-cake" },
    { label: "تتبع طلبك", href: "/track" },
  ];

  return (
    <>
      {/* Top Announcement Bar - Sweet Pastel Gradient with Live Info */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-sky-500 text-white py-2 px-4 text-xs font-bold tracking-wide shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-extrabold tracking-wider font-serif">Lolo Cupcakes</span>
            <span className="opacity-75 hidden sm:inline">•</span>
            <span className="opacity-95 hidden sm:inline text-[11px]">
              حلويات وكيك فاخر يُخبز طازجاً يومياً بأجود المكونات الطبيعية في القاهرة
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>مواعيد العمل: 10:00 ص - 11:30 م</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              <Truck className="w-3.5 h-3.5" />
              <span>توصيل مبرد وسريع</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300 border-b border-pink-100/80 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Right Section: Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "text-pink-600 dark:text-pink-400 bg-pink-50/90 dark:bg-slate-800 font-black shadow-xs border border-pink-200/70 dark:border-pink-900/40"
                      : "hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/40 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Left Toggle: Menu Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-800 border border-pink-200 dark:border-slate-700 transition"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-pink-600 dark:text-pink-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Brand Identity: Beautiful Balanced Luxury Pastry Lockup */}
          <div className="flex-1 flex justify-center lg:flex-initial px-1">
            <BrandLogo href="/" size="sm" className="sm:hidden" />
            <BrandLogo href="/" size="md" className="hidden sm:inline-flex" />
          </div>

          {/* Left Section: User Profile & Cart Bag Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Theme Switcher (Available on all devices) */}
            <ThemeSwitcher className="inline-flex" />

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2 py-1.5 sm:px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1 shadow-xs"
              title="تبديل اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[10px] font-black">{currentLang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Wishlist Favorites Button */}
            <Link
              href="/shop?filter=favorites"
              className="relative p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-700 text-pink-600 dark:text-pink-400 transition flex items-center justify-center shadow-xs"
              title="قائمة المفضلة"
            >
              <Heart className="w-4 h-4 fill-pink-500/20" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-in zoom-in">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Controls */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 hover:bg-pink-100/70 text-slate-800 dark:text-slate-100 text-xs font-black transition flex items-center gap-1.5 sm:gap-2 shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user.fullName ? user.fullName.charAt(0) : "U"
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-pink-100 dark:border-slate-700 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-pink-50 dark:border-slate-700">
                      <p className="font-black text-xs text-slate-900 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate" dir="ltr">{user.email || user.phone}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-700 hover:text-pink-600 dark:hover:text-pink-400 transition"
                    >
                      <UserIcon className="w-4 h-4 text-pink-500" />
                      <span>حسابي الشخصي والطلبات</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-2.5 sm:px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-slate-700 text-pink-600 dark:text-pink-400 text-xs font-black transition flex items-center gap-1 shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={openDrawer}
              className="relative px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white font-extrabold text-xs shadow-md shadow-pink-200 dark:shadow-none transition-all duration-200 flex items-center gap-1.5 sm:gap-2 group active:scale-95"
              aria-label="عرض حقيبة المشتريات"
            >
              <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">الحقيبة</span>
              {cart && cart.totalQuantity > 0 && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white text-pink-600 text-[10px] font-black shadow-xs">
                  {cart.totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-pink-100 dark:border-slate-800 px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-pink-50 dark:hover:bg-slate-800 hover:text-pink-600 dark:hover:text-pink-400 transition"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-pink-100 dark:border-slate-800 space-y-2">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>حسابي الشخصي ({user?.fullName})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </Link>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 pt-2 border-t border-pink-50 dark:border-slate-800">
                <span>تواصل هاتفي:</span>
                <a href={`tel:${storePhone.replace(/\s+/g, '')}`} dir="ltr" className="text-pink-600 dark:text-pink-400 font-black">
                  {storePhone}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
