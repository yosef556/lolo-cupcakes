"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductDetail, getProducts, getProductReviews, createProductReview, ProductDto, ProductReviewDto } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { playJoyfulChime } from "@/lib/soundFx";
import confetti from "canvas-confetti";
import { 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Heart, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  MessageCircle, 
  Truck, 
  Award,
  Plus,
  Minus,
  Zap,
  Star,
  Send,
  Flame,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToCart, closeDrawer } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { minOrderAmount, inactiveProductBadgeText } = useStoreSettings();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<ProductReviewDto[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Quantity & Selection State
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Interactive Zoom State
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomMousePos, setZoomMousePos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("lolo_auth_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.fullName) setNewReviewerName(u.fullName);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    getProductDetail(productId)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
        // Load related products from the same category or overall catalog
        getProducts({ size: 4 })
          .then((res) => {
            setRelatedProducts(res.content.filter((p) => p.id !== data.id).slice(0, 4));
          })
          .catch(() => {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product", err);
        setError("تعذر العثور على المنتج المطلوب أو قد يكون غير متاح حالياً.");
        setLoading(false);
      });

    // Load customer reviews
    getProductReviews(productId)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [productId]);

  // Handle Hover Pan Zoom calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomMousePos({ x, y });
  };

  const getProductImage = (prod: ProductDto) => {
    if (prod.primaryImageUrl) return prod.primaryImageUrl;
    if (prod.slug?.includes("vanilla")) return "/placeholders/cupcake-1.jpg";
    if (prod.slug?.includes("chocolate")) return "/placeholders/cake-1.jpg";
    if (prod.slug?.includes("caramel")) return "/placeholders/cupcake-2.jpg";
    if (prod.slug?.includes("strawberry")) return "/placeholders/cake-2.jpg";
    if (prod.slug?.includes("box")) return "/placeholders/box-1.jpg";
    if (prod.slug?.includes("gateau") || prod.slug?.includes("pistachio")) return "/placeholders/gateau-1.jpg";
    return "/placeholders/cupcake-1.jpg";
  };

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const currentUnitPrice = selectedVariant?.priceOverride !== undefined && selectedVariant?.priceOverride !== null
    ? Number(selectedVariant.priceOverride)
    : (product?.basePrice || 0);
  const currentTotalPrice = currentUnitPrice * quantity;
  const canDirectBuyNow = currentTotalPrice >= minOrderAmount;

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    playJoyfulChime();

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FF5E8E", "#38BDF8", "#F472B6", "#7DD3FC"],
      });
    } catch {
      // Ignore
    }

    const selectedOptionValueIds = Object.values(selectedOptions).filter(Boolean);

    await addToCart({
      productId: product.id,
      variantId: selectedVariantId || null,
      quantity,
      selectedOptionValueIds,
      selectedAddonIds: [],
    });

    setAddingToCart(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleBuyNow = async () => {
    if (!product || !canDirectBuyNow) return;
    setAddingToCart(true);
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FF5E8E", "#38BDF8", "#F472B6", "#7DD3FC"],
      });
    } catch {
      // Ignore
    }

    const selectedOptionValueIds = Object.values(selectedOptions).filter(Boolean);

    // Single item direct checkout: save in sessionStorage so customer only buys this product without forcing existing cart items
    sessionStorage.setItem("direct_checkout_item", JSON.stringify({
      productId: product.id,
      productName: product.nameAr,
      quantity,
      unitPrice: currentUnitPrice,
      totalAmount: currentTotalPrice,
      variantId: selectedVariantId || null,
      variantName: selectedVariant?.nameAr || null,
      imageUrl: product.primaryImageUrl || getProductImage(product),
      selectedOptionValueIds,
    }));

    closeDrawer();
    setAddingToCart(false);
    router.push("/checkout?direct=1");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim()) return;
    setSubmittingReview(true);
    try {
      const created = await createProductReview(productId, {
        customerName: newReviewerName.trim(),
        rating: newRating,
        comment: newComment.trim() || undefined,
      });
      setReviews((prev) => [created, ...prev]);
      setNewComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to post review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">جاري تحضير تفاصيل المنتج الشهي...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-pink-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900">عذراً، المنتج غير متوفر</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-pink-500 text-white font-bold text-xs shadow-md hover:bg-pink-600 transition"
          >
            <span>العودة لقائمة الحلويات</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const leadTimeHours = product.prepLeadHours || product.leadTimeHours || 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-pink-600 transition">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <Link href="/shop" className="hover:text-pink-600 transition">قائمة الحلويات</Link>
        {product.categoryNameAr && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{product.categoryNameAr}</span>
          </>
        )}
        <span className="text-slate-300">/</span>
        <span className="text-pink-600 font-black">{product.nameAr}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Interactive Image Gallery with Hover Zoom & Fullscreen Lightbox (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-white rounded-[36px] border-2 border-pink-100 shadow-xl overflow-hidden p-4 group">
            
            {/* Badges Over Image */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 pointer-events-none">
              {product.isPreOrder ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/95 text-white font-black text-[11px] shadow-md backdrop-blur-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>يُخبز طازجاً بالحجز المسبق 🧁</span>
                </span>
              ) : product.stockQuantity !== undefined && product.stockQuantity === 0 ? (
                <span className="px-3 py-1 rounded-full bg-slate-900/95 text-rose-300 font-black text-[11px] shadow-md backdrop-blur-sm border border-rose-500/50 flex items-center gap-1">
                  <span>❌ نفدت الكمية مؤقتاً</span>
                </span>
              ) : product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 ? (
                <span className="px-3 py-1 rounded-full bg-rose-600/95 text-white font-black text-[11px] shadow-md backdrop-blur-sm animate-pulse flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>🔥 متبقي {product.stockQuantity} قطع فقط!</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/95 text-white font-black text-[11px] shadow-md backdrop-blur-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>متاح للتسليم الفوري ({product.stockQuantity || 15} قطعة) ⚡</span>
                </span>
              )}

              {product.isFeatured && (
                <span className="px-3 py-1 rounded-full bg-pink-500/95 text-white font-black text-[10px] shadow-sm backdrop-blur-sm flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-white" />
                  <span>الأكثر طلباً ومحبة</span>
                </span>
              )}
            </div>

            {/* Click to Expand Button & Wishlist Toggle */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 rounded-2xl shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                  isInWishlist(product.id)
                    ? "bg-rose-500 text-white shadow-rose-200"
                    : "bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600"
                }`}
                title={isInWishlist(product.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-white" : ""}`} />
              </button>

              <button
                onClick={() => {
                  setLightboxScale(1);
                  setLightboxOpen(true);
                }}
                className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-pink-600 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                title="تكبير الصورة ملء الشاشة (Fullscreen Zoom)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Main Image Container with Pan Zoom on Hover */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHoverZooming(true)}
              onMouseLeave={() => setIsHoverZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => {
                setLightboxScale(1);
                setLightboxOpen(true);
              }}
              className="relative w-full h-[360px] sm:h-[440px] rounded-[28px] overflow-hidden bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-sky-50/50 cursor-zoom-in"
            >
              <Image
                src={imageUrl}
                alt={product.nameAr}
                fill
                priority
                className={`object-contain p-4 transition-transform duration-200 ease-out select-none ${
                  isHoverZooming ? "scale-175" : "scale-100"
                }`}
                style={{
                  transformOrigin: `${zoomMousePos.x}% ${zoomMousePos.y}%`,
                }}
              />

              {/* Hover Zoom Hint */}
              {!isHoverZooming && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
                  <ZoomIn className="w-3.5 h-3.5 text-pink-300" />
                  <span>مرر الفأرة للتكبير الدقيق أو انقر للشاشة الكاملة</span>
                </div>
              )}
            </div>

            {/* Micro Thumbnail / Gallery Indicator */}
            <div className="flex items-center justify-center gap-2 pt-3">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-xs" />
              <span className="w-2 h-2 rounded-full bg-pink-200" />
              <span className="w-2 h-2 rounded-full bg-pink-200" />
            </div>
          </div>

          {/* Quality Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-xs space-y-1">
              <Award className="w-4 h-4 text-pink-500 mx-auto" />
              <span className="text-[10px] font-bold text-slate-800 block">زبدة طبيعية 100%</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-xs space-y-1">
              <Clock className="w-4 h-4 text-sky-500 mx-auto" />
              <span className="text-[10px] font-bold text-slate-800 block">طازج ومخبوز اليوم</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-xs space-y-1">
              <Truck className="w-4 h-4 text-emerald-500 mx-auto" />
              <span className="text-[10px] font-bold text-slate-800 block">شحن مبرد آمن</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Customization, Pricing & Order CTA (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-pink-100 shadow-lg shadow-pink-100/30 space-y-6">
            
            {/* Header Titles */}
            <div className="space-y-2 border-b border-pink-100 pb-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  {product.categoryNameAr || "حلويات فاخرة"}
                </span>

                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>تجهيز: {leadTimeHours} ساعات</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {product.nameAr}
              </h1>

              {product.nameEn && (
                <p className="text-sm font-serif text-slate-400 tracking-wider">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50/50 to-sky-50 border border-pink-100">
              <span className="text-3xl font-black text-pink-600">
                {currentUnitPrice.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-700">جنية مصري (EGP)</span>
              {selectedVariant && (
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-black">
                  {selectedVariant.nameAr}
                </span>
              )}
              <span className="text-xs text-slate-500 mr-auto font-medium">شامل الضريبة</span>
            </div>

            {/* Variants / Sizes Selector (USER REQUEST: تدرج هرمي للأحجام والخيارات) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <span>اختر الحجم أو العبوة 📏:</span>
                  </label>
                  <span className="text-[10px] text-rose-600 font-bold">أحجام وخيارات متعددة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isChosen = selectedVariantId === v.id;
                    const vPrice = v.priceOverride !== undefined && v.priceOverride !== null ? Number(v.priceOverride) : product.basePrice;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                          isChosen
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md font-black scale-[1.02]"
                            : "bg-white border-rose-100 text-slate-700 hover:bg-rose-50/60"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{v.nameAr}</span>
                          {v.nameEn && <span className={`text-[10px] block opacity-75`}>{v.nameEn}</span>}
                        </div>
                        <span className={`text-xs font-black ${isChosen ? "text-white" : "text-rose-600"}`}>
                          {vPrice.toFixed(2)} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h4 className="font-black text-slate-800 text-xs">وصف ومكونات الصنف:</h4>
              <p>
                {product.descriptionAr || "كب كيك فاخر ومميز مصنوع بأجود المكونات الطبيعية والزبدة النيوزيلندية الفاخرة، ومزين بعناية ودقة تليق بأجمل مناسباتكم واحتفالاتكم السعيدة."}
              </p>
            </div>

            {/* Option Groups (if product has customization options) */}
            {product.optionGroups && product.optionGroups.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-pink-100">
                {product.optionGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <label className="font-black text-xs text-slate-800 block">
                      {group.nameAr} {group.isRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.values.map((val) => {
                        const isChosen = selectedOptions[group.id] === val.id;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => setSelectedOptions({ ...selectedOptions, [group.id]: val.id })}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition flex items-center justify-between ${
                              isChosen
                                ? "bg-pink-500 text-white border-pink-600 shadow-xs"
                                : "bg-white border-pink-200 text-slate-700 hover:bg-pink-50/50"
                            }`}
                          >
                            <span>{val.nameAr}</span>
                            {val.priceDelta > 0 && (
                              <span className={`text-[10px] ${isChosen ? "text-pink-100" : "text-pink-600 font-black"}`}>
                                +{val.priceDelta} ج.م
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector & Action Controls */}
            <div className="space-y-4 pt-4 border-t border-pink-100">
              <div className="flex items-center justify-between gap-4">
                <span className="font-black text-xs text-slate-800">الكمية المطلوبة:</span>
                
                <div className="flex items-center gap-3 bg-pink-50/70 p-1 rounded-2xl border border-pink-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-pink-100 text-slate-700 flex items-center justify-center transition disabled:opacity-40 shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-black text-sm text-slate-900 w-8 text-center">{quantity}</span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-pink-100 text-slate-700 flex items-center justify-center transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTAs: Add to Bag and Buy Now */}
              <div className="space-y-3">
                {product.isActive === false ? (
                  <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 font-black text-sm">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{inactiveProductBadgeText || "سيتوفر قريباً ✨"}</span>
                    </div>
                    <p className="text-xs text-amber-700">هذا الصنف غير متاح للطلب حالياً وسيتم توفيره مجدداً في أقرب وقت.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addingToCart || (!product.isPreOrder && product.stockQuantity !== undefined && product.stockQuantity === 0)}
                      className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-pink-50 border-2 border-pink-400 text-pink-700 font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                      <ShoppingBag className="w-5 h-5 text-pink-500" />
                      <span>
                        {!product.isPreOrder && product.stockQuantity !== undefined && product.stockQuantity === 0
                          ? "نفدت الكمية مؤقتاً"
                          : addingToCart
                          ? "جاري الإضافة..."
                          : `إضافة إلى الحقيبة (${currentTotalPrice.toFixed(2)} ج.م)`}
                      </span>
                    </button>

                    {canDirectBuyNow ? (
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={addingToCart || (!product.isPreOrder && product.stockQuantity !== undefined && product.stockQuantity === 0)}
                        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white font-black text-sm shadow-xl shadow-pink-200/60 hover:shadow-sky-200/60 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        <Zap className="w-5 h-5 text-amber-300" />
                        <span>
                          {!product.isPreOrder && product.stockQuantity !== undefined && product.stockQuantity === 0
                            ? "غير متاح للشراء"
                            : `شراء فوري لهذا الصنف (${currentTotalPrice.toFixed(2)} ج.م) ⚡`}
                        </span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center flex flex-col justify-center">
                        <div className="flex items-center justify-center gap-1.5 font-black text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>الحد الأدنى للشراء الفوري {minOrderAmount} ج.م</span>
                        </div>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          أضف للسلة وأكمل طلبك لتصل للحد الأدنى ({currentTotalPrice.toFixed(2)}/{minOrderAmount} ج.م)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Direct WhatsApp Order Button */}
              <a
                href={`https://wa.me/201069915609?text=${encodeURIComponent(
                  `مرحباً لولو كب كيك 🧁 أود الاستفسار والطلب المباشر لـ: ${product.nameAr}\nالسعر: ${product.basePrice} ج.م\nالرابط: ${typeof window !== "undefined" ? window.location.href : ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>طلب فوري مباشر عبر واتساب 💬</span>
              </a>

              {/* Added to Bag Toast Feedback */}
              {addedToast && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>تمت إضافة &quot;{product.nameAr}&quot; إلى حقيبتك بنجاح! 🌸</span>
                  </div>
                  <Link href="/checkout" className="text-pink-300 hover:underline font-black mr-2">
                    إتمام الطلب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Controls Bar */}
          <div 
            className="absolute top-6 inset-x-6 flex items-center justify-between text-white z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{product.nameAr}</span>
              <span className="text-xs text-white/60">({Math.round(lightboxScale * 100)}%)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxScale((s) => Math.max(1, s - 0.4))}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLightboxScale((s) => Math.min(3, s + 0.4))}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-rose-600 flex items-center justify-center transition"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scalable Image */}
          <div 
            className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxScale((s) => (s > 1 ? 1 : 2));
            }}
          >
            <Image
              src={imageUrl}
              alt={product.nameAr}
              fill
              className="object-contain transition-transform duration-300 select-none cursor-pointer"
              style={{
                transform: `scale(${lightboxScale})`,
              }}
            />
          </div>

          <div className="absolute bottom-6 text-center text-xs text-white/60 pointer-events-none">
            انقر مرتين على الصورة للتبديل بين التكبير بالحجم الأصلي وإعادته
          </div>
        </div>
      )}

      {/* Customer Reviews & Ratings Section */}
      <section className="bg-white rounded-[36px] border border-pink-100 p-6 sm:p-10 shadow-lg shadow-pink-100/20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                تقييمات وآراء العملاء
              </h3>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : "5.0"}
                </span>
                <span className="text-slate-400 text-[10px]">({reviews.length} تقييم)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              شارك تجربتك مع زوار لولو كب كيك وساعدهم في اختيار الصنف الأمثل
            </p>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-5 h-5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 space-y-4">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>أضف تقييمك ورأيك في الصنف:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                الاسم الكريم: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newReviewerName}
                onChange={(e) => setNewReviewerName(e.target.value)}
                placeholder="مثال: سارة أحمد"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                تقييمك بالنجوم:
              </label>
              <div className="flex items-center gap-2 h-[42px] px-3 bg-white rounded-xl border border-rose-200">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className="p-1 hover:scale-125 transition"
                    title={`${s} نجوم`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= newRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-rose-600 mr-auto">
                  {newRating} من 5 نجوم
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              رأيك أو تعليقك (اختياري):
            </label>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك عن طزاجة المكونات، الطعم، والشكل المميز..."
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {reviewSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                <UserCheck className="w-4 h-4" />
                <span>شكراً لمشاركتك! تم إضافة تقييمك بنجاح 💖</span>
              </span>
            )}
            <button
              type="submit"
              disabled={submittingReview || !newReviewerName.trim()}
              className="mr-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}</span>
            </button>
          </div>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-rose-200 text-rose-500" />
              </div>
              <p className="text-xs font-bold text-slate-700">لا توجد تقييمات مسجلة بعد لهذا الصنف</p>
              <p className="text-[11px] text-slate-400">كن أول عميل يشاركنا رأيه في هذا الإبداع اللذيذ! 🧁</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {rev.customerName ? rev.customerName.charAt(0) : "ع"}
                      </div>
                      <div>
                        <h5 className="font-black text-xs text-slate-900">{rev.customerName}</h5>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      &quot;{rev.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">حلويات أخرى قد تنال إعجابك 🍰</h3>
              <p className="text-xs text-slate-500">مختارة بعناية لتكمل تجربتكم الشهية</p>
            </div>

            <Link href="/shop" className="text-xs font-black text-pink-600 hover:text-pink-700 transition flex items-center gap-1">
              <span>عرض القائمة بالكامل</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.id}`}
                className="group bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-pink-300 transition-all p-3 flex flex-col justify-between"
              >
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-pink-50/50 mb-2.5">
                  <Image
                    src={getProductImage(rel)}
                    alt={rel.nameAr}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-xs text-slate-900 line-clamp-1 group-hover:text-pink-600 transition">
                    {rel.nameAr}
                  </h4>
                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <span className="font-black text-pink-600">{rel.basePrice.toFixed(0)} ج.م</span>
                    <span className="text-[10px] text-slate-400 font-bold">عرض التفاصيل</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
