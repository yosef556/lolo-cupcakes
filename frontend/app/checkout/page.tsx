"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { 
  getDeliveryZones, 
  getAvailableSlots, 
  getCurrentBranch, 
  getCheckoutQuote, 
  createOrder,
  getOrCreateCart,
  addItemToCart,
  CartDto,
  DeliveryZoneDto, 
  TimeSlotDto, 
  BranchDto, 
  CheckoutQuoteResponse,
  CreateOrderRequest,
  OrderResponseDto
} from "@/lib/api";
import DeliveryLocationPicker, { isLocationInZayedOctober } from "@/components/DeliveryLocationPicker";
import PartyUpsellAddons, { UpsellItem, PARTY_ADDONS } from "@/components/PartyUpsellAddons";
import LoyaltyPointsWidget from "@/components/LoyaltyPointsWidget";
import { useStoreSettings } from "@/components/StoreSettingsContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Truck, 
  Store, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Smartphone,
  Share2,
  ExternalLink,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  MapPin,
  Navigation
} from "lucide-react";

interface DirectItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantId?: string;
  selectedOptionValueIds?: string[];
  selectedAddonIds?: string[];
  customerNote?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirect = searchParams.get("direct") === "1";

  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { cleanWhatsAppNumber, storePhone, storeAddress, vodafoneCashNumber, instapayAddress } = useStoreSettings();
  const { user, profile } = useAuth();

  // Direct Single-Item Checkout State (USER REQUEST: Buy Now only buys that single item)
  const [directCart, setDirectCart] = useState<CartDto | null>(null);
  const [directItem, setDirectItem] = useState<DirectItem | null>(null);
  const [directLoading, setDirectLoading] = useState(false);

  // Fulfillment form
  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [zones, setZones] = useState<DeliveryZoneDto[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floorDoor, setFloorDoor] = useState("");
  const [landmark, setLandmark] = useState("");

  // Customer Contact
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // GPS Location State (USER REQUEST: تحديد موقع GPS والتحقق من نطاق زايد وأكتوبر حصرياً)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; mapsUrl: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isOutOfZone, setIsOutOfZone] = useState<boolean>(false);

  // Auto-load previously saved GPS location (e.g. from registration or prior order)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_gps_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lng) {
          const coords = {
            lat: parsed.lat,
            lng: parsed.lng,
            mapsUrl: parsed.mapsUrl || `https://maps.google.com/?q=${parsed.lat},${parsed.lng}`
          };
          setGpsCoords(coords);
          const inside = isLocationInZayedOctober(coords.lat, coords.lng);
          setIsOutOfZone(!inside);
        }
      }
    } catch {}
  }, []);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError("متصفحك لا يدعم تحديد الموقع الجغرافي");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        const coordsObj = { lat, lng, mapsUrl };
        setGpsCoords(coordsObj);
        localStorage.setItem("user_gps_location", JSON.stringify(coordsObj));
        setGpsLoading(false);

        // Reverse geocoding to auto-fill street address if empty
        let detected = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`,
            { headers: { "Accept-Language": "ar" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.pedestrian || addr.street || "";
              const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "";
              const city = addr.city || addr.town || "";
              detected = [road, suburb, city].filter(Boolean).join("، ");
              if (detected) {
                setStreetAddress((prev) => prev ? prev : detected);
              }
            }
          }
        } catch {}

        // Strict Geofencing Check: Sheikh Zayed & 6th of October ONLY
        const inside = isLocationInZayedOctober(lat, lng, detected);
        setIsOutOfZone(!inside);

        if (!inside) {
          setSelectedZoneId("");
          setGpsError("⚠️ عذراً، موقعك الحالي يقع خارج نطاق التوصيل المتاح لدينا. التوصيل متوفر حصرياً لسكان (الشيخ زايد و 6 أكتوبر) فقط.");
        } else {
          setGpsError(null);
          // Match Zayed/October delivery zone
          const matchedZone = zones.find((z) => z.nameAr.includes("زايد") || z.nameAr.includes("اكتوبر")) || zones[0];
          if (matchedZone) {
            setSelectedZoneId(matchedZone.id);
          }
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("تم رفض إذن الوصول للموقع. يُرجى تفعيل إذن الموقع الجغرافي (Location Permission) في متصفحك أو إعدادات هاتفك لتأكيد الطلب.");
        } else {
          setGpsError("تعذر الاتصال بالأقمار الصناعية لتحديد الموقع بدقة، يرجى المحاولة مجدداً والتأكد من تشغيل الـ GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Specific custom delivery time (USER REQUEST: flexible specific time e.g. 8:00 مساءً)
  const [specificDeliveryTime, setSpecificDeliveryTime] = useState("");

  // Auto-fill from User Profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName((prev) => prev || user.fullName);
      if (user.phone) setCustomerPhone((prev) => prev || user.phone);
    }
    if (profile?.address) {
      setStreetAddress((prev) => prev || profile.address || "");
    }
  }, [user, profile]);

  // Load Direct Item if ?direct=1
  useEffect(() => {
    if (!isDirect) return;
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("direct_checkout_item") : null;
    if (!raw) return;
    try {
      const parsed: DirectItem = JSON.parse(raw);
      setDirectItem(parsed);
      setDirectLoading(true);
      getOrCreateCart()
        .then(async (newCart) => {
          const updated = await addItemToCart(newCart.cartToken, {
            productId: parsed.productId,
            variantId: parsed.variantId || null,
            quantity: parsed.quantity || 1,
            selectedOptionValueIds: parsed.selectedOptionValueIds || [],
            selectedAddonIds: parsed.selectedAddonIds || [],
            customerNote: parsed.customerNote || undefined,
          });
          setDirectCart(updated);
          setDirectLoading(false);
        })
        .catch((err) => {
          setQuoteError("تعذر تحضير الشراء الفوري للصنف: " + err.message);
          setDirectLoading(false);
        });
    } catch (e) {
      console.error(e);
      setDirectLoading(false);
    }
  }, [isDirect]);

  // Scheduling
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split("T")[0];
  });
  const [slots, setSlots] = useState<TimeSlotDto[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [currentBranch, setCurrentBranch] = useState<BranchDto | null>(null);

  // Payment & Promotions (USER REQUEST: CASH & MANUAL_TRANSFER ONLY)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MANUAL_TRANSFER">("CASH");
  const [senderPhoneOrWallet, setSenderPhoneOrWallet] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");

  // Upsells & Loyalty
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<number>(0);

  // Success Confirmation Modal
  const [completedOrder, setCompletedOrder] = useState<OrderResponseDto | null>(null);

  // Quote State
  const [quote, setQuote] = useState<CheckoutQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load Zones & Branch
  useEffect(() => {
    getDeliveryZones()
      .then((data) => {
        setZones(data);
        if (data.length > 0) setSelectedZoneId(data[0].id);
      })
      .catch(() => []);

    getCurrentBranch().then(setCurrentBranch).catch(() => null);
  }, []);

  // Load Slots whenever date or fulfillmentType changes
  useEffect(() => {
    getAvailableSlots(selectedDate, fulfillmentType)
      .then((data) => {
        setSlots(data);
        const available = data.find((s) => s.available);
        if (available) {
          setSelectedSlotId(available.id);
        } else if (data.length > 0) {
          setSelectedSlotId(data[0].id);
        } else {
          setSelectedSlotId("");
        }
      })
      .catch(() => setSlots([]));
  }, [selectedDate, fulfillmentType]);

  const effectiveCart = isDirect ? directCart : cart;

  // Recalculate Authoritative Server Quote
  useEffect(() => {
    if (!effectiveCart?.cartToken || effectiveCart.items.length === 0) return;

    setQuoteLoading(true);
    setQuoteError(null);

    getCheckoutQuote({
      cartToken: effectiveCart.cartToken,
      fulfillmentType,
      deliveryZoneId: fulfillmentType === "DELIVERY" ? selectedZoneId || null : null,
      couponCode: appliedCoupon || null,
    })
      .then((res) => {
        setQuote(res);
        setQuoteLoading(false);
      })
      .catch((err: Error) => {
        setQuoteError(err.message);
        setQuoteLoading(false);
      });
  }, [effectiveCart?.cartToken, effectiveCart?.items, fulfillmentType, selectedZoneId, appliedCoupon]);

  const handleApplyCoupon = () => {
    setAppliedCoupon(couponCode.trim());
  };

  const handleToggleAddon = (addon: UpsellItem) => {
    setSelectedAddons((prev) => 
      prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
    );
  };

  const handleLocationPicked = (loc: { neighborhood: string; formattedAddress: string; lat?: number; lng?: number; isOutOfZone?: boolean }) => {
    let outOfZone = loc.isOutOfZone ?? false;
    if (loc.lat && loc.lng) {
      outOfZone = !isLocationInZayedOctober(loc.lat, loc.lng, loc.formattedAddress);
    }
    setIsOutOfZone(outOfZone);

    if (outOfZone) {
      setSelectedZoneId("");
      setGpsError("⚠️ عذراً، موقعك الحالي يقع خارج نطاق التوصيل المتاح لدينا. التوصيل متوفر حصرياً لسكان (الشيخ زايد و 6 أكتوبر) فقط.");
    } else {
      setGpsError(null);
      // Auto-match delivery zone from zones list
      const zayedZone = zones.find((z) => z.nameAr.includes("زايد") || z.nameAr.includes("اكتوبر")) || zones[0];
      if (zayedZone) {
        setSelectedZoneId(zayedZone.id);
      }
    }

    if (loc.formattedAddress) {
      setStreetAddress(loc.formattedAddress);
    }

    if (loc.lat && loc.lng) {
      const coordsObj = {
        lat: loc.lat,
        lng: loc.lng,
        mapsUrl: `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
      };
      setGpsCoords(coordsObj);
      localStorage.setItem("user_gps_location", JSON.stringify(coordsObj));
    }
  };

  // Calculations for Upsells and Discounts
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = PARTY_ADDONS.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const rawSubtotal = quote ? quote.subtotal : (effectiveCart?.subtotal || (isDirect && directItem ? directItem.totalPrice : 0));
  const deliveryFee = fulfillmentType === "PICKUP" ? 0 : (quote ? quote.deliveryFee : 0);
  const couponDiscount = quote ? quote.discountAmount : 0;
  const estimatedTotal = Math.max(0, rawSubtotal + deliveryFee - couponDiscount + addonsTotal - loyaltyDiscount);

  // Validate Common Form Inputs
  const validateForm = () => {
    if (!customerName.trim()) {
      setSubmitError("يرجى إدخال اسم العميل");
      return false;
    }

    const phoneRegex = /^(01[0125][0-9]{8}|\+201[0125][0-9]{8})$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setSubmitError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)");
      return false;
    }

    // Auto-fallback to first available slot if user hasn't explicitly clicked one
    let effectiveSlotId = selectedSlotId;
    if (!effectiveSlotId && slots.length > 0) {
      const avail = slots.find((s) => s.available) || slots[0];
      if (avail) {
        effectiveSlotId = avail.id;
        setSelectedSlotId(avail.id);
      }
    }

    if (!effectiveSlotId) {
      setSubmitError("يرجى اختيار فترة زمنية متاحة للاستلام أو التوصيل");
      return false;
    }

    if (paymentMethod === "MANUAL_TRANSFER") {
      if (!senderPhoneOrWallet.trim()) {
        setSubmitError("يرجى كتابة رقم المحفظة أو الحساب الذي قمت بالتحويل منه لربط الحوالة بطلبك");
        return false;
      }
    }

    if (fulfillmentType === "DELIVERY") {
      if (!gpsCoords) {
        setSubmitError("⚠️ إجباري: يرجى تحديد موقعك عبر الـ GPS لتأكيد عنوان التوصيل بدقة.");
        const el = document.getElementById("gps-delivery-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }

      // Strict Geofence verification for Sheikh Zayed & 6th of October ONLY
      const inside = isLocationInZayedOctober(gpsCoords.lat, gpsCoords.lng, streetAddress);
      if (isOutOfZone || !inside) {
        setSubmitError("⚠️ عذراً، خدمة التوصيل متوفرة حصرياً لسكان (الشيخ زايد و 6 أكتوبر) فقط. موقعك المكتشف خارج هذا النطاق، يمكنك اختيار 'استلام من الفرع' (بدون رسوم توصيل) للمتابعة.");
        const el = document.getElementById("gps-delivery-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }

      if (!selectedZoneId) {
        setSubmitError("يرجى اختيار منطقة التوصيل المعتمدة");
        return false;
      }

      if (!streetAddress.trim()) {
        setSubmitError("يرجى إدخال اسم الشارع والعنوان بالتفصيل");
        return false;
      }
      if (!buildingNumber.trim()) {
        setSubmitError("يرجى إدخال رقم العقار / العمارة");
        return false;
      }
      if (!floorDoor.trim()) {
        setSubmitError("يرجى إدخال الدور ورقم الشقة");
        return false;
      }
    }
    return true;
  };

  // Trigger Order Creation
  const executeOrderCreation = async (chosenPaymentMethod: "CASH" | "MANUAL_TRANSFER") => {
    const cartToUse = isDirect ? directCart : cart;
    if (!cartToUse?.cartToken || cartToUse.items.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    // Build notes string including chosen upsell addons, loyalty redemption, GPS location, and manual transfer details
    let finalNotes = customerNotes.trim();
    if (fulfillmentType === "DELIVERY" && gpsCoords) {
      finalNotes = (finalNotes ? finalNotes + " | " : "") + `[📍 موقع الـ GPS المعتمد: ${gpsCoords.mapsUrl}]`;
    }
    if (specificDeliveryTime.trim()) {
      finalNotes = (finalNotes ? finalNotes + " | " : "") + `[الموعد المحدد المطلوب: ${specificDeliveryTime.trim()}]`;
    }
    if (selectedAddons.length > 0) {
      const addonNames = selectedAddons
        .map((id) => PARTY_ADDONS.find((a) => a.id === id)?.nameAr)
        .filter(Boolean);
      finalNotes = (finalNotes ? finalNotes + " | " : "") + `[إضافات الحفلة: ${addonNames.join("، ")}]`;
    }
    if (loyaltyDiscount > 0) {
      finalNotes = (finalNotes ? finalNotes + " | " : "") + `[خصم نادي لولو VIP: 50 ج.م مقابل 100 نقطة]`;
    }
    if (chosenPaymentMethod === "MANUAL_TRANSFER" && senderPhoneOrWallet.trim()) {
      finalNotes = (finalNotes ? finalNotes + " | " : "") + `[رقم تحويل فودافون كاش/إنستاباي المُرسِل: ${senderPhoneOrWallet.trim()}]`;
      if (receiptPreview) {
        finalNotes += " | [تم إرفاق إيصال الدفع بنجاح]";
      }
    }

    const idempotencyKey = "IDEM-" + crypto.randomUUID();

    const requestPayload: CreateOrderRequest = {
      idempotencyKey,
      cartToken: cartToUse.cartToken,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fulfillmentType,
      deliveryZoneId: fulfillmentType === "DELIVERY" ? selectedZoneId : null,
      streetAddress: fulfillmentType === "DELIVERY" ? streetAddress.trim() : null,
      buildingNumber: fulfillmentType === "DELIVERY" ? buildingNumber.trim() : null,
      floorDoor: fulfillmentType === "DELIVERY" ? floorDoor.trim() : null,
      landmark: fulfillmentType === "DELIVERY" ? landmark.trim() : null,
      timeSlotId: selectedSlotId,
      paymentMethod: chosenPaymentMethod,
      customerNotes: finalNotes || null,
      couponCode: appliedCoupon || null,
      latitude: gpsCoords?.lat || null,
      longitude: gpsCoords?.lng || null,
      mapsUrl: gpsCoords?.mapsUrl || null,
    };

    try {
      const order = await createOrder(requestPayload);
      if (isDirect) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("direct_checkout_item");
        }
      } else {
        await refreshCart();
      }

      // Deduct loyalty points if used, and add new points (1 point per 10 EGP)
      const currentPts = parseInt(localStorage.getItem("lolo_loyalty_points") || "140");
      const earnedPts = Math.floor(order.totalAmount / 10);
      const updatedPts = Math.max(0, currentPts - (loyaltyDiscount > 0 ? 100 : 0)) + earnedPts;
      localStorage.setItem("lolo_loyalty_points", updatedPts.toString());

      setCompletedOrder(order);
      setSubmitting(false);
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || "حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى");
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await executeOrderCreation(paymentMethod);
  };

  if (cartLoading && !isDirect) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-3">🧁</div>
        <p className="text-sm font-bold text-slate-800">جاري تحميل بيانات السلة...</p>
      </div>
    );
  }

  if (isDirect && (directLoading || !directCart)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="animate-spin text-4xl mb-3">⚡</div>
        <p className="text-sm font-bold text-slate-800">جاري تجهيز الشراء الفوري للصنف الملكي...</p>
      </div>
    );
  }

  if (!effectiveCart || effectiveCart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl mx-auto border border-rose-100">
          🧁
        </div>
        <h2 className="text-2xl font-black text-slate-900">سلة التسوق فارغة</h2>
        <p className="text-xs text-slate-500">
          لا يمكن المتابعة إلى الدفع بدون إضافة حلويات فاخرة إلى سلتك أولاً.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs hover:brightness-105 transition shadow-sm"
        >
          تصفح قائمة الحلويات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Checkout Title */}
      <div className="mb-6 text-right">
        <span className="text-xs font-black text-rose-500 uppercase tracking-wider block mb-1">
          بوابة الحجز والدفع الآمن ⚡
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">إتمام طلبك الملكي</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          خدمة حجز فورية ومضمونة كزائر دون الحاجة لتسجيل حساب مسبق
        </p>
      </div>

      {/* Direct Buy Now Item Alert Banner (USER REQUEST: single item checkout) */}
      {isDirect && directItem && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 text-white shadow-rose-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-xs font-black text-rose-100 block">طلب شراء فوري مباشر (صنف فردي)</span>
              <h4 className="text-base font-black text-white">
                {directItem.productName} — الكمية: {directItem.quantity || 1}
              </h4>
            </div>
          </div>
          <div className="text-right sm:text-left self-end sm:self-auto">
            <span className="text-lg font-black text-white block">
              {(directItem.totalPrice || directItem.unitPrice).toFixed(2)} ج.م
            </span>
            <span className="text-[10px] text-rose-100 bg-white/10 px-2 py-0.5 rounded-full inline-block">
              سلتك العادية محفوظة دون مساس
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Fulfillment Type Selection */}
          <div className="bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-[32px] border border-rose-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <div className="flex items-center gap-2.5 border-b border-rose-100 dark:border-slate-800 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-sm">1</span>
              <h3 className="font-black text-base text-slate-900 dark:text-white">طريقة الاستلام والتوصيل</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 rounded-2xl border text-right transition flex items-center gap-3 ${
                  fulfillmentType === "DELIVERY"
                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 text-slate-900 dark:text-white shadow-sm ring-2 ring-rose-400/50"
                    : "bg-white dark:bg-slate-800/80 border-rose-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50/30 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-rose-500 dark:text-pink-400 flex-shrink-0 shadow-sm border border-rose-100 dark:border-slate-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">توصيل مبرد للمنزل</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">سيارات مبردة لضمان وصول الحلويات طازجة</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType("PICKUP")}
                className={`p-4 rounded-2xl border text-right transition flex items-center gap-3 ${
                  fulfillmentType === "PICKUP"
                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 text-slate-900 dark:text-white shadow-sm ring-2 ring-rose-400/50"
                    : "bg-white dark:bg-slate-800/80 border-rose-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50/30 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-rose-500 dark:text-pink-400 flex-shrink-0 shadow-sm border border-rose-100 dark:border-slate-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">استلام من الفرع</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentBranch?.nameAr || storeAddress || "الفرع الرئيسي"} - بدون رسوم توصيل
                  </p>
                </div>
              </button>
            </div>

            {/* Delivery Details */}
            {fulfillmentType === "DELIVERY" ? (
              <div className="space-y-5 pt-2">
                {/* Unified Interactive GPS & Geofenced Map Picker */}
                <div id="gps-delivery-section" className="space-y-4">
                  <DeliveryLocationPicker 
                    onLocationSelect={handleLocationPicked} 
                    selectedZoneName={zones.find((z) => z.id === selectedZoneId)?.nameAr}
                    initialCoords={gpsCoords}
                    isOutOfZone={isOutOfZone}
                    zoneWarning={gpsError}
                  />

                  {gpsCoords && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        📍 الإحداثيات المعتمدة: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                      </span>
                      <a
                        href={gpsCoords.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-black text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>فتح الموقع على خرائط جوجل 🗺️</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">منطقة التوصيل المعتمدة *</label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                        isOutOfZone
                          ? "border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-400"
                          : "border-rose-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-rose-400"
                      }`}
                    >
                      {isOutOfZone ? (
                        <option value="" className="text-rose-600 font-bold">
                          ⚠️ موقعك الحالي خارج نطاق التوصيل (متاح الشيخ زايد و 6 أكتوبر فقط)
                        </option>
                      ) : !selectedZoneId ? (
                        <option value="">اختر منطقة التوصيل</option>
                      ) : null}
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id} className="dark:bg-slate-800 dark:text-white">
                          {zone.nameAr} — رسوم التوصيل: {zone.deliveryFee.toFixed(2)} ج.م (الحد الأدنى: {zone.minOrderAmount.toFixed(0)} ج.م)
                        </option>
                      ))}
                    </select>
                    {isOutOfZone && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                        * يمكنك تعديل طريقة الاستلام بالأعلى إلى &quot;استلام من الفرع&quot; لمتابعة طلبك مجاناً وبدون أي رسوم توصيل.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">اسم الشارع والعنوان بالتفصيل *</label>
                    <input
                      type="text"
                      placeholder="مثال: شارع 9، ميدان فيكتوريا"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">رقم العقار</label>
                    <input
                      type="text"
                      placeholder="عمارة 15"
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">الدور والشقة</label>
                    <input
                      type="text"
                      placeholder="الدور 3 - شقة 7"
                      value={floorDoor}
                      onChange={(e) => setFloorDoor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">علامة مميزة بالقرب منكم</label>
                    <input
                      type="text"
                      placeholder="بجوار صيدلية أو بنك..."
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">عنوان الفرع المعتمد للاستلام:</p>
                <p>{currentBranch?.nameAr || "فرع المعادي الرئيسي"} - {currentBranch?.addressAr || storeAddress || "شارع 9 الرئيسي، المعادي، القاهرة"}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">هاتف الفرع: {currentBranch?.phone || storePhone || "01042814669"}</p>
              </div>
            )}
          </div>

          {/* 2. Celebration Add-ons Upsell */}
          <PartyUpsellAddons 
            selectedAddonIds={selectedAddons} 
            onToggleAddon={handleToggleAddon} 
          />

          {/* 3. Scheduling & Time Slot */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-rose-100 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-rose-100 dark:border-slate-800 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-sm">2</span>
              <h3 className="font-black text-base text-slate-900 dark:text-white">موعد وتوقيت الاستلام المحجوز</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">تاريخ الاستلام المطلوب *</label>
                
                {/* Quick Date Pills */}
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  {[
                    {
                      label: "اليوم 📅",
                      date: new Date().toISOString().split("T")[0],
                    },
                    {
                      label: "غداً (موصى به) ✨",
                      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                    },
                    {
                      label: "بعد غد 🍰",
                      date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
                    },
                  ].map((p) => {
                    const isPicked = selectedDate === p.date;
                    return (
                      <button
                        key={p.date}
                        type="button"
                        onClick={() => setSelectedDate(p.date)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                          isPicked
                            ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white font-black scale-105"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">الفترة الزمنية المفضلة للتسليم لضمان دقة الخَبز *</label>
                  <span className="text-[11px] text-pink-600 dark:text-pink-400 font-bold">✨ طازج بالموعد المحدد</span>
                </div>
                {slots.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic p-3 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700">لا توجد فترات مجدولة لهذا التاريخ حالياً، يرجى اختيار تاريخ لاحق</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const timeLabel = slot.timeRangeDisplay || slot.timeDisplay || `${slot.startTime} - ${slot.endTime}`;
                      const isSlotOpen = slot.available ?? slot.isAvailable ?? (slot.remainingCapacity > 0);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!isSlotOpen}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3.5 rounded-2xl border text-right transition flex flex-col justify-between ${
                            !isSlotOpen
                              ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                              : isSelected
                              ? "bg-gradient-to-r from-pink-500 to-sky-500 text-white border-transparent shadow-md scale-102"
                              : "bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-pink-50/50 dark:hover:bg-slate-700/50 hover:border-pink-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <span className="text-xs font-black">{timeLabel}</span>
                          <span className={`text-[10px] mt-1 font-bold ${isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                            {isSlotOpen 
                              ? `متاح (${slot.remainingCapacity} أماكن شاغرة)` 
                              : (slot.remainingCapacity <= 0 ? `مكتمل السعة (${slot.maxCapacity}/${slot.maxCapacity})` : "انتهت فترة اليوم")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exact Specific Delivery Time Picker & Note (USER REQUEST: specific hour e.g. 8:00 PM for party) */}
              <div className="pt-3 border-t border-rose-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    موعد وتوقيت التسليم المفضل بالتحديد (لمناسبتك وحفلتك) 🎂:
                  </label>
                  <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">موصى به للشيف</span>
                </div>
                
                {/* Specific time quick presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "1:00 ظهراً ☀️",
                    "3:00 عصراً ☕",
                    "5:00 مساءً 🌇",
                    "7:00 مساءً 🎂",
                    "8:00 مساءً 🎈",
                    "9:30 مساءً 🌙",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSpecificDeliveryTime(preset)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                        specificDeliveryTime === preset
                          ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                          : "bg-rose-50/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-rose-100 dark:border-slate-700 hover:bg-rose-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="مثال: محتاجه يوم 20 الساعة 8 بالليل بالضبط لحفلة عيد ميلاد 🎂"
                  value={specificDeliveryTime}
                  onChange={(e) => setSpecificDeliveryTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-xs"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  * سيتم تسجيل هذا الموعد الدقيق فورياً في جدول المطبخ والشيف لضمان خروج الكيكة طازجة بالدقيقة لمناسبتك!
                </p>
              </div>

            </div>
          </div>

          {/* 4. Customer Info */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-rose-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-rose-100 dark:border-slate-800 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-sm">3</span>
              <h3 className="font-black text-base text-slate-900 dark:text-white">بيانات التواصل والتأكيد</h3>
            </div>

            {/* Guest Checkout Suggestion & Encouragement (USER REQUEST) */}
            {!user && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/80 border border-pink-200/80 dark:border-slate-700 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">
                  💡
                </div>
                <div className="space-y-1">
                  <span className="font-black text-slate-900 dark:text-white block">أنت تكمل الطلب حالياً كـ زائر (Guest)</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    يمكنك كتابة بياناتك وإتمام طلبك كزائر مباشرة، ولكن ننصحك بـ <Link href="/login?redirect=/checkout" className="text-pink-600 dark:text-pink-400 font-black underline hover:text-pink-700">تسجيل الدخول أو إنشاء حساب</Link> لتجميع نقاط المكافآت التلقائية، وحفظ عناوينك، وتتبع مراحل تجهيز التورتة بنقرة واحدة!
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">الاسم بالكامل *</label>
                <input
                  type="text"
                  placeholder="مثال: سارة أحمد"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">رقم الهاتف المصري للتواصل والتأكيد *</label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="01012345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">ملاحظات خاصة للشيف (اختياري)</label>
              <textarea
                rows={2}
                placeholder="تعليمات خاصة بالتسليم أو جملة الإهداء المراد كتابتها..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
              />
            </div>
          </div>

          {/* 5. Loyalty Points Widget */}
          <LoyaltyPointsWidget 
            onApplyPointsDiscount={setLoyaltyDiscount}
            orderSubtotal={rawSubtotal}
          />

          {/* 6. Payment Method */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-rose-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-rose-100 dark:border-slate-800 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-sm">4</span>
              <h3 className="font-black text-base text-slate-900 dark:text-white">طريقة السداد الآمنة</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Option 1: Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === "CASH"
                    ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 text-slate-900 dark:text-white shadow-sm ring-2 ring-rose-400 dark:ring-rose-500"
                    : "bg-white dark:bg-slate-800/80 border-rose-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50/30 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    كاش مريح 💵
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={() => setPaymentMethod("CASH")}
                  className="hidden"
                />
                <div>
                  <h4 className="font-black text-xs sm:text-sm">الدفع نقداً عند الاستلام</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">كاش للمندوب عند استلام الكعكة أو من الفرع</p>
                </div>
              </label>

              {/* Option 2: Vodafone Cash / InstaPay */}
              <label
                className={`p-4 rounded-2xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === "MANUAL_TRANSFER"
                    ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 text-slate-900 dark:text-white shadow-sm ring-2 ring-indigo-400 dark:ring-indigo-500"
                    : "bg-white dark:bg-slate-800/80 border-rose-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50/30 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    فودافون كاش / إنستاباي 📱
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MANUAL_TRANSFER"
                  checked={paymentMethod === "MANUAL_TRANSFER"}
                  onChange={() => setPaymentMethod("MANUAL_TRANSFER")}
                  className="hidden"
                />
                <div>
                  <h4 className="font-black text-xs sm:text-sm">فودافون كاش أو إنستاباي</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">تحويل فوري وإرفاق رقم المحفظة المُرسِل</p>
                </div>
              </label>

            </div>

            {/* Dedicated Manual Transfer Instruction & Sender Input Card */}
            {paymentMethod === "MANUAL_TRANSFER" && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-pink-50/50 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-900/90 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>بيانات حسابات التحويل المعتمدة لـ Lolo Cupcakes:</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    يرجى تحويل مبلغ الطلب الإجمالي إلى أحد الحسابات التالية، ثم إدخال رقمك أدناه لتوثيق السداد:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Vodafone Cash Box */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">رقم فودافون كاش (Vodafone Cash):</span>
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white" dir="ltr">
                        {vodafoneCashNumber || storePhone || "01069915609"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText((vodafoneCashNumber || storePhone || "01069915609").replace(/\s+/g, ''));
                        setCopyFeedback("VODAFONE");
                        setTimeout(() => setCopyFeedback(null), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-bold text-[10px] transition flex items-center gap-1"
                    >
                      {copyFeedback === "VODAFONE" ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copyFeedback === "VODAFONE" ? "تم النسخ" : "نسخ الرقم"}</span>
                    </button>
                  </div>

                  {/* InstaPay Box */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">عنوان إنستاباي (InstaPay IPA):</span>
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white" dir="ltr">
                        {instapayAddress || "lolocupcakes@instapay"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText((instapayAddress || "lolocupcakes@instapay").trim());
                        setCopyFeedback("INSTAPAY");
                        setTimeout(() => setCopyFeedback(null), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-bold text-[10px] transition flex items-center gap-1"
                    >
                      {copyFeedback === "INSTAPAY" ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copyFeedback === "INSTAPAY" ? "تم النسخ" : "نسخ الحساب"}</span>
                    </button>
                  </div>
                </div>

                {/* Required: Sender Phone / Wallet */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-black text-xs text-slate-800 dark:text-slate-200 block">
                    رقم الهاتف أو المحفظة التي قمت بالتحويل منها (إلزامي للتحقق) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 010xxxxxxxx أو اسم حساب إنستاباي المُرسِل"
                    value={senderPhoneOrWallet}
                    onChange={(e) => setSenderPhoneOrWallet(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    يتم مطابقة هذا الرقم مع كشف حساب المحفظة فورياً لتأكيد طلبك وتجهيزه في الموعد.
                  </span>
                </div>

                {/* Upload Proof Attachment */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    إرفاق صورة إشعار أو سكرين شوت التحويل (اختياري / موصى به):
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer transition flex items-center gap-2 shadow-xs">
                      <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{receiptPreview ? "تغيير صورة الإيصال" : "اختيار صورة الإشعار"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReceiptPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {receiptPreview && (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>تم تجهيز الإيصال للإرفاق</span>
                        <button
                          type="button"
                          onClick={() => setReceiptPreview(null)}
                          className="text-rose-500 hover:text-rose-700 font-black mr-2 text-[10px]"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Authoritative Pricing (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-rose-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-rose-100 dark:border-slate-800 pb-4">
              ملخص الطلب والحساب المعتمد ✨
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-rose-100/60 dark:divide-slate-800">
              {cart && cart.items.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.productNameAr}</span>
                    <span className="text-slate-500 dark:text-slate-400 block">× {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.lineTotal.toFixed(2)} ج.م</span>
                </div>
              ))}
            </div>

            {/* Selected Upsell Addons Mini Display */}
            {selectedAddons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-rose-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">إضافات الحفلة المختارة:</span>
                {selectedAddons.map((id) => {
                  const item = PARTY_ADDONS.find((a) => a.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                      <span>{item.icon} {item.nameAr}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">+{item.price} ج.م</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coupon Code Section */}
            <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">كود الخصم الترويجي</label>
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                  كوبون ترحيبي: LOLO10
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="أدخل الكوبون (مثال: LOLO10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm"
                >
                  تطبيق
                </button>
              </div>
              {appliedCoupon && quote?.appliedCouponCode && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>تم تطبيق الكوبون {quote.appliedCouponCode} بنجاح ✨</span>
                </div>
              )}
            </div>

            {/* Authoritative Server Quote Calculation */}
            <div className="space-y-2 pt-3 border-t border-rose-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>المجموع الفرعي للأصناف:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {rawSubtotal.toFixed(2)} ج.م
                </span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>رسوم التوصيل:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {fulfillmentType === "PICKUP" ? "مجاناً" : `${deliveryFee.toFixed(2)} ج.م`}
                </span>
              </div>

              {addonsTotal > 0 && (
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>إجمالي إضافات الاحتفال:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">+{addonsTotal.toFixed(2)} ج.م</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>خصم الكوبون:</span>
                  <span>- {couponDiscount.toFixed(2)} ج.م</span>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold">
                  <span>خصم مكافآت VIP الملكية:</span>
                  <span>- {loyaltyDiscount.toFixed(2)} ج.م</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-rose-100 dark:border-slate-800">
                <span>الإجمالي النهائي:</span>
                <span className="text-xl text-rose-600 dark:text-rose-400">
                  {estimatedTotal.toFixed(2)} <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ج.م</span>
                </span>
              </div>
            </div>

            {/* Quote Error Notice */}
            {quoteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{quoteError}</span>
              </div>
            )}

            {/* Submit Error Notice */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Out of Zone Delivery Warning Banner */}
            {fulfillmentType === "DELIVERY" && isOutOfZone && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-800 text-xs text-rose-950 dark:text-rose-200 font-bold space-y-1.5 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>⚠️ التوصيل متوفر لزايد وأكتوبر فقط</span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                  موقعك المكتشف خارج نطاق التوصيل المتاح حالياً. يرجى اختيار &quot;استلام من الفرع&quot; بالأعلى لإتمام طلبك مجاناً وبدون رسوم توصيل.
                </p>
              </div>
            )}

            {/* Mandatory GPS Reminder Badge if delivery is chosen without GPS */}
            {fulfillmentType === "DELIVERY" && !gpsCoords && !isOutOfZone && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 font-bold flex items-start gap-2 shadow-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <span className="block font-black text-amber-950 dark:text-amber-100 mb-0.5">⚠️ تحديد موقع الـ GPS إجباري:</span>
                  يُرجى الضغط على زر &quot;تحديد موقعي الحالي تلقائياً&quot; في قسم التوصيل لتأكيد موقعك بدقة.
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || quoteLoading || !!quoteError || (fulfillmentType === "DELIVERY" && (isOutOfZone || !gpsCoords))}
              className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm shadow-rose-glow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                fulfillmentType === "DELIVERY" && isOutOfZone
                  ? "bg-rose-700 hover:bg-rose-800"
                  : "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-105 active:scale-95"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل وحجز الطلب...</span>
                </>
              ) : fulfillmentType === "DELIVERY" && isOutOfZone ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>خارج نطاق التوصيل (متاح زايد وأكتوبر فقط) ⚠️</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>تأكيد الطلب وحجز الموعد الآن 🧁</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              * بمجرد التأكيد، يتم حجز موعد الإنتاج فورياً وإرسال رمز التتبع الآمن إليكم.
            </div>
          </div>
        </div>
      </form>

      {/* Order Confirmation Modal with WhatsApp Share */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900">
                تهانينا! تم حجز طلبك بنجاح ✨
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                رقم الطلب: {completedOrder.publicOrderNumber}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تم حفظ حجزك في جدول المطبخ فورياً. يرجى الاحتفاظ برمز التتبع أو مشاركته مع فريق الدعم.
              </p>
            </div>

            <div className="bg-rose-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-rose-100 dark:border-slate-700 space-y-2 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">حالة السداد:</span>
                <span className="font-bold text-slate-900 dark:text-white">{completedOrder.paymentStatusLabelAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">حالة الطلب:</span>
                <span className="font-bold text-slate-900 dark:text-white">{completedOrder.orderStatusLabelAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">الموعد المحدد:</span>
                <span className="font-bold text-slate-900 dark:text-white">{completedOrder.scheduledForDate} ({completedOrder.scheduledForTimeRange})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">المبلغ الإجمالي:</span>
                <span className="font-black text-rose-600 dark:text-rose-400">{completedOrder.totalAmount.toFixed(2)} ج.م</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Share Button (USER REQUEST: Creative direct WhatsApp forwarding for approval) */}
              <a
                href={`https://wa.me/${cleanWhatsAppNumber || "201016197035"}?text=${encodeURIComponent(
                  `مرحباً إدارة لولو كب كيك 🧁 أود تأكيد طلبي واعتماده فوراً!\n\n` +
                  `• رقم الطلب: ${completedOrder.publicOrderNumber}\n` +
                  `• اسم العميل: ${customerName}\n` +
                  `• رقم الهاتف: ${customerPhone}\n` +
                  `• طريقة الدفع: ${paymentMethod === "CASH" ? "الدفع عند الاستلام كاش 💵" : "تحويل فودافون كاش / إنستاباي 📱"}\n` +
                  (paymentMethod === "MANUAL_TRANSFER" && senderPhoneOrWallet ? `• رقم محفظة التحويل: ${senderPhoneOrWallet}\n` : "") +
                  `• الإجمالي: ${completedOrder.totalAmount.toFixed(2)} ج.م\n` +
                  `• الموعد المحدد: ${completedOrder.scheduledForDate} ${specificDeliveryTime ? `(الساعة المطلوبة: ${specificDeliveryTime})` : ""}\n\n` +
                  `رابط تتبع الطلب: ${typeof window !== "undefined" ? window.location.origin : ""}/orders/${completedOrder.publicOrderNumber}?token=${completedOrder.trackingToken}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-105 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>إرسال تفاصيل الطلب والإيصال للإدارة عبر واتساب فوراً 📲</span>
              </a>

              {/* View Order Tracking Button */}
              <button
                type="button"
                onClick={() => router.push(`/orders/${completedOrder.publicOrderNumber}?token=${completedOrder.trackingToken}`)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>الانتقال لصفحة تتبع الطلب مباشرة 🚀</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="animate-spin text-4xl mb-2">🧁</div>
        <p className="text-sm font-bold text-slate-800">جاري تحميل بوابة الدفع والحجز الآمن...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
