"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts, CategoryDto, ProductDto, getFeaturedReviews, ReviewItemDto, createAdminReview } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { 
  Sparkles, 
  ShoppingBag, 
  Cake, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Star, 
  Heart, 
  Zap, 
  ArrowUpRight,
  Plus,
  X,
  CheckCircle2
} from "lucide-react";
import confetti from "canvas-confetti";
import { playJoyfulChime } from "@/lib/soundFx";
import ImaginativeHero from "@/components/ImaginativeHero";

function CategorySlideshowCard({
  cat,
  images,
  fallbackImage,
}: {
  cat: CategoryDto;
  images: string[];
  fallbackImage: string;
}) {
  const effectiveImages = images && images.length > 0 ? images : [fallbackImage];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (effectiveImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % effectiveImages.length);
    }, 3500); // Transitions every 3.5 seconds
    return () => clearInterval(interval);
  }, [effectiveImages.length]);

  const currentImg = effectiveImages[currentIndex % effectiveImages.length];

  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      className="group relative rounded-3xl overflow-hidden glass-dream p-4 border border-pink-100 hover:border-pink-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="aspect-square w-full rounded-2xl overflow-hidden relative mb-3 bg-gradient-to-br from-pink-50 to-sky-50 shadow-inner">
        <Image
          key={currentImg}
          src={currentImg}
          alt={cat.nameAr}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 animate-in fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* Dynamic dots for cycling images */}
        {effectiveImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
            {effectiveImages.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex % Math.min(effectiveImages.length, 4)
                    ? "bg-white w-3"
                    : "bg-white/50 w-1.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* Product Count Badge */}
        {images.length > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/90 text-white backdrop-blur-xs shadow-xs">
            {images.length} {images.length === 1 ? "صنف" : "أصناف"} 🍰
          </span>
        )}
      </div>

      <div className="text-center pt-1">
        <h3 className="font-black text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
          {cat.nameAr}
        </h3>
        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
          {cat.nameEn || "Lolo Cupcakes"}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductDto[]>([]);
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const {
    promoBannerActive,
    promoBannerText,
    cakeSlides: contextCakeSlides,
    facebookPageUrl,
    customCakeBadge,
    customCakeTitle,
    customCakeSubtitle,
    customCakeCtaPrimary,
    customCakeCtaSecondary,
  } = useStoreSettings();

  // Dynamic Customer Reviews State (USER REQUEST: التحكم الكامل بآراء وتقييمات العملاء المعروضة)
  const [dynamicReviews, setDynamicReviews] = useState<ReviewItemDto[]>([]);
  const [customerReviewModalOpen, setCustomerReviewModalOpen] = useState(false);
  const [custReviewName, setCustReviewName] = useState("");
  const [custReviewRating, setCustReviewRating] = useState(5);
  const [custReviewComment, setCustReviewComment] = useState("");
  const [custReviewSubmitting, setCustReviewSubmitting] = useState(false);
  const [custReviewSuccess, setCustReviewSuccess] = useState(false);

  // Dynamic Custom Cake Showcase State (Reads live from Neon database settings via context)
  const cakeSlides = (contextCakeSlides && contextCakeSlides.length > 0) ? contextCakeSlides : [
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
    {
      src: "/placeholders/box-1.jpg",
      title: "بوكس حفلات وأفراح ملكي متكامل",
      flavor: "تشكيلة ميني كيك وكب كيك وتورتة",
      tiers: "مجموعة ضيافة كاملة",
    },
  ];

  const [activeCakeSlide, setActiveCakeSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCakeSlide((prev) => (prev + 1) % cakeSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [cakeSlides.length]);

  useEffect(() => {
    Promise.all([
      getCategories().catch(() => []),
      getProducts({ size: 100 }).catch(() => ({ content: [], totalElements: 0, totalPages: 0 })),
      getFeaturedReviews().catch(() => [])
    ]).then(([cats, prods, revs]) => {
      setCategories(cats);
      const list = prods.content || [];
      setAllProducts(list);
      setFeaturedProducts(list.slice(0, 6));
      if (Array.isArray(revs) && revs.length > 0) {
        setDynamicReviews(revs);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Map each category to all images of products inside this category
  const categoryImagesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    allProducts.forEach((p) => {
      const cat = categories.find((c) => c.id === p.categoryId || (p.categorySlug && c.slug === p.categorySlug));
      const keys: string[] = [];
      if (cat?.id) keys.push(cat.id);
      if (cat?.slug) keys.push(cat.slug);
      if (p.categoryId && !keys.includes(p.categoryId)) keys.push(p.categoryId);
      if (p.categorySlug && !keys.includes(p.categorySlug)) keys.push(p.categorySlug);

      if (keys.length === 0) return;

      const imgs: string[] = [];
      if (p.primaryImageUrl) imgs.push(p.primaryImageUrl);
      if (p.imageUrl && !imgs.includes(p.imageUrl)) imgs.push(p.imageUrl);
      if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
          if (img && !imgs.includes(img)) imgs.push(img);
        });
      }

      keys.forEach((k) => {
        if (!map[k]) map[k] = [];
        imgs.forEach((img) => {
          if (img && !map[k].includes(img)) {
            map[k].push(img);
          }
        });
      });
    });
    return map;
  }, [allProducts, categories]);

  const handleSubmitCustomerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custReviewName.trim() || !custReviewComment.trim()) return;
    setCustReviewSubmitting(true);
    try {
      await createAdminReview({
        customerName: custReviewName.trim(),
        rating: custReviewRating,
        comment: custReviewComment.trim(),
        isFeatured: true,
      });
      playJoyfulChime();
      setCustReviewSuccess(true);
      setTimeout(() => {
        setCustomerReviewModalOpen(false);
        setCustReviewSuccess(false);
        setCustReviewName("");
        setCustReviewComment("");
        setCustReviewRating(5);
        getFeaturedReviews().then((revs) => {
          if (Array.isArray(revs) && revs.length > 0) setDynamicReviews(revs);
        }).catch(() => []);
      }, 2500);
    } catch {
      // Fallback
    } finally {
      setCustReviewSubmitting(false);
    }
  };

  const handleQuickAdd = async (product: ProductDto) => {
    playJoyfulChime();
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#FF5E8E", "#38BDF8", "#F472B6", "#7DD3FC"],
      });
    } catch {
      // Ignore
    }

    await addToCart({
      productId: product.id,
      quantity: 1,
      selectedOptionValueIds: [],
      selectedAddonIds: []
    });
  };

  const getProductImage = (product: ProductDto) => {
    if (product.primaryImageUrl) {
      return product.primaryImageUrl;
    }
    if (product.slug?.includes("vanilla")) return "/placeholders/cupcake-1.jpg";
    if (product.slug?.includes("chocolate")) return "/placeholders/cake-1.jpg";
    if (product.slug?.includes("caramel")) return "/placeholders/cupcake-2.jpg";
    if (product.slug?.includes("strawberry")) return "/placeholders/cake-2.jpg";
    if (product.slug?.includes("box")) return "/placeholders/box-1.jpg";
    if (product.slug?.includes("gateau") || product.slug?.includes("pistachio")) return "/placeholders/gateau-1.jpg";
    return "/placeholders/cupcake-1.jpg";
  };

  return (
    <div className="relative min-h-screen space-y-20 pb-24 overflow-x-hidden">
      
      {/* Top Promotional Announcement Banner (controlled by Admin) */}
      {promoBannerActive && promoBannerText && (
        <aside aria-label="العروض الترويجية" className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white text-xs font-black py-2.5 px-4 text-center shadow-sm flex items-center justify-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-spin" />
          <span>{promoBannerText}</span>
        </aside>
      )}

      {/* 1. The Imaginative Sweet Hero Showcase (Vibrant Pink & Baby Blue Identity) */}
      <ImaginativeHero />

      {/* 2. Immediate In-Stock Showcase (متاح في الستوك للتسليم الفوري اليوم) */}
      <section id="stock-showcase-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-pink-50/90 dark:from-[#0d1d33] dark:via-[#111f38] dark:to-[#1a1528] border-2 border-sky-200/90 dark:border-sky-900/50 p-8 sm:p-12 shadow-xl shadow-sky-100/50 dark:shadow-none space-y-8 transition-colors duration-300">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-sky-200 animate-pulse">
                <Zap className="w-4 h-4" />
                <span>متاح في الستوك اليوم • تسليم فوري</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                حلويات طازجة جاهزة للاستلام الفوري الآن
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl font-medium">
                قطع مخبوزة اليوم بكميات محدودة في الفرع بالمعادي، جاهزة للتوصيل المبرد فوراً دون الحاجة لانتظار ساعات التجهيز!
              </p>
            </div>

            <Link
              href="/shop?availability=IN_STOCK"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 font-black text-xs hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-400 transition shadow-sm flex items-center gap-2 self-start sm:self-auto btn-pop"
            >
              <span>عرض كل عناصر الستوك</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts
              .filter((p) => !p.isPreOrder)
              .slice(0, 3)
              .map((product) => {
                const imgUrl = getProductImage(product);
                return (
                  <div
                    key={product.id}
                    className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-4 border border-sky-100 dark:border-sky-900/40 shadow-md hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 flex items-center gap-4 group"
                  >
                    <Link href={`/product/${product.id}`} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-sky-50 flex-shrink-0 border border-sky-100 block cursor-pointer">
                      <Image
                        src={imgUrl}
                        alt={product.nameAr}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          جاهز ({product.stockQuantity || 12} قطعة)
                        </span>
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <h4 className="font-black text-sm text-slate-900 truncate hover:text-sky-600 transition-colors cursor-pointer">
                          {product.nameAr}
                        </h4>
                      </Link>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <span className="font-black text-slate-900 text-sm">
                          {product.basePrice.toFixed(2)} <span className="text-[10px] font-black text-pink-600">ج.م</span>
                        </span>
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:brightness-105 text-white text-xs font-black shadow-sm transition active:scale-95"
                        >
                          + طلب فوري
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 3. Category Browse Grid (تصفح تشكيلات الحلويات الشهية) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-pink-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-pink-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>أصنافنا المتنوعة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              تصفح تشكيلات الحلويات الشهية
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-black text-pink-600 hover:text-pink-700 transition flex items-center gap-1.5 self-start sm:self-auto bg-pink-50 px-4 py-2 rounded-2xl border border-pink-200 shadow-sm"
          >
            <span>عرض القائمة الكاملة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat, idx) => {
            const fallbackImages = [
              "/placeholders/cupcake-1.jpg",
              "/placeholders/cake-1.jpg",
              "/placeholders/gateau-1.jpg",
              "/placeholders/cupcake-2.jpg",
              "/placeholders/box-1.jpg",
            ];
            const fallback = fallbackImages[idx % fallbackImages.length];
            const productImages = (categoryImagesMap[cat.id]?.length ? categoryImagesMap[cat.id] : categoryImagesMap[cat.slug]) || [];

            return (
              <CategorySlideshowCard
                key={cat.id}
                cat={cat}
                images={productImages}
                fallbackImage={fallback}
              />
            );
          })}
        </div>
      </section>

      {/* 4. Featured Bestsellers Section (إبداعاتنا الأكثر طلباً وإعجاباً) */}
      <section id="products-catalog-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-pink-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>الأعلى مبيعاً وتقييماً</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              إبداعات لولو كب كيك الأكثر طلباً
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-black text-pink-600 hover:text-pink-700 transition flex items-center gap-1.5 self-start sm:self-auto bg-pink-50 px-4 py-2 rounded-2xl border border-pink-200 shadow-sm"
          >
            <span>جميع المنتجات ({featuredProducts.length})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl glass-dream border border-pink-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const imgUrl = getProductImage(product);
              return (
                <div 
                  key={product.id}
                  className="rounded-3xl glass-dream overflow-hidden border border-pink-100 hover:border-pink-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group"
                >
                  {/* Product Visual Container */}
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-sky-50 cursor-pointer">
                      <Image
                        src={imgUrl}
                        alt={product.nameAr}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60" />

                      {/* Freshness Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-pink-600 text-[10px] font-black shadow-md border border-pink-100 backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-pink-500" />
                        <span>{product.slug?.includes("box") ? "بوكس فاخر" : "طازج اليوم"}</span>
                      </div>

                      <div className="absolute bottom-3 right-3 text-white">
                        <span className="text-[10px] block opacity-90 font-bold">زمن التجهيز</span>
                        <span className="text-xs font-black flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>{product.leadTimeHours || 2} ساعات</span>
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Product Details & Actions */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-black text-lg text-slate-900 hover:text-pink-600 transition-colors line-clamp-1 cursor-pointer">
                          {product.nameAr}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2 font-medium">
                        {product.descriptionAr || "محضر يومياً بأرقى المكونات الطبيعية والزبدة النيوزيلندية الفاخرة."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-pink-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">السعر</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">
                            {product.basePrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-black text-pink-600">ج.م</span>
                        </div>
                      </div>

                      {product.isCustomizable ? (
                        <Link
                          href={`/shop?category=${product.slug}`}
                          className="px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs transition border border-sky-200 flex items-center gap-1.5 btn-pop"
                        >
                          <span>تخصيص</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 text-white font-black text-xs shadow-md shadow-pink-200 hover:shadow-sky-300 transition flex items-center gap-2 btn-pop active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-white" />
                          <span>إضافة للسلة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Custom Cake 3D Laboratory (ورشة تفصيل وتصميم التورتة ثلاثية الأبعاد) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 dark:from-[#111827] dark:via-[#1c162e] dark:to-[#0d1d33] border-2 border-pink-200 dark:border-pink-900/50 p-8 sm:p-14 shadow-xl relative overflow-hidden transition-colors duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-right">
              <span className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/90 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 text-xs font-black inline-flex items-center gap-2 shadow-sm">
                <Cake className="w-4 h-4 text-pink-500" />
                <span>{customCakeBadge || "ورشة تفصيل وتصميم التورتات الخاصة 🎂"}</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {customCakeTitle ? (
                  <span className="whitespace-pre-line">{customCakeTitle}</span>
                ) : (
                  <>
                    هل لديك فكرة أو تصميم مميز؟ <br />
                    <span className="pink-blue-gradient-text">سنحولها لتورتة أحلامك ثلاثية الأبعاد</span>
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium whitespace-pre-line">
                {customCakeSubtitle || "شاركنا تفاصيل مناسبتك، حجم التورتة وعدد الأدوار، النكهات المفضلة، وصورة التصميم الذي يعجبك. سيقوم شيف لولو كب كيك بمراجعة فكرتك وإرسال عرض سعر فني دقيق خلال وقت قياسي."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/custom-cake"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 text-white font-black text-sm shadow-xl shadow-pink-200 hover:shadow-sky-300 transition flex items-center gap-2.5 btn-pop active:scale-95"
                >
                  <Cake className="w-4 h-4 text-white" />
                  <span>{customCakeCtaPrimary || "صمم واطلب تسعير تورتتك الخاصة 3D"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <Link
                  href="/track"
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-300 font-black text-xs hover:bg-pink-50 dark:hover:bg-slate-700 transition shadow-sm btn-pop"
                >
                  <span>{customCakeCtaSecondary || "متابعة عرض سعر سابق"}</span>
                </Link>
              </div>

              {/* Interactive Thumbnail Selector for Custom Cakes */}
              <div className="pt-2 border-t border-pink-200/60 dark:border-pink-900/40">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  تصفح نماذج من إبداعات التورتات المخصصة:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {cakeSlides.map((cs, cIdx) => (
                    <button
                      key={cs.src + cIdx}
                      type="button"
                      onClick={() => setActiveCakeSlide(cIdx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        cIdx === activeCakeSlide
                          ? "bg-pink-500 text-white shadow-sm scale-105"
                          : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{cs.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Cake Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 group">
                {cakeSlides.map((cs, cIdx) => (
                  <div
                    key={cs.src + cIdx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      cIdx === activeCakeSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                    }`}
                  >
                    <Image
                      src={cs.src}
                      alt={cs.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                  </div>
                ))}

                {/* Top Badge */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-pink-800 shadow-sm text-[11px] font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span>{cakeSlides[activeCakeSlide]?.tiers || "تورتة مخصصة 3D"}</span>
                </div>

                {/* Bottom Info Card */}
                <div className="absolute bottom-4 right-4 left-4 z-20 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-100 dark:border-pink-900/60 shadow-lg text-right">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                    {cakeSlides[activeCakeSlide]?.title}
                  </h4>
                  <p className="text-[11px] text-pink-600 dark:text-pink-400 font-bold">
                    {cakeSlides[activeCakeSlide]?.flavor}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Facebook Community & Live n8n Automation */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-pink-500 rounded-[36px] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-right max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>مجتمع لولو كب كيك على فيسبوك • نشر آلي مباشر</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black">
              تابع أحدث كليكشنات الكيك وعروضنا الحصرية أولاً بأول! 🎂
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
              يتم نشر أحدث الحلويات والبوكسات اليومية تلقائياً على صفحتنا الرسمية عبر روبوت الأتمتة الذكي (n8n Webhook)، تفاعل معنا واطلب بنقرة واحدة!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href={facebookPageUrl || "https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR"}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-lg hover:bg-blue-50 active:scale-95 transition flex items-center gap-3 btn-pop"
            >
              <span>زيارة صفحة فيسبوك</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-xs font-black block">نظام النشر الآلي</span>
              <span className="text-[11px] text-sky-200 block font-bold">متصل عبر n8n ⚡</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Client Testimonials (آراء عملاء لولو كب كيك الكرام - تحكم كامل من الأدمن وإمكانية إضافة رأي) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-center sm:text-right">
          <div>
            <span className="text-xs font-black text-pink-600 uppercase tracking-wider block mb-1">
              آراء عملائنا الكرام • Customer Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              ماذا يقول عملاؤنا عن لولو كب كيك؟
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCustomerReviewModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 self-center sm:self-auto btn-pop"
          >
            <Plus className="w-4 h-4" />
            <span>شاركنا رأيك وتجربتك ✍️</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(dynamicReviews.length > 0 ? dynamicReviews : [
            {
              id: "def-1",
              customerName: "مريم الشريف",
              comment: "أجمل تورتة فرح ذقتها في حياتي! التصميم كان مطابق تماماً للصورة اللي بعتها، ومذاق الكريمة البلجيكية مع الفراولة نال إعجاب كل المعازيم بدون استثناء.",
              rating: 5,
              createdAt: "التجمع الخامس • كعكة زفاف"
            },
            {
              id: "def-2",
              customerName: "م. عمر الألفي",
              comment: "بوكس الكب كيك المشكل دايماً اختياري الأول لأي عزومة أو هدية. الهشاشة والطعم الفاخر مش موجودين في أي مكان تاني في مصر والتوصيل بيوصل في معاده بالضبط.",
              rating: 5,
              createdAt: "المعادي • زبون دائم"
            },
            {
              id: "def-3",
              customerName: "د. نورهان فهمي",
              comment: "سهولة الطلب وتتبع السائق والإشعار أول بأول خلت التجربة ممتازة جداً. تعامل راقي وحلويات تليق بأفخم المناسبات.",
              rating: 5,
              createdAt: "الزمالك • طلب مناسبات"
            }
          ]).map((rev) => (
            <div key={rev.id} className="glass-dream p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-900 block">{rev.customerName}</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {rev.createdAt ? (rev.createdAt.includes("-") ? new Date(rev.createdAt).toLocaleDateString("ar-EG") : rev.createdAt) : "عميل معتمد ⭐"}
                  </span>
                </div>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Customer Review Modal */}
        {customerReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-pink-200">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>اكتب رأيك في حلويات لولو كب كيك</span>
                </h4>
                <button
                  onClick={() => setCustomerReviewModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {custReviewSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h5 className="font-black text-slate-900 text-base">شكراً جزيلاً لرأيك الجميل 🌸!</h5>
                  <p className="text-xs text-slate-500">تم تسجيل تقييمك وسيظهر في المتجر للجميع قريباً.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitCustomerReview} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسمك الكريم *:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سارة محمد - المعادي"
                      value={custReviewName}
                      onChange={(e) => setCustReviewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">التقييم بالنجوم:</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setCustReviewRating(s)}
                          className={`p-2 rounded-xl border transition ${
                            custReviewRating >= s ? "bg-amber-50 border-amber-400 text-amber-500" : "bg-slate-50 border-slate-200 text-slate-300"
                          }`}
                        >
                          <Star className={`w-5 h-5 ${custReviewRating >= s ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      ))}
                      <span className="font-black text-amber-800 mr-2">{custReviewRating} نجوم</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رأيك وتجربتك معنا *:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="أخبرنا عن طعم الحلويات وسرعة التوصيل..."
                      value={custReviewComment}
                      onChange={(e) => setCustReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => setCustomerReviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={custReviewSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black hover:brightness-105 transition shadow disabled:opacity-50"
                    >
                      {custReviewSubmitting ? "جاري الإرسال..." : "إرسال التقييم ⭐"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 8. Commitments & Guarantees (ضمانات الجودة والتميز) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-dream p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">مكونات نقية</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-bold">زبدة طبيعية وشوكولاتة بلجيكية</p>
            </div>
          </div>

          <div className="glass-dream p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">دقة المواعيد</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-bold">حجز مواعيد تسليم بالساعة</p>
            </div>
          </div>

          <div className="glass-dream p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">سيارات مبردة</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-bold">توصيل آمن يحفظ رونق الكيك</p>
            </div>
          </div>

          <div className="glass-dream p-5 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">دفع آمن</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-bold">كاش أو محافظ إلكترونية وتحويلات</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
