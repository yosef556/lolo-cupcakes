"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Phone, MapPin, Clock, Heart } from "lucide-react";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const { storePhone, storeAddress, storeWorkingHours } = useStoreSettings();
  const { user } = useAuth();

  return (
    <footer className="bg-gradient-to-b from-white via-rose-50/40 to-pink-50/70 dark:from-[#0a0d16] dark:via-[#0e1320] dark:to-[#080a10] text-slate-800 dark:text-slate-200 border-t border-rose-200 dark:border-slate-800/80 mt-28 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Top Rose & Gold Ribbon */}
      <div className="h-[3px] w-full bg-gradient-to-r from-rose-300 via-rose-500 to-amber-400 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo href="/" size="md" />

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              دار حلويات مصرية فاخرة تصنع الكب كيك الطازج وتورتات المناسبات المخصصة وحلويات النخبة بأيدي خبراء الحلويات وباستخدام أرقى المكونات الطبيعية.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-rose-600 dark:text-pink-400 font-bold bg-white dark:bg-slate-800/90 px-3 py-1.5 rounded-full border border-rose-200 dark:border-pink-900/60 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 dark:text-pink-400" />
              <span>مخبوز طازج بكل حب في القاهرة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">روابط استكشافية</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/shop" className="hover:text-rose-600 dark:hover:text-pink-400 transition">قائمة الحلويات الفاخرة</Link></li>
              <li><Link href="/custom-cake" className="hover:text-rose-600 dark:hover:text-pink-400 transition">ورشة التورتة المخصصة</Link></li>
              <li><Link href="/track" className="hover:text-rose-600 dark:hover:text-pink-400 transition">بوابة تتبع الطلب</Link></li>
              <li><Link href="/checkout" className="hover:text-rose-600 dark:hover:text-pink-400 transition">إتمام الطلب السريع</Link></li>
              {user?.isAdmin && (
                <li>
                  <Link href="/admin" className="hover:text-rose-600 dark:hover:text-pink-400 transition font-bold text-rose-600 dark:text-pink-400">
                    لوحة تحكم الإدارة (الكتالوج والشعار)
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Branch & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">الفرع وساعات العمل</h4>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                <span>{storeAddress || "المعادي، القاهرة - شارع 9 الرئيسي"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-rose-500 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                <span>{storeWorkingHours || "يومياً من 9:00 صباحاً حتى 11:30 مساءً"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-500 dark:text-pink-400 flex-shrink-0" />
                <a href={`tel:${storePhone || "01069915609"}`} dir="ltr" className="font-semibold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-pink-400 transition">
                  {storePhone || "01069915609"}
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">طرق السداد المعتمدة</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              نوفر وسائل دفع متعددة ومريحة مع تأكيد واعتماد فوري ومباشر من الإدارة.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700 shadow-sm">
                إنستاباي (InstaPay) ⚡
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700 shadow-sm">
                فودافون كاش
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700 shadow-sm">
                تحويل بنكي مباشر
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700 shadow-sm">
                الدفع عند الاستلام 💵
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-rose-200 dark:border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} لولو كب كيك (Lolo Cupcakes Haute Pâtisserie). جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
            <span>صُنع بشغف وفخامة في قلب القاهرة</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
