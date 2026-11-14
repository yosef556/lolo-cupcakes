"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getCategories, getProducts, CategoryDto, ProductDto } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  X, 
  Plus, 
  Minus, 
  Clock, 
  Check, 
  Star, 
  SlidersHorizontal,
  Flame,
  ArrowLeft,
  LayoutList,
  LayoutGrid,
  Zap,
  Heart,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useStoreSettings } from "@/components/StoreSettingsContext";

interface SubcategoryDef {
  id: string;
  nameAr: string;
  keywords: string[];
}

const CATEGORY_META: Record<string, { icon: string; subcategories: SubcategoryDef[] }> = {
  oriental: {
    icon: "🍯",
    subcategories: [
      { id: "ALL", nameAr: "كل الشرقي ✨", keywords: [] },
      { id: "BASBOUSA", nameAr: "بسبوسة فاخرة (سادة / قشطة / مانجو)", keywords: ["بسبوسة", "بسبوسه", "قشطة", "قشطه", "مانجو"] },
      { id: "KUNAFA", nameAr: "كنافة نابلسية وقشطة ونوتيلا", keywords: ["كنافة", "كنافه", "نابلسية", "نوتيلا"] },
      { id: "BAKLAWA", nameAr: "بقلاوة وجلاش وأساور فستق", keywords: ["بقلاوة", "بقلاوه", "جلاش", "فستق", "مكسرات"] },
    ]
  },
  "tarts-pastries": {
    icon: "🥐",
    subcategories: [
      { id: "ALL", nameAr: "كل المخبوزات 🥐", keywords: [] },
      { id: "ECLAIR", nameAr: "إكلير فرنسي (شوكولاتة / لوتس / فستق)", keywords: ["إكلير", "اكلير", "eclair"] },
      { id: "TART", nameAr: "تارت فرنسي وفواكه طبيعية", keywords: ["تارت", "tart"] },
      { id: "CROISSANT", nameAr: "كرواسون ودانيش زبدة", keywords: ["كرواسون", "croissant", "دانيش"] },
    ]
  },
  cakes: {
    icon: "🎂",
    subcategories: [
      { id: "ALL", nameAr: "جميع التورتات 🎂", keywords: [] },
      { id: "CHOC", nameAr: "تورتات شوكولاتة كيندر وفادج", keywords: ["شوكولاتة", "كيندر", "نوتيلا", "فادج", "chocolate"] },
      { id: "FRUIT", nameAr: "تورتات فواكه وريد فيلفيت", keywords: ["فواكه", "فراولة", "توت", "ريد فيلفيت", "red velvet"] },
      { id: "OCCASION", nameAr: "تورتات مناسبات وأفراح 3D", keywords: ["مناسبات", "أفراح", "ميلاد", "دورين", "3d"] },
    ]
  },
  cupcakes: {
    icon: "🧁",
    subcategories: [
      { id: "ALL", nameAr: "كل الكب كيك 🧁", keywords: [] },
      { id: "VANILLA", nameAr: "فانيليا وتوت بري وفراولة", keywords: ["فانيليا", "توت", "فراولة", "vanilla", "strawberry"] },
      { id: "CHOC", nameAr: "شوكولاتة كيندر ونوتيلا", keywords: ["شوكولاتة", "كيندر", "نوتيلا", "chocolate"] },
      { id: "LOTUS", nameAr: "لوتس كراميل وأوريو", keywords: ["لوتس", "أوريو", "اوريو", "lotus", "oreo"] },
    ]
  },
  gateaux: {
    icon: "🍰",
    subcategories: [
      { id: "ALL", nameAr: "كل الجاتوه 🍰", keywords: [] },
      { id: "MILLE_FEUILLE", nameAr: "ميلفيه فاخر بالكريمة والمربى", keywords: ["ميلفيه", "ميل في"] },
      { id: "MOUSSE", nameAr: "قطع موس وشوكولاتة بلجيكية", keywords: ["موس", "شوكولاتة"] },
      { id: "SOIRÉE", nameAr: "قطع سواريه مشكلة للحفلات", keywords: ["سواريه", "مشكل"] },
    ]
  },
  boxes: {
    icon: "🎁",
    subcategories: [
      { id: "ALL", nameAr: "كل البوكسات 🎁", keywords: [] },
      { id: "MINI", nameAr: "بوكس ميني كب كيك (12 / 24 قطعة)", keywords: ["كب كيك", "ميني", "12", "24"] },
      { id: "MIX", nameAr: "بوكس مشكل شرقي وغربي", keywords: ["مشكل", "مكس"] },
      { id: "GIFTS", nameAr: "بوكسات هدايا وتوزيعات فاخرة", keywords: ["هدية", "هدايا", "توزيعات"] },
    ]
  },
  cheesecakes: {
    icon: "🧀",
    subcategories: [
      { id: "ALL", nameAr: "كل التشيز كيك 🧀", keywords: [] },
      { id: "BAKED", nameAr: "تشيز كيك مخبوز (سان سيباستيان / نيويورك)", keywords: ["سان سيباستيان", "نيويورك", "مخبوز"] },
      { id: "COLD", nameAr: "تشيز كيك بارد (لوتس / بلوبيري)", keywords: ["لوتس", "بلوبيري", "فراولة", "بارد"] },
    ]
  }
};

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialAvailability = (searchParams.get("availability") as "ALL" | "IN_STOCK" | "PRE_ORDER") || "ALL";

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { minOrderAmount = 150, inactiveProductBadgeText } = useStoreSettings();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "IN_STOCK" | "PRE_ORDER">(initialAvailability);
  const [selectedFlavorTag, setSelectedFlavorTag] = useState<string>("ALL");
  const [selectedDietary, setSelectedDietary] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"FEATURED" | "PRICE_ASC" | "PRICE_DESC" | "LEAD_TIME">("FEATURED");
  const [viewMode, setViewMode] = useState<"LIST" | "GRID">("LIST");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Floating Toast Notification
  const [toastMsg, setToastMsg] = useState<{ title: string; price: number } | null>(null);

  // Customization Modal State
  const [activeProduct, setActiveProduct] = useState<ProductDto | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart, openDrawer } = useCart();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({
      categorySlug: selectedCategory || undefined,
      search: searchQuery || undefined,
      size: 50
    })
      .then((res) => {
        setProducts(res.content);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

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

  const handleOpenCustomize = (product: ProductDto) => {
    setActiveProduct(product);
    setSelectedAddons([]);
    setCustomNote("");
    setQuantity(1);

    const defaults: Record<string, string> = {};
    product.optionGroups?.forEach((group) => {
      const defVal = group.values.find((v) => v.isDefault) || group.values[0];
      if (defVal) {
        defaults[group.id] = defVal.id;
      }
    });
    setSelectedOptions(defaults);
  };

  const showToast = (title: string, price: number) => {
    setToastMsg({ title, price });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleAddToCartFromModal = async (andCheckout = false) => {
    if (!activeProduct) return;
    const optionValueIds = Object.values(selectedOptions);
    const addedPrice = calculateModalTotal();
    const prodName = activeProduct.nameAr;

    if (andCheckout) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "direct_checkout_item",
          JSON.stringify({
            productId: activeProduct.id,
            productName: prodName,
            productImage: getProductImage(activeProduct),
            quantity,
            selectedOptionValueIds: optionValueIds,
            selectedAddonIds: selectedAddons,
            customerNote: customNote || undefined,
            unitPrice: addedPrice / quantity,
            totalPrice: addedPrice,
          })
        );
      }
      setActiveProduct(null);
      router.push("/checkout?direct=1");
      return;
    }

    await addToCart({
      productId: activeProduct.id,
      quantity,
      selectedOptionValueIds: optionValueIds,
      selectedAddonIds: selectedAddons,
      customerNote: customNote || undefined
    }, true);

    setActiveProduct(null);
    showToast(prodName, addedPrice);
  };

  const handleQuickAdd = async (product: ProductDto) => {
    if (product.optionGroups?.length > 0 || product.addons?.length > 0) {
      handleOpenCustomize(product);
      return;
    }

    await addToCart({
      productId: product.id,
      quantity: 1,
      selectedOptionValueIds: [],
      selectedAddonIds: []
    });

    showToast(product.nameAr, product.basePrice);
  };

  const handleBuyNow = (product: ProductDto) => {
    if (product.optionGroups?.length > 0 || product.addons?.length > 0) {
      handleOpenCustomize(product);
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "direct_checkout_item",
        JSON.stringify({
          productId: product.id,
          productName: product.nameAr,
          productImage: getProductImage(product),
          quantity: 1,
          unitPrice: product.basePrice,
          totalPrice: product.basePrice,
        })
      );
    }
    router.push("/checkout?direct=1");
  };

  const calculateModalTotal = () => {
    if (!activeProduct) return 0;
    let unit = activeProduct.basePrice;

    activeProduct.optionGroups?.forEach((grp) => {
      const selectedValId = selectedOptions[grp.id];
      const val = grp.values.find((v) => v.id === selectedValId);
      if (val) unit += val.priceDelta;
    });

    activeProduct.addons?.forEach((addon) => {
      if (selectedAddons.includes(addon.id)) {
        unit += addon.price;
      }
    });

    return unit * quantity;
  };

  // Filter & Sort Products on Client
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Flavor/Dietary tag
    if (selectedFlavorTag === "CHOCOLATE") {
      result = result.filter((p) => p.nameAr.includes("شوكولاتة") || p.slug.includes("chocolate"));
    } else if (selectedFlavorTag === "BERRY") {
      result = result.filter((p) => p.nameAr.includes("توت") || p.nameAr.includes("فراولة") || p.slug.includes("strawberry"));
    } else if (selectedFlavorTag === "PISTACHIO") {
      result = result.filter((p) => p.nameAr.includes("فستق") || p.nameAr.includes("مكسرات") || p.slug.includes("pistachio"));
    } else if (selectedFlavorTag === "SUGAR_FREE") {
      result = result.filter((p) => p.descriptionAr?.includes("سكر") || p.descriptionAr?.includes("طبيعي"));
    } else if (selectedFlavorTag === "POPULAR") {
      result = result.filter((p) => p.isCustomizable || p.basePrice >= 45);
    }

    // Filter by Dietary Preference (USER REQUEST)
    if (selectedDietary !== "ALL") {
      result = result.filter((p) => {
        const text = `${p.nameAr} ${p.nameEn || ""} ${p.descriptionAr || ""} ${p.slug}`.toLowerCase();
        if (selectedDietary === "VEGAN") return text.includes("نباتي") || text.includes("vegan") || text.includes("نباتيه");
        if (selectedDietary === "GLUTEN_FREE") return text.includes("جلوتين") || text.includes("gluten");
        if (selectedDietary === "SUGAR_FREE") return text.includes("سكر") || text.includes("دايت") || text.includes("sugar");
        if (selectedDietary === "KETO") return text.includes("كيتو") || text.includes("keto");
        return true;
      });
    }

    // Filter by Availability (Stock vs Pre-Order)
    if (availabilityFilter === "IN_STOCK") {
      result = result.filter((p) => !p.isPreOrder && (p.stockQuantity ?? 1) > 0);
    } else if (availabilityFilter === "PRE_ORDER") {
      result = result.filter((p) => p.isPreOrder);
    }

    // Filter by Subcategory (USER REQUEST: معجنات -> اكلير / شرقي -> بسبوسة وكنافة)
    if (selectedCategory && selectedSubcategory !== "ALL") {
      const subList = CATEGORY_META[selectedCategory]?.subcategories;
      const subDef = subList?.find((s) => s.id === selectedSubcategory);
      if (subDef && subDef.keywords.length > 0) {
        result = result.filter((p) => {
          const text = `${p.nameAr} ${p.nameEn || ""} ${p.descriptionAr || ""} ${p.slug}`.toLowerCase();
          return subDef.keywords.some((kw) => text.includes(kw.toLowerCase()));
        });
      }
    }

    // Sort
    if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === "LEAD_TIME") {
      result.sort((a, b) => (a.leadTimeHours || 2) - (b.leadTimeHours || 2));
    }

    return result;
  }, [products, selectedCategory, selectedSubcategory, selectedFlavorTag, selectedDietary, sortBy, availabilityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      
      {/* Floating Interactive Toast */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-rose-400/40 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
            🧁
          </div>
          <div className="text-right">
            <span className="text-xs font-black block">تمت الإضافة إلى سلتك الملكية بنجاح!</span>
            <span className="text-[11px] text-rose-300 block">{toastMsg.title} ({toastMsg.price.toFixed(2)} ج.م)</span>
          </div>
          <button
            onClick={() => { setToastMsg(null); openDrawer(); }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black hover:brightness-110 transition shadow-sm flex items-center gap-1"
          >
            <span>عرض السلة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-pink-400 border border-sky-200 dark:border-slate-700 shadow-sm">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>تشكيلة الحلويات الفاخرة والطازجة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          اختر حلواك المفضلة اليوم 🧁
        </h1>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          جميع الأصناف تُحضر يدوياً بكل حب وبأجود المكونات الطبيعية. أسعار دقيقة ومؤكدة على السيرفر مباشرة.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="max-w-md mx-auto relative px-1">
          <input
            type="text"
            placeholder="ابحث عن الكب كيك، التورتة، المخبوزات، أو الشرقي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-11 pl-10 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent shadow-xs transition-all"
          />
          <Search className="w-4 h-4 text-rose-400 dark:text-pink-400 absolute top-3.5 right-4 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 absolute top-2.5 left-3 flex items-center justify-center text-xs transition"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Categories Navigation (Mobile-Friendly Smooth Horizontal Scroll) */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar pt-1 px-1">
            <button
              onClick={() => { setSelectedCategory(""); setSelectedSubcategory("ALL"); }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 shadow-xs ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white shadow-rose-glow scale-102"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-100 dark:border-slate-700"
              }`}
            >
              <span>✨</span>
              <span>جميع الحلويات</span>
            </button>
            {categories.map((cat) => {
              const icon = CATEGORY_META[cat.slug]?.icon || "🧁";
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setSelectedSubcategory("ALL"); }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white shadow-rose-glow scale-102"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-100 dark:border-slate-700"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{cat.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hierarchical Subcategories Chips Bar (Contextual) */}
        {selectedCategory && CATEGORY_META[selectedCategory]?.subcategories && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 bg-rose-50/70 dark:bg-slate-800/80 rounded-2xl border border-rose-100 dark:border-slate-700 scrollbar-none no-scrollbar animate-in fade-in">
            <span className="text-[11px] font-black text-rose-700 dark:text-pink-400 shrink-0 flex items-center gap-1 pl-2 border-l border-rose-200 dark:border-slate-700">
              <span>الأصناف:</span>
            </span>
            {CATEGORY_META[selectedCategory].subcategories.map((sub) => {
              const isSubActive = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 shadow-xs ${
                    isSubActive
                      ? "bg-rose-500 text-white shadow-sm font-black"
                      : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-600 hover:bg-rose-50 dark:hover:bg-slate-600"
                  }`}
                >
                  {sub.nameAr}
                </button>
              );
            })}
          </div>
        )}

        {/* Unified Sleek Mobile-Friendly Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-rose-100 dark:border-slate-800">
          
          {/* Availability Pills (Compact) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setAvailabilityFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                availabilityFilter === "ALL"
                  ? "bg-slate-900 dark:bg-pink-600 text-white font-black shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setAvailabilityFilter("IN_STOCK")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                availabilityFilter === "IN_STOCK"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-xs"
                  : "text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>⚡ متوفر فورياً</span>
            </button>
            <button
              onClick={() => setAvailabilityFilter("PRE_ORDER")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                availabilityFilter === "PRE_ORDER"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-xs"
                  : "text-rose-700 dark:text-pink-300 hover:bg-rose-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>🕒 حجز مسبق</span>
            </button>
          </div>

          {/* Right Toolbar Actions: Filter Toggle & View Switcher */}
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border shadow-xs ${
                isFilterPanelOpen || (selectedFlavorTag !== "ALL" || selectedDietary !== "ALL" || sortBy !== "FEATURED")
                  ? "bg-rose-500 text-white border-rose-500 shadow-rose-glow"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-rose-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>فلترة متقدمة</span>
              {(selectedFlavorTag !== "ALL" || selectedDietary !== "ALL" || sortBy !== "FEATURED") && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
              )}
              {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-rose-200 dark:border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("LIST")}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === "LIST"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-pink-400 hover:bg-rose-50 dark:hover:bg-slate-700"
                }`}
                title="عرض كقائمة"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === "GRID"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-pink-400 hover:bg-rose-50 dark:hover:bg-slate-700"
                }`}
                title="عرض كشبكة كروت"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {isFilterPanelOpen && (
          <div className="p-5 rounded-3xl bg-white border border-rose-200 shadow-md space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                <span>خيارات الفلترة والترتيب المتقدمة</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlavorTag("ALL");
                  setSelectedDietary("ALL");
                  setSortBy("FEATURED");
                }}
                className="text-[11px] text-rose-600 hover:underline font-bold"
              >
                مسح كل الفلاتر
              </button>
            </div>

            {/* Flavors Section */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">🍫 النكهة المفضلة:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "جميع النكهات" },
                  { id: "CHOCOLATE", label: "🍫 شوكولاتة بلجيكية" },
                  { id: "BERRY", label: "🍓 فواكه وتوت" },
                  { id: "PISTACHIO", label: "🥜 فستق ومكسرات" },
                  { id: "POPULAR", label: "🔥 الأكثر شعبية" },
                  { id: "SUGAR_FREE", label: "🌿 سكر خفيف وطبيعي" },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedFlavorTag(tag.id)}
                    className={`px-3 py-1 rounded-xl font-bold text-[11px] transition ${
                      selectedFlavorTag === tag.id
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-rose-50 text-slate-700 hover:bg-rose-100"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Section */}
            <div>
              <span className="text-[11px] font-bold text-emerald-700 block mb-1.5">🥗 أنظمة غذائية خاصة:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "الكل" },
                  { id: "VEGAN", label: "🌱 نباتي 100%" },
                  { id: "GLUTEN_FREE", label: "🌾 خالي من الجلوتين" },
                  { id: "SUGAR_FREE", label: "🍯 خالي من السكر" },
                  { id: "KETO", label: "🥑 كيتو دايت" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDietary(d.id)}
                    className={`px-3 py-1 rounded-xl font-bold text-[11px] transition ${
                      selectedDietary === d.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Section */}
            <div className="flex items-center justify-between pt-2 border-t border-rose-50">
              <span className="text-[11px] font-bold text-slate-500">ترتيب النتائج حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="FEATURED">الأكثر تميزاً ⭐</option>
                <option value="PRICE_ASC">السعر: من الأقل للأعلى ⬆️</option>
                <option value="PRICE_DESC">السعر: من الأعلى للأقل ⬇️</option>
                <option value="LEAD_TIME">الأسرع تحضيراً ⏱️</option>
              </select>
            </div>
          </div>
        )}

      </div>

      {/* Products Display (List or Grid) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-white border border-rose-100 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 max-w-md mx-auto p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">لا توجد نتائج مطابقة لهذا الفلتر</h3>
          <p className="text-xs text-slate-500 mb-6">
            جرب إعادة تعيين النكهة أو اختر تصنيفاً آخر من القائمة أعلاه
          </p>
          <button
            onClick={() => { setSelectedCategory(""); setSelectedFlavorTag("ALL"); setSearchQuery(""); }}
            className="px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : viewMode === "LIST" ? (
        /* ================= LIST VIEW (User Request: زي ليست كدا مش جنب بعض) ================= */
        <div className="space-y-5 pt-4">
          {filteredProducts.map((prod) => {
            const imgUrl = getProductImage(prod);
            const hasOptions = prod.optionGroups?.length > 0 || prod.addons?.length > 0;

            return (
              <div
                key={prod.id}
                className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/95 border border-rose-100 dark:border-slate-700/80 shadow-sm hover:shadow-luxury-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
              >
                {/* Visual Area (Right side in RTL) */}
                <Link href={`/product/${prod.id}`} className="md:w-72 lg:w-80 flex-shrink-0 block relative">
                  <div className="relative aspect-[16/10] md:h-full w-full overflow-hidden bg-rose-50 dark:bg-slate-900 cursor-pointer">
                    <Image
                      src={imgUrl}
                      alt={prod.nameAr}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 md:opacity-40" />

                    {/* Dynamic Availability & Stock Countdown Badge Top Right */}
                    {prod.isActive === false ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 text-amber-300 text-[10px] font-black backdrop-blur-sm border border-amber-400 shadow-md">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{inactiveProductBadgeText || "سيتوفر قريباً ✨"}</span>
                      </div>
                    ) : prod.isPreOrder ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/95 dark:bg-slate-800/95 text-rose-700 dark:text-pink-300 text-[10px] font-black backdrop-blur-sm border border-rose-200 dark:border-slate-700 shadow-sm">
                        <span>🕒 حجز مسبق (بالطلب)</span>
                      </div>
                    ) : prod.stockQuantity !== undefined && prod.stockQuantity <= 5 && prod.stockQuantity > 0 ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black backdrop-blur-sm border border-amber-600 shadow-sm animate-pulse">
                        <span>🔥 متبقي {prod.stockQuantity} فقط!</span>
                      </div>
                    ) : prod.stockQuantity === 0 ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-black backdrop-blur-sm border border-rose-400 shadow-sm">
                        <span>❌ نفدت الكمية</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50/95 dark:bg-slate-800/95 text-sky-800 dark:text-sky-300 text-[10px] font-black backdrop-blur-sm border border-sky-300 dark:border-slate-700 shadow-sm">
                        <span>⚡ متوفر بالستوك ({prod.stockQuantity || 15})</span>
                      </div>
                    )}

                    {/* Wishlist Heart Toggle Top Left */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-sm ${
                        isInWishlist(prod.id)
                          ? "bg-rose-500 text-white shadow-rose-200"
                          : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700"
                      }`}
                      title={isInWishlist(prod.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? "fill-white" : ""}`} />
                    </button>

                    {/* Rating Bottom Left */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-300 text-[10px] font-black backdrop-blur-sm border border-amber-300/30">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>4.9</span>
                    </div>

                    <div className="absolute bottom-3 right-3 text-white">
                      <span className="text-[10px] block opacity-80">التجهيز</span>
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{prod.leadTimeHours || 2} ساعات</span>
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Details & Actions (Left side in RTL) */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <Link href={`/product/${prod.id}`}>
                        <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-pink-400 transition-colors cursor-pointer">
                          {prod.nameAr}
                        </h3>
                      </Link>

                      {prod.categoryNameAr && (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-slate-700 px-2.5 py-1 rounded-full border border-rose-200 dark:border-slate-600">
                          {prod.categoryNameAr}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                      {prod.descriptionAr}
                    </p>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
                      {prod.isPreOrder ? (
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                          تحضير طازج خاص ({prod.leadTimeHours || 4} ساعات)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                          جاهز للتسليم الفوري اليوم 🛵
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 font-semibold">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>مخبوز طازج بالزبدة الطبيعية</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-rose-100 dark:border-slate-700">
                    <div className="flex items-baseline justify-between sm:justify-start gap-1">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-bold">السعر المعتمد</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-pink-400">
                            {prod.basePrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">جنية مصري</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                      {prod.isActive === false ? (
                        <div className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-not-allowed">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{inactiveProductBadgeText || "سيتوفر قريباً ✨"}</span>
                        </div>
                      ) : hasOptions ? (
                        <button
                          onClick={() => handleOpenCustomize(prod)}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-slate-700 text-rose-700 dark:text-pink-300 hover:bg-rose-100 dark:hover:bg-slate-600 font-bold text-xs transition border border-rose-200 dark:border-slate-600 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تخصيص وإضافة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(prod)}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-slate-700 text-rose-600 dark:text-pink-300 hover:bg-rose-500 hover:text-white dark:hover:bg-pink-600 font-bold text-xs active:scale-95 transition border border-rose-200 dark:border-slate-600 flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>إضافة للحقيبة</span>
                        </button>
                      )}

                      {prod.isActive !== false && (
                        prod.basePrice >= minOrderAmount ? (
                          <button
                            onClick={() => handleBuyNow(prod)}
                            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>شراء فوري ⚡</span>
                          </button>
                        ) : (
                          <span className="col-span-2 sm:col-span-1 text-[10px] text-slate-400 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-700 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600 text-center">
                            (الحد الأدنى {minOrderAmount} ج.م)
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {filteredProducts.map((prod) => {
            const imgUrl = getProductImage(prod);
            const hasOptions = prod.optionGroups?.length > 0 || prod.addons?.length > 0;

            return (
              <div
                key={prod.id}
                className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/95 border border-rose-100 dark:border-slate-700/80 shadow-sm hover:shadow-luxury-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Visual Area */}
                <div>
                  <Link href={`/product/${prod.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-rose-50 dark:bg-slate-900 cursor-pointer">
                      <Image
                        src={imgUrl}
                        alt={prod.nameAr}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />

                      {/* Dynamic Availability & Stock Countdown Badge Top Right */}
                      {prod.isActive === false ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 text-amber-300 text-[10px] font-black backdrop-blur-sm border border-amber-400 shadow-md">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{inactiveProductBadgeText || "سيتوفر قريباً ✨"}</span>
                        </div>
                      ) : prod.isPreOrder ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/95 dark:bg-slate-800/95 text-rose-700 dark:text-pink-300 text-[10px] font-black backdrop-blur-sm border border-rose-200 dark:border-slate-700 shadow-sm">
                          <span>🕒 حجز مسبق (بالطلب)</span>
                        </div>
                      ) : prod.stockQuantity !== undefined && prod.stockQuantity <= 5 && prod.stockQuantity > 0 ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black backdrop-blur-sm border border-amber-600 shadow-sm animate-pulse">
                          <span>🔥 متبقي {prod.stockQuantity} فقط!</span>
                        </div>
                      ) : prod.stockQuantity === 0 ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-black backdrop-blur-sm border border-rose-400 shadow-sm">
                          <span>❌ نفدت الكمية</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50/95 dark:bg-slate-800/95 text-sky-800 dark:text-sky-300 text-[10px] font-black backdrop-blur-sm border border-sky-300 dark:border-slate-700 shadow-sm">
                          <span>⚡ متوفر بالستوك ({prod.stockQuantity || 15})</span>
                        </div>
                      )}

                      {/* Wishlist Heart Toggle Top Left */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-sm ${
                          isInWishlist(prod.id)
                            ? "bg-rose-500 text-white shadow-rose-200"
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700"
                        }`}
                        title={isInWishlist(prod.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? "fill-white" : ""}`} />
                      </button>

                      {/* Rating Bottom Left */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-300 text-[10px] font-black backdrop-blur-sm border border-amber-300/30">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>4.9</span>
                      </div>

                      <div className="absolute bottom-3 right-3 text-white">
                        <span className="text-[10px] block opacity-80">التجهيز</span>
                        <span className="text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>{prod.leadTimeHours || 2} ساعات</span>
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link href={`/product/${prod.id}`}>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-pink-400 transition-colors cursor-pointer">
                          {prod.nameAr}
                        </h3>
                      </Link>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {prod.descriptionAr}
                    </p>

                    {/* Availability Status Badge & Social Proof */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap">
                      {prod.isPreOrder ? (
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                          يحتاج {prod.leadTimeHours || 4} ساعات تحضير طازج
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                          جاهز للتسليم الفوري اليوم 🛵
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 font-semibold">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>طُلب 24 مرة هذا الأسبوع</span>
                      </div>
                    </div>

                    {hasOptions && (
                      <div className="text-[11px] text-rose-600 dark:text-pink-400 font-bold flex items-center gap-1 mt-2">
                        <Sparkles className="w-3 h-3" />
                        <span>خيارات تخصيص وإضافات متعددة متاحة</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom / Action */}
                <div className="p-4 sm:p-6 pt-0">
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-rose-50 dark:border-slate-700 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-bold">السعر المعتمد</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-rose-600 dark:text-pink-400">
                          {prod.basePrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ج.م</span>
                      </div>
                    </div>
                  </div>

                  {prod.isActive === false ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs text-center border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{inactiveProductBadgeText || "سيتوفر قريباً ✨"}</span>
                    </div>
                  ) : prod.basePrice >= minOrderAmount ? (
                    <div className="grid grid-cols-2 gap-2">
                      {hasOptions ? (
                        <button
                          onClick={() => handleOpenCustomize(prod)}
                          className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-slate-700 text-rose-700 dark:text-pink-300 hover:bg-rose-100 dark:hover:bg-slate-600 font-bold text-xs transition border border-rose-200 dark:border-slate-600 flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تخصيص</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(prod)}
                          className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-slate-700 text-rose-600 dark:text-pink-300 hover:bg-rose-500 hover:text-white dark:hover:bg-pink-600 font-bold text-xs active:scale-95 transition border border-rose-200 dark:border-slate-600 flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>شراء فوري ⚡</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      {hasOptions ? (
                        <button
                          onClick={() => handleOpenCustomize(prod)}
                          className="w-full py-2.5 px-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تخصيص وإضافة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(prod)}
                          className="w-full py-2.5 px-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>إضافة للحقيبة</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Luxury Customization Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header with Product Preview */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-rose-100 dark:bg-slate-800 flex-shrink-0">
              <Image
                src={getProductImage(activeProduct)}
                alt={activeProduct.nameAr}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
              
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 right-4 text-white">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">تخصيص الحلوى</span>
                <h3 className="font-black text-xl">{activeProduct.nameAr}</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-right">
              
              {/* Option Groups (Single Choice / Size / Filling) */}
              {activeProduct.optionGroups?.map((group) => (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                      {group.nameAr}
                    </span>
                    {group.isRequired && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-rose-200 dark:border-pink-900/40">
                        مطلوب
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {group.values.map((val) => {
                      const isSelected = selectedOptions[group.id] === val.id;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => setSelectedOptions({ ...selectedOptions, [group.id]: val.id })}
                          className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                            isSelected
                              ? "bg-rose-50 dark:bg-slate-800 border-rose-500 text-rose-700 dark:text-pink-300 shadow-sm"
                              : "bg-white dark:bg-slate-800/60 border-rose-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50/40 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-rose-500 bg-rose-500" : "border-slate-300 dark:border-slate-600"}`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span>{val.nameAr}</span>
                          </div>
                          {val.priceDelta > 0 && (
                            <span className="text-[10px] text-rose-600 dark:text-pink-400 font-black">
                              +{val.priceDelta.toFixed(2)} ج.م
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Addons Selection (Multi Select) */}
              {activeProduct.addons && activeProduct.addons.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                    إضافات خاصة اختيارية
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {activeProduct.addons.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedAddons(selectedAddons.filter((id) => id !== addon.id));
                            } else {
                              setSelectedAddons([...selectedAddons, addon.id]);
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                            isChecked
                              ? "bg-rose-50 dark:bg-slate-800 border-rose-500 text-rose-700 dark:text-pink-300 shadow-sm"
                              : "bg-white dark:bg-slate-800/60 border-rose-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50/40 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isChecked ? "border-rose-500 bg-rose-500" : "border-slate-300 dark:border-slate-600"}`}>
                              {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span>{addon.nameAr}</span>
                          </div>
                          <span className="text-[10px] text-rose-600 dark:text-pink-400 font-black">
                            +{addon.price.toFixed(2)} ج.م
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer Custom Note */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                  ملاحظة خاصة للشيف أو التحضير (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: كتابة اسم 'سارة' على التورتة أو تقليل السكر..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-slate-800">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">الكمية المطلوبة:</span>
                <div className="flex items-center gap-3 bg-rose-50/60 dark:bg-slate-800 p-1.5 rounded-2xl border border-rose-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-rose-100 dark:hover:bg-slate-600 transition shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-sm text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-rose-100 dark:hover:bg-slate-600 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer with Live Server-authoritative Subtotal */}
            <div className="p-4 sm:p-6 bg-rose-50/50 dark:bg-slate-900/90 border-t border-rose-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-bold">المجموع المقدر</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-rose-600 dark:text-pink-400">
                      {calculateModalTotal().toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ج.م</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCartFromModal(false)}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-slate-700 text-rose-700 dark:text-pink-300 font-bold text-xs hover:bg-rose-50 dark:hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة للسلة</span>
                </button>
                {calculateModalTotal() >= minOrderAmount ? (
                  <button
                    type="button"
                    onClick={() => handleAddToCartFromModal(true)}
                    className="px-4 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white font-black text-xs shadow-rose-glow hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>شراء فوري ⚡</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold p-1 text-center leading-tight flex items-center justify-center">
                    الحد الأدنى {minOrderAmount} ج.م
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-bold">
        جاري تحميل تشكيلة الحلويات...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
