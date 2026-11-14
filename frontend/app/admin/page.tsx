"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { 
  getAdminMetrics, 
  getAdminOrders, 
  updateOrderStatus, 
  getAdminPayments, 
  approvePayment, 
  rejectPayment, 
  getAdminCustomCakes, 
  submitAdminQuote, 
  getStoreSettings, 
  updateStoreSetting,
  getCategories,
  getProducts,
  createAdminCategory,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  updateAdminCategory,
  deleteAdminCategory,
  toggleAdminProductStatus,
  rescheduleOrder,
  getDailyReminders,
  DailyReminderSummary,
  publishProductToN8n,
  DashboardMetricsDto, 
  OrderResponseDto, 
  PaymentResponseDto, 
  CustomCakeRequestResponseDto, 
  StoreSettingDto,
  CategoryDto,
  ProductDto,
  CreateCategoryRequest,
  CreateProductRequest,
  getAvailableSlots,
  TimeSlotDto,
  getAdminDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  DeliveryZoneDto,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCoupon,
  deleteAdminCoupon,
  CouponDto,
  CreateCouponRequest,
  getAdminCustomers,
  CustomerAdminDto,
  uploadImageFile,
  getAdminReviews,
  createAdminReview,
  deleteAdminReview,
  ReviewItemDto,
  API_BASE_URL 
} from "@/lib/api";
import { 
  BarChart3, 
  ShoppingBag, 
  CreditCard, 
  Cake, 
  Settings, 
  CheckCircle2, 
  Eye, 
  Save, 
  RefreshCw,
  Plus,
  FolderPlus,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Upload,
  Layers,
  Clock,
  Camera,
  Check,
  MessageCircle,
  Calendar,
  Send,
  Bell,
  Share2,
  Store,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  MapPin,
  SlidersHorizontal,
  ExternalLink,
  XCircle,
  CheckCircle,
  Coins,
  ChevronRight,
  ChevronLeft,
  Search,
  Ticket,
  Download,
  Volume2,
  VolumeX,
  Printer,
  UserCheck,
  ShieldCheck,
  PhoneCall,
  Users,
  Star
} from "lucide-react";
import Link from "next/link";
import { playJoyfulChime } from "@/lib/soundFx";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export type AdminTab = 
  | "METRICS" 
  | "ORDERS" 
  | "CATALOG" 
  | "CATEGORIES" 
  | "ZONES" 
  | "COUPONS"
  | "PAYMENTS" 
  | "SLIDERS" 
  | "LOYALTY" 
  | "SETTINGS" 
  | "CAKES"
  | "CUSTOMERS"
  | "REVIEWS";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("METRICS");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Authentication & Admin Access Gate
  const { user, isLoggedIn, loading: authLoading, login, logout } = useAuth();
  const [adminLoginEmail, setAdminLoginEmail] = useState("admin@lolocupcakes.com");
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Metrics State
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Orders State & Search & Accept/Reject Workflow
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<OrderResponseDto | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>("");
  const [orderStatusNote, setOrderStatusNote] = useState<string>("");

  // Audio Alerts State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersCountRef = React.useRef<number>(0);

  // Coupons Management State
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"PERCENTAGE" | "FIXED" | "FIXED_AMOUNT">("PERCENTAGE");
  const [newCouponValue, setNewCouponValue] = useState("10");
  const [newCouponMinOrder, setNewCouponMinOrder] = useState("100");
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState("");
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState("");
  const [newCouponStartDate, setNewCouponStartDate] = useState("");
  const [newCouponEndDate, setNewCouponEndDate] = useState("");
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Rejection Workflow Modal State (USER REQUEST)
  const [rejectingOrder, setRejectingOrder] = useState<OrderResponseDto | null>(null);
  const [rejectReason, setRejectReason] = useState("نعتذر لتعذر تنفيذ الطلب نظراً لعدم توفر المكونات اليوم");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Delivery Zones State (USER REQUEST: Full CRUD with fees and min order)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneDto[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [newZoneNameAr, setNewZoneNameAr] = useState("");
  const [newZoneNameEn, setNewZoneNameEn] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("45.00");
  const [newZoneMinOrder, setNewZoneMinOrder] = useState("150.00");
  const [newZoneOrder] = useState(1);
  const [editingZone, setEditingZone] = useState<DeliveryZoneDto | null>(null);
  const [editZoneNameAr, setEditZoneNameAr] = useState("");
  const [editZoneFee, setEditZoneFee] = useState("45.00");
  const [editZoneMinOrder, setEditZoneMinOrder] = useState("150.00");
  const [zoneSubmitting, setZoneSubmitting] = useState(false);

  // Sliders Management State (USER REQUEST: Dynamic customization of hero and cake showcase slides)
  const [heroSlidesAdmin, setHeroSlidesAdmin] = useState<Array<{ src: string; title: string; tag: string; sub: string }>>([]);
  const [newSlideSrc, setNewSlideSrc] = useState("");
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideTag, setNewSlideTag] = useState("الأكثر طلباً ★");
  const [newSlideSub, setNewSlideSub] = useState("مخبوزة طازجة اليوم بحرفية");

  const [cakeSlidesAdmin, setCakeSlidesAdmin] = useState<Array<{ src: string; title: string; flavor: string; tiers: string }>>([]);
  const [newCakeSrc, setNewCakeSrc] = useState("");
  const [newCakeTitle, setNewCakeTitle] = useState("");
  const [newCakeFlavor, setNewCakeFlavor] = useState("");
  const [newCakeTiers, setNewCakeTiers] = useState("3 أدوار فاخرة");

  // Loyalty Program Rules State (USER REQUEST: VIP Loyalty rules)
  const [loyaltyPointsPerEgp, setLoyaltyPointsPerEgp] = useState("10"); // 1 pt per 10 EGP
  const [loyaltyEgpPerPoint, setLoyaltyEgpPerPoint] = useState("0.05"); // 1 pt = 0.05 EGP

  // Payments State
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("PENDING_VERIFICATION");

  // Custom Cakes State
  const [cakes, setCakes] = useState<CustomCakeRequestResponseDto[]>([]);
  const [cakeStatusFilter, setCakeStatusFilter] = useState<string>("");
  const [selectedCake, setSelectedCake] = useState<CustomCakeRequestResponseDto | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>("850.00");
  const [quoteTerms, setQuoteTerms] = useState<string>("تورتة مخصصة حسب المواصفات المطلوبة، صالحة لمدة 48 ساعة.");
  const [quoteHours, setQuoteHours] = useState<number>(48);

  // Settings State & Logo
  const [settings, setSettings] = useState<StoreSettingDto[]>([]);
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [logoInputUrl, setLogoInputUrl] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null);

  // Toast Notification System (USER REQUEST)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; id: number } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (type === "success") playJoyfulChime();
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // Catalog Management State
  const [catalogCategories, setCatalogCategories] = useState<CategoryDto[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductDto[]>([]);
  const [catalogFilterCategory, setCatalogFilterCategory] = useState<string>("");
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // New Category Form State
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatOrder, setNewCatOrder] = useState<number>(1);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Edit Category Modal State (USER REQUEST: Full CRUD)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [editCatNameAr, setEditCatNameAr] = useState("");
  const [editCatNameEn, setEditCatNameEn] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [editCatOrder, setEditCatOrder] = useState<number>(1);
  const [editCatSubmitting, setEditCatSubmitting] = useState(false);

  // New Product Form State
  const [newProdNameAr, setNewProdNameAr] = useState("");
  const [newProdNameEn, setNewProdNameEn] = useState("");
  const [newProdSlug, setNewProdSlug] = useState("");
  const [newProdCategoryId, setNewProdCategoryId] = useState("");
  const [newProdType, setNewProdType] = useState<CreateProductRequest["productType"]>("CUPCAKE");
  const [newProdSellingUnit, setNewProdSellingUnit] = useState<CreateProductRequest["sellingUnit"]>("PIECE");
  const [newProdPrice, setNewProdPrice] = useState<number>(45);
  const [newProdLeadHours, setNewProdLeadHours] = useState<number>(3);
  const [newProdStock, setNewProdStock] = useState<number>(15);
  const [newProdIsPreOrder, setNewProdIsPreOrder] = useState<boolean>(false);
  const [newProdDescAr, setNewProdDescAr] = useState("");
  const [newProdIsFeatured, setNewProdIsFeatured] = useState<boolean>(false);
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Edit Product Modal State (USER REQUEST: Full CRUD)
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [editProdNameAr, setEditProdNameAr] = useState("");
  const [editProdNameEn, setEditProdNameEn] = useState("");
  const [editProdPrice, setEditProdPrice] = useState<number>(45);
  const [editProdStock, setEditProdStock] = useState<number>(15);
  const [editProdIsPreOrder, setEditProdIsPreOrder] = useState<boolean>(false);
  const [editProdLeadHours, setEditProdLeadHours] = useState<number>(2);
  const [editProdDescAr, setEditProdDescAr] = useState("");
  const [editProdIsFeatured, setEditProdIsFeatured] = useState<boolean>(false);
  const [editProdImageUrl, setEditProdImageUrl] = useState("");
  const [editProdSubmitting, setEditProdSubmitting] = useState(false);

  // Real Image Upload States
  const [uploadingProdImage, setUploadingProdImage] = useState(false);
  const [uploadingEditProdImage, setUploadingEditProdImage] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  // Reviews Management State (USER REQUEST: التحكم الكامل في التقييمات المعروضة)
  const [reviews, setReviews] = useState<ReviewItemDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewCustomer, setNewReviewCustomer] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewSubmitting, setNewReviewSubmitting] = useState(false);

  // Customers Management State (USER REQUEST)
  const [customers, setCustomers] = useState<CustomerAdminDto[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Reschedule Order Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reschedulingOrder, setReschedulingOrder] = useState<OrderResponseDto | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlotDto[]>([]);
  const [selectedRescheduleSlotId, setSelectedRescheduleSlotId] = useState<string>("");
  const [rescheduleNote, setRescheduleNote] = useState<string>("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleNotificationPrompt, setRescheduleNotificationPrompt] = useState<{
    phone: string;
    message: string;
    orderNum: string;
  } | null>(null);

  // Daily Delivery Reminders State
  const [remindersDate, setRemindersDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [remindersData, setRemindersData] = useState<DailyReminderSummary | null>(null);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // n8n Publishing State
  const [publishingN8nId, setPublishingN8nId] = useState<string | null>(null);
  const [n8nStatusMsg, setN8nStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Kitchen Slots State
  const [kitchenSlots, setKitchenSlots] = useState<TimeSlotDto[]>([]);
  const [slotFilterDate, setSlotFilterDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);

  const loadKitchenSlots = useCallback((targetDate: string) => {
    getAvailableSlots(targetDate, "DELIVERY")
      .then(setKitchenSlots)
      .catch(() => setKitchenSlots([]));
  }, []);

  // Initial load
  const refreshMetrics = useCallback(() => {
    setMetricsLoading(true);
    getAdminMetrics()
      .then((data) => {
        setMetrics(data);
        setMetricsLoading(false);
      })
      .catch(() => setMetricsLoading(false));
    loadKitchenSlots(slotFilterDate);
  }, [slotFilterDate, loadKitchenSlots]);

  useEffect(() => {
    refreshMetrics();
    // Load local logo if saved
    const savedLogo = localStorage.getItem("store_logo_url");
    if (savedLogo) {
      setCurrentLogo(savedLogo);
      setLogoInputUrl(savedLogo);
    }
  }, [refreshMetrics]);

  // Load Coupons List
  const loadAdminCouponsList = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const list = await getAdminCoupons();
      setCoupons(list);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تحميل الكوبونات", "error");
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "COUPONS") {
      loadAdminCouponsList();
    }
  }, [activeTab, loadAdminCouponsList]);

  // Audio chime alert on new orders
  useEffect(() => {
    if (orders.length > 0 && prevOrdersCountRef.current > 0 && orders.length > prevOrdersCountRef.current) {
      if (soundEnabled) {
        playJoyfulChime();
        showToast("🔔 وصل طلب جديد إلى المتجر!", "success");
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders.length, soundEnabled]);

  // Coupon actions
  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setNewCouponCode("");
    setNewCouponType("PERCENTAGE");
    setNewCouponValue("10");
    setNewCouponMinOrder("100");
    setNewCouponMaxDiscount("");
    setNewCouponUsageLimit("");
    setNewCouponStartDate("");
    setNewCouponEndDate("");
    setCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: CouponDto) => {
    setEditingCoupon(coupon);
    setNewCouponCode(coupon.code);
    setNewCouponType(coupon.discountType);
    setNewCouponValue(coupon.discountValue.toString());
    setNewCouponMinOrder(coupon.minOrderAmount?.toString() || "0");
    setNewCouponMaxDiscount(coupon.maxDiscountAmount?.toString() || "");
    setNewCouponUsageLimit(coupon.usageLimit?.toString() || "");
    setNewCouponStartDate(coupon.startDate ? coupon.startDate.split("T")[0] : "");
    setNewCouponEndDate(coupon.endDate ? coupon.endDate.split("T")[0] : "");
    setCouponModalOpen(true);
  };

  const handleCreateOrUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      showToast("يرجى إدخال رمز الكوبون", "error");
      return;
    }
    setCouponSubmitting(true);
    try {
      const payload: CreateCouponRequest = {
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        discountValue: parseFloat(newCouponValue) || 10,
        minOrderAmount: parseFloat(newCouponMinOrder) || 0,
        maxDiscountAmount: newCouponMaxDiscount ? parseFloat(newCouponMaxDiscount) : undefined,
        usageLimit: newCouponUsageLimit ? parseInt(newCouponUsageLimit) : undefined,
        startDate: newCouponStartDate ? `${newCouponStartDate}T00:00:00` : undefined,
        endDate: newCouponEndDate ? `${newCouponEndDate}T23:59:59` : undefined,
      };

      if (editingCoupon) {
        await updateAdminCoupon(editingCoupon.id, payload);
        showToast(`تم تحديث الكوبون ${payload.code} بنجاح! ✨`);
      } else {
        await createAdminCoupon(payload);
        showToast(`تم إنشاء الكوبون الجديد ${payload.code} بنجاح! 🏷️`);
      }
      setCouponModalOpen(false);
      setEditingCoupon(null);
      loadAdminCouponsList();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حفظ الكوبون", "error");
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (coupon: CouponDto) => {
    try {
      await toggleAdminCoupon(coupon.id);
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c)));
      showToast(`تم تغيير حالة الكوبون ${coupon.code} بنجاح ✨`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تغيير حالة الكوبون", "error");
    }
  };

  const handleDeleteCoupon = async (coupon: CouponDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) return;
    try {
      await deleteAdminCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      showToast(`تم حذف الكوبون ${coupon.code} بنجاح 🗑️`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حذف الكوبون", "error");
    }
  };

  // Reviews Handlers (USER REQUEST: التحكم الكامل بآراء وتقييمات العملاء)
  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const list = await getAdminReviews();
      setReviews(list);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تحميل التقييمات", "error");
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewCustomer.trim() || !newReviewComment.trim()) {
      showToast("يرجى إدخال اسم العميل والتعليق", "error");
      return;
    }
    setNewReviewSubmitting(true);
    try {
      await createAdminReview({
        customerName: newReviewCustomer.trim(),
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        isFeatured: true,
      });
      showToast("تمت إضافة تقييم العميل بنجاح! ⭐");
      setReviewModalOpen(false);
      setNewReviewCustomer("");
      setNewReviewComment("");
      setNewReviewRating(5);
      loadReviews();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حفظ التقييم", "error");
    } finally {
      setNewReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (review: ReviewItemDto) => {
    if (!window.confirm(`هل أنت متأكد من حذف تقييم العميل "${review.customerName}"؟`)) return;
    try {
      await deleteAdminReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showToast("تم حذف التقييم بنجاح 🗑️");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حذف التقييم", "error");
    }
  };

  // Export orders to CSV/Excel
  const exportOrdersToCsv = () => {
    if (orders.length === 0) {
      showToast("لا توجد طلبات لتصديرها حالياً", "error");
      return;
    }
    const headers = [
      "رقم الطلب",
      "تاريخ الإنشاء",
      "اسم العميل",
      "رقم الهاتف",
      "طريقة الاستلام",
      "التاريخ المجدول",
      "الموعد",
      "المنطقة / العنوان",
      "طريقة الدفع",
      "حالة الدفع",
      "حالة الطلب",
      "المجموع الفرعي",
      "الخصم",
      "رسوم التوصيل",
      "الإجمالي (ج.م)",
      "ملاحظات العميل"
    ];

    const rows = orders.map((o) => [
      o.publicOrderNumber,
      o.createdAt ? new Date(o.createdAt).toLocaleString("ar-EG") : "",
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${o.customerPhone || ""}"`,
      o.fulfillmentTypeLabelAr || o.fulfillmentType,
      o.scheduledForDate || "",
      o.scheduledForTimeRange || "",
      `"${(o.deliveryAddressSnapshot || "").replace(/"/g, '""')}"`,
      o.paymentMethodLabelAr || (o.paymentMethod === "MANUAL_TRANSFER" ? "تحويل إلكتروني" : "نقد عند الاستلام"),
      o.paymentStatusLabelAr || o.paymentStatus,
      o.orderStatusLabelAr || o.orderStatus,
      o.subtotal || o.totalAmount,
      o.discountAmount || 0,
      o.deliveryFee || 0,
      o.totalAmount,
      `"${(o.customerNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lolo_cupcakes_orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("تم تصدير ملف الطلبات (CSV/Excel) بنجاح! 📥");
  };

  // Reschedule Slots Effect
  useEffect(() => {
    if (rescheduleModalOpen && rescheduleDate && reschedulingOrder) {
      getAvailableSlots(rescheduleDate, reschedulingOrder.fulfillmentType)
        .then((data) => {
          setRescheduleSlots(data);
          const avail = data.find((s) => s.available);
          if (avail) setSelectedRescheduleSlotId(avail.id);
          else if (data.length > 0) setSelectedRescheduleSlotId(data[0].id);
        })
        .catch(() => setRescheduleSlots([]));
    }
  }, [rescheduleModalOpen, rescheduleDate, reschedulingOrder]);

  const handleOpenReschedule = (order: OrderResponseDto) => {
    setReschedulingOrder(order);
    setRescheduleDate(order.scheduledForDate || new Date().toISOString().split("T")[0]);
    setRescheduleNote("");
    setRescheduleNotificationPrompt(null);
    setRescheduleModalOpen(true);
  };

  const handleExecuteReschedule = async () => {
    if (!reschedulingOrder) return;
    setRescheduleSubmitting(true);
    try {
      const updated = await rescheduleOrder(
        reschedulingOrder.id,
        rescheduleDate,
        selectedRescheduleSlotId || undefined,
        rescheduleNote || undefined
      );

      // Refresh orders list
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      // Prepare WhatsApp customer notification
      const rawPhone = updated.customerPhone || "";
      const phoneClean = rawPhone.replace(/\D/g, "");
      const finalPhone = phoneClean.startsWith("01") ? "2" + phoneClean : phoneClean;
      const notifyMsg = `مرحباً بك عميلنا العزيز ${updated.customerName} 🌸، نود إعلامكم بأنه تم تعديل موعد استلام/توصيل طلبكم رقم #${updated.publicOrderNumber} من لولو كب كيك ليصبح بتاريخ: ${updated.scheduledForDate} خلال الفترة (${updated.scheduledForTimeRange || "الفترة المحددة"}). يسعدنا دائماً خدمتكم! 🍰`;

      setRescheduleNotificationPrompt({
        phone: finalPhone,
        message: notifyMsg,
        orderNum: updated.publicOrderNumber,
      });
      setSaveSuccessMsg(`تم تحديث موعد الطلب #${updated.publicOrderNumber} بنجاح!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل إعادة جدولة الطلب");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // Load Daily Reminders
  const loadDailyReminders = async (dateStr: string) => {
    setRemindersLoading(true);
    try {
      const data = await getDailyReminders(dateStr);
      setRemindersData(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setRemindersLoading(false);
    }
  };

  // Publish to n8n Webhook
  const handlePublishToN8n = async (productId: string, productNameAr: string) => {
    setPublishingN8nId(productId);
    setN8nStatusMsg(null);
    try {
      await publishProductToN8n(productId);
      setN8nStatusMsg({
        type: "success",
        text: `تم بنجاح إرسال "${productNameAr}" إلى روبوت n8n ونشره تلقائياً على صفحة فيسبوك! 🚀`,
      });
      setTimeout(() => setN8nStatusMsg(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setN8nStatusMsg({
        type: "error",
        text: `تعذر النشر التلقائي عبر n8n: ${error.message}`,
      });
    } finally {
      setPublishingN8nId(null);
    }
  };

  const loadCatalogData = useCallback(() => {
    getCategories().then(setCatalogCategories).catch(() => []);
    getProducts({
      categorySlug: catalogFilterCategory || undefined,
      search: catalogSearch || undefined,
      size: 50,
    })
      .then((res) => setCatalogProducts(res.content))
      .catch(() => setCatalogProducts([]));
  }, [catalogFilterCategory, catalogSearch]);

  // Load tab data
  useEffect(() => {
    if (activeTab === "ORDERS") {
      setLoading(true);
      getAdminOrders(orderStatusFilter || undefined)
        .then((res) => {
          setOrders(res.content);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === "PAYMENTS") {
      setLoading(true);
      getAdminPayments(paymentStatusFilter || undefined)
        .then((res) => {
          setPayments(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === "CAKES") {
      setLoading(true);
      getAdminCustomCakes(cakeStatusFilter || undefined)
        .then((res) => {
          setCakes(res.content);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === "CATALOG") {
      loadCatalogData();
    } else if (activeTab === "SETTINGS") {
      setLoading(true);
      getStoreSettings()
        .then((res) => {
          setSettings(res);
          const initialMap: Record<string, string> = {};
          res.forEach((s) => { initialMap[s.key] = s.value; });
          setEditingSettings(initialMap);
          if (initialMap["store_logo_url"]) {
            setCurrentLogo(initialMap["store_logo_url"]);
            setLogoInputUrl(initialMap["store_logo_url"]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === "ZONES") {
      loadAdminZones();
    } else if (activeTab === "SLIDERS") {
      loadSliders();
    } else if (activeTab === "CATEGORIES") {
      loadCatalogData();
    } else if (activeTab === "CUSTOMERS") {
      setCustomersLoading(true);
      getAdminCustomers()
        .then(setCustomers)
        .catch(() => setCustomers([]))
        .finally(() => setCustomersLoading(false));
    } else if (activeTab === "REVIEWS") {
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orderStatusFilter, paymentStatusFilter, cakeStatusFilter, loadCatalogData]);

  // Delivery Zones Handlers (USER REQUEST: Full CRUD controlled by admin)
  const loadAdminZones = useCallback(async () => {
    setZonesLoading(true);
    try {
      const list = await getAdminDeliveryZones();
      setDeliveryZones(list);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setZonesLoading(false);
    }
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneNameAr.trim()) {
      showToast("يرجى إدخال اسم منطقة التوصيل بالعربية", "error");
      return;
    }
    setZoneSubmitting(true);
    try {
      await createDeliveryZone({
        nameAr: newZoneNameAr.trim(),
        nameEn: newZoneNameEn.trim() || undefined,
        deliveryFee: parseFloat(newZoneFee) || 40,
        minOrderAmount: parseFloat(newZoneMinOrder) || 100,
        displayOrder: newZoneOrder,
        isActive: true,
      });
      showToast(`تمت إضافة منطقة التوصيل "${newZoneNameAr}" بنجاح! 🛵`);
      setNewZoneNameAr("");
      setNewZoneNameEn("");
      loadAdminZones();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل إضافة المنطقة", "error");
    } finally {
      setZoneSubmitting(false);
    }
  };

  const handleSaveEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setZoneSubmitting(true);
    try {
      await updateDeliveryZone(editingZone.id, {
        nameAr: editZoneNameAr.trim(),
        deliveryFee: parseFloat(editZoneFee),
        minOrderAmount: parseFloat(editZoneMinOrder),
      });
      showToast(`تم تحديث منطقة التوصيل "${editZoneNameAr}" بنجاح ✨`);
      setEditingZone(null);
      loadAdminZones();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تحديث المنطقة", "error");
    } finally {
      setZoneSubmitting(false);
    }
  };

  const handleDeleteZone = async (zoneId: string, zoneName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف منطقة التوصيل "${zoneName}"؟ سيتم إزالتها نهائياً.`)) return;
    try {
      await deleteDeliveryZone(zoneId);
      showToast(`تم حذف منطقة التوصيل "${zoneName}" بنجاح 🗑️`);
      loadAdminZones();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حذف المنطقة", "error");
    }
  };

  // Sliders Handlers (USER REQUEST: Dynamic Slides for Hero & Custom Cakes synced with Neon DB)
  const loadSliders = useCallback(async () => {
    try {
      const res = await getStoreSettings().catch(() => []);
      const settingsMap: Record<string, string> = {};
      res.forEach((s) => { settingsMap[s.key] = s.value; });

      if (settingsMap["hero_slides"]) {
        try {
          const parsed = JSON.parse(settingsMap["hero_slides"]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHeroSlidesAdmin(parsed);
          }
        } catch {}
      } else {
        const storedHero = localStorage.getItem("store_hero_slides");
        if (storedHero) {
          try { setHeroSlidesAdmin(JSON.parse(storedHero)); } catch {}
        } else {
          setHeroSlidesAdmin([
            { src: "/images/hero-dessert.jpg", title: "تشكيلة المناسبات والاحتفالات الملكية", tag: "الأكثر طلباً ★", sub: "مخبوزة طازجة اليوم بحرفية فندقية" },
            { src: "/placeholders/cake-1.jpg", title: "تورتات الشوكولاتة والتوت البري الفاخرة", tag: "تورتات فاخرة 🎂", sub: "شوكولاتة بلجيكية 70% وزبدة نيوزيلندية" },
            { src: "/placeholders/cupcake-1.jpg", title: "كب كيك الفراولة والفانيليا الفرنسية", tag: "طازج يومياً 🍓", sub: "قوام مخملي هش وخفيف" },
            { src: "/placeholders/gateau-1.jpg", title: "قطع الجاتوه وحلويات النخبة الفاخرة", tag: "حلويات النخبة ✨", sub: "مثالية للمناسبات وتجمعات العائلة" },
          ]);
        }
      }

      if (settingsMap["cake_slides"]) {
        try {
          const parsed = JSON.parse(settingsMap["cake_slides"]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCakeSlidesAdmin(parsed);
          }
        } catch {}
      } else {
        const storedCake = localStorage.getItem("store_cake_slides");
        if (storedCake) {
          try { setCakeSlidesAdmin(JSON.parse(storedCake)); } catch {}
        } else {
          setCakeSlidesAdmin([
            { src: "/images/custom-cake-hero.jpg", title: "تورتة زفاف ملكية 3 أدوار", flavor: "فانيليا مدغشقر وتوت أحمر", tiers: "3 أدوار فاخرة" },
            { src: "/placeholders/cake-1.jpg", title: "تورتة شوكولاتة بلجيكية وتوت بري", flavor: "شوكولاتة داكنة 70% وجناش كريمي", tiers: "دورين مناسبات" },
            { src: "/placeholders/cake-2.jpg", title: "تورتة احتفالات مبهجة بالورد الطبيعي", flavor: "ريد فيلفيت وكريمة الجبن الإيطالية", tiers: "تصميم خاص بالطلب" },
          ]);
        }
      }
    } catch {}
  }, []);

  const handleAddHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideSrc.trim() || !newSlideTitle.trim()) {
      showToast("يرجى إدخال رابط الصورة وعنوان الشريحة", "error");
      return;
    }
    const updated = [...heroSlidesAdmin, {
      src: newSlideSrc.trim(),
      title: newSlideTitle.trim(),
      tag: newSlideTag.trim() || "مميز ★",
      sub: newSlideSub.trim() || "مخبوزة طازجة اليوم",
    }];
    setHeroSlidesAdmin(updated);
    localStorage.setItem("store_hero_slides", JSON.stringify(updated));
    try {
      await updateStoreSetting("hero_slides", JSON.stringify(updated));
      showToast("تم حفظ شريحة الهيرو في قاعدة البيانات السحابية وتطبيقها بنجاح! 🖼️");
    } catch {
      showToast("تم حفظ شريحة الهيرو بنجاح! 🖼️");
    }
    setNewSlideSrc("");
    setNewSlideTitle("");
  };

  const handleDeleteHeroSlide = async (idx: number) => {
    const updated = heroSlidesAdmin.filter((_, i) => i !== idx);
    setHeroSlidesAdmin(updated);
    localStorage.setItem("store_hero_slides", JSON.stringify(updated));
    try {
      await updateStoreSetting("hero_slides", JSON.stringify(updated));
      showToast("تم حذف شريحة الهيرو وتحديث قاعدة البيانات بنجاح 🗑️");
    } catch {
      showToast("تم حذف شريحة الهيرو بنجاح 🗑️");
    }
  };

  const handleAddCakeSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCakeSrc.trim() || !newCakeTitle.trim()) {
      showToast("يرجى إدخال رابط الصورة وعنوان تورتة العرض", "error");
      return;
    }
    const updated = [...cakeSlidesAdmin, {
      src: newCakeSrc.trim(),
      title: newCakeTitle.trim(),
      flavor: newCakeFlavor.trim() || "مكونات طبيعية فاخرة",
      tiers: newCakeTiers.trim() || "تورتة مخصصة 3D",
    }];
    setCakeSlidesAdmin(updated);
    localStorage.setItem("store_cake_slides", JSON.stringify(updated));
    try {
      await updateStoreSetting("cake_slides", JSON.stringify(updated));
      showToast("تم حفظ تورتة العرض في قاعدة البيانات وتطبيقها بنجاح! 🎂");
    } catch {
      showToast("تمت إضافة شريحة التورتة بنجاح! 🎂");
    }
    setNewCakeSrc("");
    setNewCakeTitle("");
    setNewCakeFlavor("");
  };

  const handleDeleteCakeSlide = async (idx: number) => {
    const updated = cakeSlidesAdmin.filter((_, i) => i !== idx);
    setCakeSlidesAdmin(updated);
    localStorage.setItem("store_cake_slides", JSON.stringify(updated));
    try {
      await updateStoreSetting("cake_slides", JSON.stringify(updated));
      showToast("تم حذف شريحة التورتة وتحديث قاعدة البيانات بنجاح 🗑️");
    } catch {
      showToast("تم حذف شريحة التورتة بنجاح 🗑️");
    }
  };

  // Order Accept & Reject Handlers (USER REQUEST: قبول الطلب ورفض الطلب مع سبب الرفض)
  const handleAcceptOrder = async (order: OrderResponseDto) => {
    try {
      const updated = await updateOrderStatus(order.id, "CONFIRMED", "تم قبول واعتماد الطلب من قبل الإدارة وجاري التجهيز فوراً");
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      showToast(`تم قبول الطلب #${order.publicOrderNumber} وتأكيده بنجاح! 🎉`);

      // WhatsApp customer notification alert
      const rawPhone = order.customerPhone || "";
      const phoneClean = rawPhone.replace(/\D/g, "");
      const finalPhone = phoneClean.startsWith("01") ? "2" + phoneClean : phoneClean;
      const acceptMsg = `مرحباً بك عميلنا العزيز ${order.customerName} 🌸، يسعدنا إعلامك بأنه تم قبول وتأكيد طلبكم رقم #${order.publicOrderNumber} من لولو كب كيك بنجاح! 🧁 جاري الآن تحضير الحلويات بكل حب وإتقان. شكراً لاختياركم لولو كب كيك.`;

      setRescheduleNotificationPrompt({
        phone: finalPhone,
        message: acceptMsg,
        orderNum: order.publicOrderNumber,
      });
      refreshMetrics();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل قبول الطلب", "error");
    }
  };

  const handleConfirmRejectOrder = async () => {
    if (!rejectingOrder) return;
    setRejectSubmitting(true);
    try {
      const updated = await updateOrderStatus(rejectingOrder.id, "REJECTED", rejectReason);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      showToast(`تم رفض الطلب #${rejectingOrder.publicOrderNumber} وتسجيل سبب الرفض.`, "error");

      // WhatsApp customer notification alert
      const rawPhone = rejectingOrder.customerPhone || "";
      const phoneClean = rawPhone.replace(/\D/g, "");
      const finalPhone = phoneClean.startsWith("01") ? "2" + phoneClean : phoneClean;
      const rejectMsg = `عميلنا العزيز ${rejectingOrder.customerName} 🌸، نعتذر منكم لتعذر تنفيذ طلبكم رقم #${rejectingOrder.publicOrderNumber} للسبب التالي: (${rejectReason}). يسعدنا دائماً خدمتكم في أي وقت آخر أو استقبال استفساراتكم عبر واتساب.`;

      setRescheduleNotificationPrompt({
        phone: finalPhone,
        message: rejectMsg,
        orderNum: rejectingOrder.publicOrderNumber,
      });
      setRejectingOrder(null);
      refreshMetrics();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل رفض الطلب", "error");
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Loyalty Settings Handler
  const handleSaveLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreSetting("loyalty_points_per_egp", loyaltyPointsPerEgp);
      await updateStoreSetting("loyalty_egp_per_point", loyaltyEgpPerPoint);
      showToast("تم حفظ وتحديث قواعد برنامج نقاط الولاء والمكافآت بنجاح! 💎");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حفظ إعدادات نقاط الولاء", "error");
    }
  };

  // Order status transition handler
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus) return;
    try {
      const updated = await updateOrderStatus(selectedOrder.id, newOrderStatus, orderStatusNote || undefined);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedOrder(null);
      setNewOrderStatus("");
      setOrderStatusNote("");
      refreshMetrics();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل تحديث حالة الطلب");
    }
  };

  // Payment approval/rejection handlers
  const handleApprovePayment = async (paymentId: string) => {
    const note = prompt("ملاحظة اعتماد الدفع (اختياري):", "تم التحقق من مطابقة الإيصال وتأكيد السداد");
    if (note === null) return;
    try {
      await approvePayment(paymentId, note);
      setPayments(payments.filter((p) => p.id !== paymentId));
      refreshMetrics();
      alert("تم اعتماد السداد بنجاح وتحديث حالة الطلب!");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل اعتماد السداد");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const note = prompt("سبب رفض الإيصال *:", "بيانات التحويل غير مطابقة أو لم يصل المبلغ");
    if (!note) return;
    try {
      await rejectPayment(paymentId, note);
      setPayments(payments.filter((p) => p.id !== paymentId));
      refreshMetrics();
      alert("تم رفض إيصال السداد وتسجيل الملاحظة.");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل رفض الإيصال");
    }
  };

  // Custom cake quote submission
  const handleSubmitCakeQuote = async () => {
    if (!selectedCake) return;
    try {
      const updated = await submitAdminQuote(selectedCake.id, {
        quotedPrice: parseFloat(quotePrice),
        termsAndDetails: quoteTerms,
        expiresInHours: quoteHours,
      });
      setCakes(cakes.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCake(null);
      refreshMetrics();
      alert("تم إرسال عرض السعر للعميل بنجاح!");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "فشل إرسال عرض السعر");
    }
  };

  // Store setting update handler with Interactive Toast & Button State
  const handleSaveSetting = async (key: string) => {
    const val = editingSettings[key] ?? "";
    setSavingSettingKey(key);
    try {
      await updateStoreSetting(key, val);
      // Synchronize counterpart keys
      if (key === "store_phone") {
        await updateStoreSetting("contact_phone", val).catch(() => {});
      } else if (key === "contact_phone") {
        await updateStoreSetting("store_phone", val).catch(() => {});
      } else if (key === "store_manager_whatsapp") {
        const cleanDigits = val.replace(/\D/g, "");
        const formatted = cleanDigits.startsWith("01") ? "2" + cleanDigits : cleanDigits;
        await updateStoreSetting("contact_whatsapp", formatted).catch(() => {});
      }
      showToast(`تم حفظ وتطبيق "${key}" بنجاح في كامل النظام! ✨`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حفظ الإعداد", "error");
    } finally {
      setSavingSettingKey(null);
    }
  };

  // Bulk save all store settings
  const handleSaveAllStoreSettings = async () => {
    setSavingSettingKey("ALL");
    try {
      const keys = Object.keys(editingSettings);
      for (const k of keys) {
        await updateStoreSetting(k, editingSettings[k]);
      }
      if (editingSettings["store_phone"]) {
        await updateStoreSetting("contact_phone", editingSettings["store_phone"]).catch(() => {});
      }
      if (editingSettings["store_manager_whatsapp"]) {
        const clean = editingSettings["store_manager_whatsapp"].replace(/\D/g, "");
        const formatted = clean.startsWith("01") ? "2" + clean : clean;
        await updateStoreSetting("contact_whatsapp", formatted).catch(() => {});
      }
      showToast("تم حفظ واعتماد كافة إعدادات المتجر وبيانات التواصل بنجاح! ✨");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حفظ جميع الإعدادات", "error");
    } finally {
      setSavingSettingKey(null);
    }
  };

  // Logo handlers
  const handleSaveLogoUrl = async () => {
    if (!logoInputUrl.trim()) return;
    try {
      await updateStoreSetting("store_logo_url", logoInputUrl.trim());
      localStorage.setItem("store_logo_url", logoInputUrl.trim());
      setCurrentLogo(logoInputUrl.trim());
      showToast("تم تحديث وحفظ شعار المتجر بنجاح! 🎨");
    } catch {
      localStorage.setItem("store_logo_url", logoInputUrl.trim());
      setCurrentLogo(logoInputUrl.trim());
      showToast("تم حفظ الشعار في المتصفح بنجاح! 🎨");
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCurrentLogo(result);
          setLogoInputUrl(result);
          localStorage.setItem("store_logo_url", result);
          try {
            await updateStoreSetting("store_logo_url", result);
          } catch {}
          showToast("تم رفع وتطبيق الشعار الجديد بنجاح! 🎨");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr || !newCatSlug) {
      showToast("يرجى ملء اسم التصنيف والرابط اللطيف", "error");
      return;
    }
    setCategorySubmitting(true);
    try {
      const req: CreateCategoryRequest = {
        nameAr: newCatNameAr,
        nameEn: newCatNameEn || newCatSlug,
        slug: newCatSlug,
        displayOrder: newCatOrder,
        isActive: true,
      };
      await createAdminCategory(req);
      showToast(`تم إضافة التصنيف "${newCatNameAr}" بنجاح! 📁`);
      setNewCatNameAr("");
      setNewCatNameEn("");
      setNewCatSlug("");
      loadCatalogData();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل إضافة التصنيف", "error");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Edit & Delete Category Handlers (USER REQUEST: Full CRUD)
  const handleStartEditCategory = (c: CategoryDto) => {
    setEditingCategory(c);
    setEditCatNameAr(c.nameAr);
    setEditCatNameEn(c.nameEn || c.slug);
    setEditCatSlug(c.slug);
    setEditCatOrder(c.displayOrder ?? 1);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditCatSubmitting(true);
    try {
      const updated = await updateAdminCategory(editingCategory.id, {
        nameAr: editCatNameAr,
        nameEn: editCatNameEn,
        slug: editCatSlug,
        displayOrder: editCatOrder,
      });
      setCatalogCategories(catalogCategories.map((c) => c.id === updated.id ? updated : c));
      setEditingCategory(null);
      showToast(`تم تحديث التصنيف "${editCatNameAr}" بنجاح ✨`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تحديث التصنيف", "error");
    } finally {
      setEditCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف التصنيف "${categoryName}"؟ سيتم إزالته نهائياً.`)) return;
    try {
      await deleteAdminCategory(categoryId);
      setCatalogCategories(catalogCategories.filter((c) => c.id !== categoryId));
      showToast(`تم حذف التصنيف "${categoryName}" بنجاح 🗑️`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حذف التصنيف", "error");
    }
  };

  // Create Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameAr || !newProdSlug || !newProdCategoryId) {
      showToast("يرجى تحديد التصنيف واسم الصنف والرابط اللطيف", "error");
      return;
    }
    setProductSubmitting(true);
    try {
      const req: CreateProductRequest = {
        categoryId: newProdCategoryId,
        nameAr: newProdNameAr,
        nameEn: newProdNameEn || newProdSlug,
        slug: newProdSlug,
        descriptionAr: newProdDescAr,
        productType: newProdType,
        sellingUnit: newProdSellingUnit,
        basePrice: Number(newProdPrice),
        prepLeadHours: Number(newProdLeadHours),
        stockQuantity: Number(newProdStock),
        isPreOrder: newProdIsPreOrder,
        isActive: true,
        isFeatured: newProdIsFeatured,
        isCustomizable: true,
        primaryImageUrl: newProdImageUrl || undefined,
      };
      await createAdminProduct(req);
      showToast(`تمت إضافة الصنف "${newProdNameAr}" إلى المتجر بنجاح! 🧁`);
      setNewProdNameAr("");
      setNewProdNameEn("");
      setNewProdSlug("");
      setNewProdDescAr("");
      setNewProdImageUrl("");
      loadCatalogData();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل إضافة الصنف", "error");
    } finally {
      setProductSubmitting(false);
    }
  };

  // Edit & Delete Product Handlers (USER REQUEST: Full CRUD)
  const handleStartEditProduct = (p: ProductDto) => {
    setEditingProduct(p);
    setEditProdNameAr(p.nameAr);
    setEditProdNameEn(p.nameEn || p.slug);
    setEditProdPrice(p.basePrice);
    setEditProdStock(p.stockQuantity ?? 15);
    setEditProdIsPreOrder(p.isPreOrder ?? false);
    setEditProdLeadHours(p.leadTimeHours ?? 2);
    setEditProdDescAr(p.descriptionAr || "");
    setEditProdIsFeatured(p.isFeatured ?? false);
    setEditProdImageUrl(p.primaryImageUrl || "");
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditProdSubmitting(true);
    try {
      const updated = await updateAdminProduct(editingProduct.id, {
        nameAr: editProdNameAr,
        nameEn: editProdNameEn,
        slug: editingProduct.slug,
        categoryId: editingProduct.categoryId,
        basePrice: Number(editProdPrice),
        stockQuantity: Number(editProdStock),
        isPreOrder: editProdIsPreOrder,
        prepLeadHours: Number(editProdLeadHours),
        descriptionAr: editProdDescAr,
        isFeatured: editProdIsFeatured,
        primaryImageUrl: editProdImageUrl || undefined,
      });
      setCatalogProducts(catalogProducts.map((p) => p.id === updated.id ? updated : p));
      setEditingProduct(null);
      showToast(`تم تحديث الصنف "${editProdNameAr}" بنجاح ✨`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تحديث الصنف", "error");
    } finally {
      setEditProdSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الصنف "${productName}" نهائياً من المتجر؟`)) return;
    try {
      await deleteAdminProduct(productId);
      setCatalogProducts(catalogProducts.filter((p) => p.id !== productId));
      showToast(`تم حذف الصنف "${productName}" بنجاح 🗑️`);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل حذف الصنف", "error");
    }
  };

  // Toggle Product Status Handler
  const handleToggleProductStatus = async (productId: string) => {
    try {
      await toggleAdminProductStatus(productId);
      setCatalogProducts(catalogProducts.map((p) => {
        if (p.id === productId) {
          return { ...p, isActive: !p.isActive };
        }
        return p;
      }));
      showToast("تم تحديث حالة تفعيل الصنف بنجاح ✨");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "فشل تغيير حالة المنتج", "error");
    }
  };

  // Admin Authentication Gate: Strict Access Control
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc]" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">جاري التحقق من صلاحيات المسؤول...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl border border-rose-100 text-center space-y-6">
          <div className="flex justify-center">
            <BrandLogo size="lg" showText={false} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">بوابة إدارة النظام • Admin Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              هذه المنطقة مخصصة حصرياً لمدير متجر Lolo Cupcakes
            </p>
          </div>

          {isLoggedIn && !user?.isAdmin ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold space-y-3 text-right">
              <p>
                أنت مسجل حالياً بحساب عميل: <span className="font-black text-slate-900">{user?.email || user?.fullName}</span>.
              </p>
              <p className="text-slate-600">
                هذا الحساب لا يملك صلاحيات المسؤول (Admin). يرجى تسجيل الخروج وتسجيل الدخول ببيانات مدير النظام.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition shadow-sm"
                >
                  تسجيل الخروج والتبديل
                </button>
                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition"
                >
                  المتجر
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAdminLoginLoading(true);
                setAdminLoginError(null);
                try {
                  await login(adminLoginEmail.trim(), adminLoginPassword);
                } catch (err: unknown) {
                  const error = err as Error;
                  setAdminLoginError(error.message || "فشل تسجيل الدخول كمسؤول");
                } finally {
                  setAdminLoginLoading(false);
                }
              }}
              className="space-y-4 text-right text-xs"
            >
              {adminLoginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {adminLoginError}
                </div>
              )}
              <div>
                <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني للإدارة:</label>
                <input
                  type="text"
                  required
                  value={adminLoginEmail}
                  onChange={(e) => setAdminLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">كلمة المرور:</label>
                <input
                  type="password"
                  required
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  placeholder="كلمة مرور المسؤول..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoginLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs transition shadow-md disabled:opacity-50"
              >
                {adminLoginLoading ? "جاري التحقق والدخول..." : "دخول لوحة التحكم الإدارية ✨"}
              </button>

              <div className="text-center pt-2">
                <Link href="/" className="text-slate-400 hover:text-slate-600 text-xs font-bold transition">
                  ← العودة إلى الصفحة الرئيسية للمتجر
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 flex flex-col lg:flex-row" dir="rtl">
      
      {/* Right Sidebar (RTL) - Luxury Enterprise Navigation */}
      <aside className={`w-full lg:w-72 bg-white/95 backdrop-blur-xl border-l border-rose-100 flex flex-col shrink-0 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto transition-all duration-300 z-40 shadow-sm ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"}`}>
        
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-rose-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <BrandLogo size="sm" showText={!sidebarCollapsed} href="/admin" />
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-rose-50 transition"
            title={sidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="p-3.5 space-y-5 flex-1 overflow-y-auto text-xs">
          
          {/* Group 1: Operations */}
          <div>
            {!sidebarCollapsed && <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">العمليات والطلبات</p>}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("METRICS")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "METRICS"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="المؤشرات والعمليات"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>المؤشرات والتشغيل</span>}
              </button>

              <button
                onClick={() => setActiveTab("ORDERS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "ORDERS"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="إدارة الطلبات"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>إدارة الطلبات</span>}
                </div>
                {metrics && metrics.pendingOrdersCount > 0 && !sidebarCollapsed && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "ORDERS" ? "bg-white text-rose-600" : "bg-amber-100 text-amber-800"
                  }`}>
                    {metrics.pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("PAYMENTS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "PAYMENTS"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="مراجعة المدفوعات"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>مراجعة المدفوعات</span>}
                </div>
                {metrics && metrics.pendingPaymentsCount > 0 && !sidebarCollapsed && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "PAYMENTS" ? "bg-white text-rose-600" : "bg-rose-500 text-white"
                  }`}>
                    {metrics.pendingPaymentsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("CAKES")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "CAKES"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="عروض التورتات الخاصة"
              >
                <Cake className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>طلبات التورتات الخاصة</span>}
              </button>

              <button
                onClick={() => setActiveTab("CUSTOMERS")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "CUSTOMERS"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="إدارة العملاء والمستخدمين المسجلين"
              >
                <Users className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>العملاء والمستخدمين 👥</span>}
              </button>
            </div>
          </div>

          {/* Group 2: Catalog */}
          <div>
            {!sidebarCollapsed && <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">الكتالوج والمنتجات</p>}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("CATALOG")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "CATALOG"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="إدارة الأصناف والمنتجات"
              >
                <Layers className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>الأصناف والمنتجات ✨</span>}
              </button>

              <button
                onClick={() => setActiveTab("CATEGORIES")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "CATEGORIES"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="تصنيفات المتجر"
              >
                <FolderPlus className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>تصنيفات المتجر</span>}
              </button>
            </div>
          </div>

          {/* Group 3: Logistics & Customization */}
          <div>
            {!sidebarCollapsed && <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">التوصيل والتسويق</p>}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("ZONES")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "ZONES"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 font-black"
                    : "text-slate-600 hover:bg-sky-50/70 hover:text-slate-900"
                }`}
                title="مناطق وأسعار التوصيل"
              >
                <MapPin className="w-4 h-4 shrink-0 text-sky-500" />
                {!sidebarCollapsed && <span>مناطق وأسعار التوصيل</span>}
              </button>

              <button
                onClick={() => setActiveTab("COUPONS")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "COUPONS"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200 font-black"
                    : "text-slate-600 hover:bg-purple-50/70 hover:text-slate-900"
                }`}
                title="كوبونات الخصم والعروض"
              >
                <Ticket className="w-4 h-4 shrink-0 text-purple-500" />
                {!sidebarCollapsed && <span>كوبونات الخصم والعروض 🏷️</span>}
              </button>

              <button
                onClick={() => setActiveTab("SLIDERS")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "SLIDERS"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                }`}
                title="سلايدر وصور الصفحة الرئيسية"
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>سلايدر وصور المتجر</span>}
              </button>

              <button
                onClick={() => setActiveTab("LOYALTY")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "LOYALTY"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 font-black"
                    : "text-slate-600 hover:bg-amber-50/70 hover:text-slate-900"
                }`}
                title="نقاط المكافآت والولاء"
              >
                <Coins className="w-4 h-4 shrink-0 text-amber-500" />
                {!sidebarCollapsed && <span>برنامج نقاط المكافآت</span>}
              </button>

              <button
                onClick={() => setActiveTab("REVIEWS")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                  activeTab === "REVIEWS"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-200 font-black"
                    : "text-slate-600 hover:bg-amber-50/70 hover:text-slate-900"
                }`}
                title="آراء وتقييمات العملاء"
              >
                <Star className="w-4 h-4 shrink-0 text-amber-500" />
                {!sidebarCollapsed && <span>آراء العملاء والريفيوهات ⭐</span>}
              </button>
            </div>
          </div>

          {/* Group 4: Settings */}
          <div>
            {!sidebarCollapsed && <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">النظام والهوية</p>}
            <button
              onClick={() => setActiveTab("SETTINGS")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold transition-all text-right ${
                activeTab === "SETTINGS"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 font-black"
                  : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
              }`}
              title="إعدادات المتجر والشعار"
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>إعدادات المتجر والشعار</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-rose-100/80 bg-rose-50/30">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-white border border-rose-200 text-xs font-black text-rose-600 hover:bg-rose-50 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>زيارة واجهة المتجر 🌐</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        
        {/* Top Workspace Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-rose-100/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>لوحة التحكم المركزية • نظام التشغيل الفندقي</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === "METRICS" && "المؤشرات والعمليات التشغيلية"}
              {activeTab === "ORDERS" && "إدارة وتأكيد وتتبع الطلبات"}
              {activeTab === "CATALOG" && "إدارة الأصناف والمنتجات والأسعار"}
              {activeTab === "CATEGORIES" && "إدارة تصنيفات المتجر والأقسام"}
              {activeTab === "ZONES" && "إدارة مناطق التوصيل والرسوم والحد الأدنى"}
              {activeTab === "COUPONS" && "إدارة كوبونات الخصم وقسائم العروض 🏷️"}
              {activeTab === "PAYMENTS" && "مراجعة واعتماد إيصالات الدفع والتحويل"}
              {activeTab === "SLIDERS" && "تخصيص سلايدر وبنرات الصفحة الرئيسية"}
              {activeTab === "LOYALTY" && "إعدادات وقواعد برنامج نقاط المكافآت والولاء"}
              {activeTab === "CAKES" && "طلبات التورتات المخصصة وعروض الأسعار"}
              {activeTab === "CUSTOMERS" && "إدارة العملاء والمستخدمين المسجلين 👥"}
              {activeTab === "SETTINGS" && "إعدادات المتجر والشعار وأرقام التواصل"}
              {activeTab === "REVIEWS" && "إدارة آراء وتقييمات العملاء المعروضة ⭐"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تحكم شامل بكافة بيانات وتشغيل متجر لولو كب كيك بالقاهرة
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {/* Audio chime toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playJoyfulChime();
                showToast(next ? "تم تفعيل التنبيهات الصوتية 🔔" : "تم كتم التنبيهات الصوتية 🔕");
              }}
              className={`p-2.5 rounded-2xl border transition shadow-sm flex items-center gap-1.5 text-xs font-bold ${
                soundEnabled 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" 
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
              title={soundEnabled ? "كتم التنبيه الصوتي" : "تفعيل التنبيه الصوتي عند وصول طلبات"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden md:inline">{soundEnabled ? "التنبيهات مفعلة" : "التنبيهات مكتومة"}</span>
            </button>

            {/* Admin identity badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700">{user?.fullName || "المسؤول"}</span>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-rose-500 hover:text-rose-700 font-bold mr-1 underline"
              >
                خروج
              </button>
            </div>

            <button
              onClick={refreshMetrics}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-black text-rose-700 hover:bg-rose-100 transition shadow-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${metricsLoading || loading ? "animate-spin" : ""}`} />
              <span>تحديث البيانات</span>
            </button>
          </div>
        </div>

        {/* Global Success Notification */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-rose-600 font-bold py-1 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
            <span>جاري تحديث البيانات من السيرفر...</span>
          </div>
        )}

      {/* Tab 1: Metrics Overview */}
      {activeTab === "METRICS" && (
        <div className="space-y-8">
          {metricsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-3xl border border-rose-100 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-500 block">طلبات اليوم</span>
                <span className="text-3xl font-black text-slate-900">{metrics?.todayOrdersCount || 0}</span>
                <span className="text-[11px] text-slate-400 block">من إجمالي {metrics?.totalOrdersCount || 0} طلب مسجل</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-amber-700 block">طلبات قيد المراجعة</span>
                <span className="text-3xl font-black text-amber-800">{metrics?.pendingOrdersCount || 0}</span>
                <span className="text-[11px] text-slate-400 block">بانتظار التأكيد أو الدفع</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-blue-700 block">مدفوعات تنتظر التحقق</span>
                <span className="text-3xl font-black text-blue-800">{metrics?.pendingPaymentsCount || 0}</span>
                <span className="text-[11px] text-slate-400 block">إيصالات مرفوعة للدراسة</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-emerald-700 block">مبيعات اليوم المؤكدة</span>
                <span className="text-2xl font-black text-emerald-800">
                  {metrics?.todaySalesEgp ? metrics.todaySalesEgp.toFixed(2) : "0.00"} <span className="text-xs font-bold">ج.م</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  إجمالي المبيعات: {metrics?.totalSalesEgp ? metrics.totalSalesEgp.toFixed(2) : "0.00"} ج.م
                </span>
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900">أحدث الطلبات المسجلة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-500">
                    <th className="py-3 px-4 font-bold">رقم الطلب</th>
                    <th className="py-3 px-4 font-bold">طريقة الاستلام</th>
                    <th className="py-3 px-4 font-bold">التاريخ والموعد</th>
                    <th className="py-3 px-4 font-bold">الإجمالي</th>
                    <th className="py-3 px-4 font-bold">حالة الطلب</th>
                    <th className="py-3 px-4 font-bold">حالة الدفع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {metrics?.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-rose-50/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.publicOrderNumber}</td>
                      <td className="py-3 px-4">{o.fulfillmentTypeLabelAr}</td>
                      <td className="py-3 px-4">{o.scheduledForDate} ({o.scheduledForTimeRange})</td>
                      <td className="py-3 px-4 font-bold text-rose-600">{o.totalAmount.toFixed(2)} ج.م</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {o.orderStatusLabelAr}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {o.paymentStatusLabelAr}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kitchen Slots & Daily Capacity Monitor */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">مراقبة طاقة المطبخ اليومية والفترات المجدولة (Kitchen Capacity)</h3>
                  <p className="text-xs text-slate-500">متابعة دقيقة للأماكن المحجوزة والمتبقية لكل فترة لمنع التزاحم أو التأخير</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={slotFilterDate}
                  onChange={(e) => setSlotFilterDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {kitchenSlots.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">لا توجد فترات مجدولة مسجلة لهذا التاريخ</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kitchenSlots.map((slot) => {
                  const percent = Math.min(100, Math.round((slot.reservedCount / (slot.maxCapacity || 1)) * 100));
                  const timeLabel = slot.timeRangeDisplay || slot.timeDisplay || `${slot.startTime} - ${slot.endTime}`;
                  return (
                    <div key={slot.id} className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-pink-500" />
                          <span>{timeLabel}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slot.remainingCapacity === 0 
                            ? "bg-red-100 text-red-700" 
                            : slot.remainingCapacity <= 2 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {slot.remainingCapacity === 0 ? "مكتمل 100%" : `${slot.remainingCapacity} أماكن شاغرة`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percent >= 100 ? "bg-red-500" : percent >= 75 ? "bg-amber-500" : "bg-emerald-500"
                          }`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>محجوز حالياً: {slot.reservedCount} طلب</span>
                        <span>السعة المتاحة: {slot.maxCapacity} طلب</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Delivery Reminders Dispatcher (الشيف والعملاء) */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-rose-50 p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    مركز إرسال التذكيرات الذكية اليومية (الشيف والعملاء عبر واتساب 📲)
                  </h3>
                  <p className="text-xs text-slate-500">
                    إرسال خطة تشغيل المطبخ والتجهيز اليومية للشيف، وتذكير العملاء بمواعيد استلام وتوصيل طلباتهم
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={remindersDate}
                  onChange={(e) => setRemindersDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-sky-200 text-xs font-bold text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={() => loadDailyReminders(remindersDate)}
                  disabled={remindersLoading}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-black hover:brightness-105 transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${remindersLoading ? "animate-spin" : ""}`} />
                  <span>{remindersLoading ? "جاري الجلب..." : "عرض تذكيرات التاريخ"}</span>
                </button>
              </div>
            </div>

            {remindersData ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-sky-200 shadow-sm">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      إجمالي الطلبات المستحقة ليوم {remindersData.targetDate}: {remindersData.totalOrdersDue} طلب
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      جاهز لإرسال خطة التشغيل للشيف وتنبيهات الاستلام للعملاء
                    </span>
                  </div>

                  {(() => {
                    const rawChef = editingSettings["store_manager_whatsapp"] || 
                      settings.find((s) => s.key === "store_manager_whatsapp")?.value || 
                      "01069915609";
                    const cleanChef = rawChef.replace(/\D/g, "");
                    const targetChef = cleanChef.startsWith("01") ? "2" + cleanChef : (cleanChef.startsWith("1") ? "20" + cleanChef : cleanChef);
                    return (
                      <a
                        href={`https://wa.me/${targetChef || "201069915609"}?text=${encodeURIComponent(remindersData.chefWhatsAppMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow flex items-center gap-2 self-start sm:self-auto hover-jelly transition"
                      >
                        <span>👨‍🍳 إرسال خطة التشغيل للشيف ({rawChef})</span>
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    );
                  })()}
                </div>

                {remindersData.customerReminders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">لا توجد طلبات مستحقة لهذا التاريخ</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-sky-100 text-slate-500 bg-sky-50/50">
                          <th className="py-2.5 px-3 font-bold">رقم الطلب</th>
                          <th className="py-2.5 px-3 font-bold">اسم العميل</th>
                          <th className="py-2.5 px-3 font-bold">الهاتف</th>
                          <th className="py-2.5 px-3 font-bold">طريقة الاستلام والموعد</th>
                          <th className="py-2.5 px-3 font-bold text-center">إشعار العميل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {remindersData.customerReminders.map((c) => {
                          const cleanPhone = c.customerPhone.replace(/\D/g, "");
                          const finalPhone = cleanPhone.startsWith("01") ? "2" + cleanPhone : cleanPhone;
                          return (
                            <tr key={c.orderId} className="hover:bg-white/80 transition">
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">#{c.publicOrderNumber}</td>
                              <td className="py-3 px-3 font-bold text-slate-800">{c.customerName}</td>
                              <td className="py-3 px-3 font-mono text-slate-600">{c.customerPhone}</td>
                              <td className="py-3 px-3">{c.fulfillmentType === "DELIVERY" ? "توصيل" : "استلام فرع"} ({c.timeRange})</td>
                              <td className="py-3 px-3 text-center">
                                <a
                                  href={`https://wa.me/${finalPhone}?text=${encodeURIComponent(c.customerWhatsAppMessage)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 transition"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>تذكير واتساب</span>
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/70 border border-dashed border-sky-200 text-center space-y-2">
                <Clock className="w-8 h-8 text-sky-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">اضغط على زر &quot;عرض تذكيرات التاريخ&quot; لاستخراج خطة التشغيل اليومية وتنبيهات العملاء</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Catalog & Categories Management (NEW USER FEATURE) */}
      {activeTab === "CATALOG" && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Quick Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-rose-glow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                الكتالوج الحي • Real-time Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">إدارة الأصناف والتصنيفات الديناميكية</h2>
              <p className="text-xs text-white/90">أضف تصنيفات جديدة وأصناف حلويات فوراً لتظهر في صفحة المتجر لجميع العملاء</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="#add-product" 
                className="px-5 py-2.5 rounded-2xl bg-white text-rose-600 text-xs font-black hover:bg-rose-50 transition shadow-sm"
              >
                + إضافة صنف جديد
              </a>
              <a 
                href="#add-category" 
                className="px-5 py-2.5 rounded-2xl bg-white/20 text-white border border-white/30 text-xs font-black hover:bg-white/30 transition"
              >
                + إضافة تصنيف
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add Category Form (Column 1) */}
            <div id="add-category" className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <FolderPlus className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-base text-slate-900">إضافة تصنيف جديد</h3>
              </div>
              <p className="text-xs text-slate-500">أنشئ تصنيفاً جديداً مثل: كب كيك، كيك ومناسبات، حلويات شرقية...</p>

              <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم التصنيف (بالعربية) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كب كيك فاخر"
                    value={newCatNameAr}
                    onChange={(e) => {
                      setNewCatNameAr(e.target.value);
                      if (!newCatSlug) {
                        setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم التصنيف (بالإنجليزية):</label>
                  <input
                    type="text"
                    placeholder="Signature Cupcakes"
                    value={newCatNameEn}
                    onChange={(e) => setNewCatNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرابط اللطيف (Slug) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="signature-cupcakes"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ترتيب الظهور:</label>
                  <input
                    type="number"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={categorySubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>{categorySubmitting ? "جاري الإضافة..." : "حفظ التصنيف الجديد"}</span>
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="pt-4 border-t border-rose-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">التصنيفات الحالية ({catalogCategories.length}):</span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {catalogCategories.map((c) => (
                    <span key={c.id} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                      {c.nameAr}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Product Form (Column 2 & 3) */}
            <div id="add-product" className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <Plus className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-base text-slate-900">إضافة صنف / حلوى جديدة للمتجر</h3>
              </div>
              <p className="text-xs text-slate-500">أدخل تفاصيل الحلوى أو الكب كيك والسعر الأساسي لتبدأ باستقبال الطلبات عليها فوراً</p>

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Category Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اختر التصنيف *:</label>
                  <select
                    required
                    value={newProdCategoryId}
                    onChange={(e) => setNewProdCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 bg-white"
                  >
                    <option value="">-- اضغط لاختيار التصنيف --</option>
                    {catalogCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} ({c.nameEn || c.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Type */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع المنتج *:</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as CreateProductRequest["productType"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 bg-white"
                  >
                    <option value="CUPCAKE">كب كيك (CUPCAKE)</option>
                    <option value="CAKE">كيك وتورتات (CAKE)</option>
                    <option value="GATEAU">جاتوه (GATEAU)</option>
                    <option value="BOX">بوكس حلويات مشكل (BOX)</option>
                    <option value="ORIENTAL">حلويات شرقية (ORIENTAL)</option>
                    <option value="WESTERN">حلويات غربية (WESTERN)</option>
                    <option value="CUSTOM">كيك مخصص (CUSTOM)</option>
                  </select>
                </div>

                {/* Name Ar */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الصنف (بالعربية) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كب كيك لوتس فانيلا كرانش"
                    value={newProdNameAr}
                    onChange={(e) => {
                      setNewProdNameAr(e.target.value);
                      if (!newProdSlug) {
                        setNewProdSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                {/* Name En */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الصنف (بالإنجليزية):</label>
                  <input
                    type="text"
                    placeholder="Lotus Vanilla Crunch Cupcake"
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرابط اللطيف (Slug) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="lotus-vanilla-crunch"
                    value={newProdSlug}
                    onChange={(e) => setNewProdSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-[11px]"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر الأساسي (ج.م EGP) *:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-black text-rose-600 text-sm"
                  />
                </div>

                {/* Selling Unit */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">وحدة البيع *:</label>
                  <select
                    value={newProdSellingUnit}
                    onChange={(e) => setNewProdSellingUnit(e.target.value as CreateProductRequest["sellingUnit"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 bg-white"
                  >
                    <option value="PIECE">بالقطعة (PIECE)</option>
                    <option value="BOX">بالعلبة / البوكس (BOX)</option>
                    <option value="WEIGHT">بالوزن / كجم (WEIGHT)</option>
                    <option value="CONFIGURABLE">حسب التخصيص (CONFIGURABLE)</option>
                  </select>
                </div>

                {/* Lead Hours */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">فترة التجهيز المسبق (بالساعات):</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdLeadHours}
                    onChange={(e) => setNewProdLeadHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكمية الجاهزة بالستوك (Stock):</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                {/* Availability Mode Toggle */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">حالة التوفر والتسليم:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewProdIsPreOrder(false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        !newProdIsPreOrder
                          ? "bg-sky-50 text-sky-800 border-sky-400 font-black shadow-sm"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <span>⚡ متوفر في الستوك (تسليم فوري)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdIsPreOrder(true)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        newProdIsPreOrder
                          ? "bg-rose-50 text-rose-800 border-rose-400 font-black shadow-sm"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <span>🕒 حجز مسبق (تحضير طازج بالطلب)</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">الوصف والمكونات (بالعربية):</label>
                  <textarea
                    rows={2}
                    placeholder="كيك إسفنجي هش محشو بكريمة اللوتس ومزين بقطع البسكويت الذهبية..."
                    value={newProdDescAr}
                    onChange={(e) => setNewProdDescAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>

                {/* Product Image URL & Presets (USER REQUEST: Full image control) */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block text-xs">صورة الصنف الأساسية (رابط مباشر أو اختيار جاهز) 🖼️:</label>
                    <span className="text-[10px] text-pink-600 font-bold">تحكم كامل للأدمن</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://... أو مسار الصورة أو ارفع من جهازك مباشرة"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-[11px]"
                    />
                    <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1.5 shrink-0 transition">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingProdImage ? "جاري الرفع..." : "رفع من الجهاز 📁"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProdImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingProdImage(true);
                          try {
                            const res = await uploadImageFile(file);
                            setNewProdImageUrl(res);
                            showToast("تم رفع صورة المنتج بنجاح! 📸");
                          } catch (err: unknown) {
                            const error = err as Error;
                            showToast(error.message || "فشل رفع الصورة", "error");
                          } finally {
                            setUploadingProdImage(false);
                          }
                        }}
                      />
                    </label>
                    {newProdImageUrl && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-rose-200 relative shrink-0">
                        <Image src={newProdImageUrl} alt="معاينة" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400 font-bold self-center">صور جاهزة:</span>
                    {[
                      { label: "🧁 كب كيك فراولة", url: "/placeholders/cupcake-1.jpg" },
                      { label: "🍫 كب كيك شوكولاتة", url: "/placeholders/cupcake-2.jpg" },
                      { label: "🎂 تورتة شوكولاتة", url: "/placeholders/cake-1.jpg" },
                      { label: "🍓 تورتة توت أحمر", url: "/placeholders/cake-2.jpg" },
                      { label: "🍰 جاتوه فاخر", url: "/placeholders/gateau-1.jpg" },
                      { label: "🎁 بوكس حلويات", url: "/placeholders/box-1.jpg" },
                    ].map((pre) => (
                      <button
                        key={pre.url}
                        type="button"
                        onClick={() => setNewProdImageUrl(pre.url)}
                        className={`px-2.5 py-1 rounded-lg border font-bold transition ${
                          newProdImageUrl === pre.url 
                            ? "bg-rose-500 text-white border-rose-500 shadow-xs" 
                            : "bg-white text-slate-600 border-rose-100 hover:bg-rose-50"
                        }`}
                      >
                        {pre.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkbox Featured */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newProdIsFeatured}
                      onChange={(e) => setNewProdIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span className="font-bold text-slate-700">تمييز الصنف في الصفحة الرئيسية كأكثر مبيعاً ⭐</span>
                  </label>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={productSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-sm shadow-rose-glow hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{productSubmitting ? "جاري الحفظ..." : "إضافة الصنف وتفعيله فوراً في المتجر"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* n8n Status Alert */}
          {n8nStatusMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold animate-in fade-in flex items-center justify-between ${
              n8nStatusMsg.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm" 
                : "bg-red-50 text-red-800 border-red-300"
            }`}>
              <span>{n8nStatusMsg.text}</span>
              <button onClick={() => setN8nStatusMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Current Products Inventory Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900">أصناف المتجر الحالية ({catalogProducts.length})</h3>
                <p className="text-xs text-slate-500">تحكم بالستوك والتوفر ونشر المنتجات تلقائياً على صفحة فيسبوك عبر n8n</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <select
                  value={catalogFilterCategory}
                  onChange={(e) => setCatalogFilterCategory(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="">جميع التصنيفات</option>
                  {catalogCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="بحث سريع بالاسم..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-500 bg-rose-50/40">
                    <th className="py-3 px-4 font-bold">الصورة</th>
                    <th className="py-3 px-4 font-bold">اسم الصنف</th>
                    <th className="py-3 px-4 font-bold">التصنيف</th>
                    <th className="py-3 px-4 font-bold">السعر</th>
                    <th className="py-3 px-4 font-bold">الستوك والتوفر</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold text-center">أتمتة فيسبوك (n8n)</th>
                    <th className="py-3 px-4 font-bold text-center">الحالة</th>
                    <th className="py-3 px-4 font-bold text-center">إدارة الصنف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {catalogProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-rose-50/30 transition">
                      <td className="py-2.5 px-4">
                        <div className="w-12 h-12 rounded-xl border border-rose-200 overflow-hidden relative bg-rose-50/50 flex items-center justify-center shrink-0 shadow-xs">
                          {p.primaryImageUrl ? (
                            <Image src={p.primaryImageUrl} alt={p.nameAr} fill className="object-cover" />
                          ) : (
                            <span className="text-xl">🧁</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.nameAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {catalogCategories.find((c) => c.id === p.categoryId)?.nameAr || "حلويات"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        {p.basePrice.toFixed(2)} ج.م
                      </td>
                      <td className="py-3.5 px-4">
                        {p.isPreOrder ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            🕒 حجز مسبق ({p.leadTimeHours || 4} س)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
                            ⚡ ستوك ({p.stockQuantity ?? 15} قطعة)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.isActive !== false ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {p.isActive !== false ? "نشط" : "معطل"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={publishingN8nId === p.id}
                          onClick={() => handlePublishToN8n(p.id, p.nameAr)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-[11px] hover:brightness-105 transition shadow-sm inline-flex items-center gap-1.5"
                          title="إرسال الصنف للروبوت لنشره فوراً على صفحة الفيسبوك"
                        >
                          <Share2 className={`w-3.5 h-3.5 ${publishingN8nId === p.id ? "animate-spin" : ""}`} />
                          <span>{publishingN8nId === p.id ? "جاري..." : "نشر فيسبوك"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleProductStatus(p.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 mx-auto ${
                            p.isActive !== false 
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200" 
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {p.isActive !== false ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5 text-rose-600" />
                              <span>تعطيل</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />
                              <span>تفعيل</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(p)}
                            className="p-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition shadow-sm"
                            title="تعديل بيانات وسعر الصنف"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.nameAr)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                            title="حذف الصنف نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current Categories Inventory & Management Table (USER REQUEST: Full CRUD) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">أقسام وتصنيفات المتجر الحالية ({catalogCategories.length})</h3>
                <p className="text-xs text-slate-500">يمكنك تعديل أسماء الأقسام، ترتيب الظهور، أو حذف أي تصنيف</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-500 bg-rose-50/40">
                    <th className="py-3 px-4 font-bold">اسم التصنيف بالعربية</th>
                    <th className="py-3 px-4 font-bold">الاسم بالإنجليزية</th>
                    <th className="py-3 px-4 font-bold">الرابط اللطيف (Slug)</th>
                    <th className="py-3 px-4 font-bold">الترتيب</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {catalogCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-rose-50/30 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.nameAr}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{c.nameEn || "—"}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{c.slug}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{c.displayOrder ?? 1}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(c)}
                            className="p-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition shadow-sm"
                            title="تعديل التصنيف"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.nameAr)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                            title="حذف التصنيف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Product Modal (USER REQUEST: Full CRUD) */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl border border-rose-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-sky-600" />
                    <span>تعديل الصنف: {editingProduct.nameAr}</span>
                  </h4>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">اسم الصنف بالعربية:</label>
                      <input
                        type="text"
                        value={editProdNameAr}
                        onChange={(e) => setEditProdNameAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الاسم بالإنجليزية:</label>
                      <input
                        type="text"
                        value={editProdNameEn}
                        onChange={(e) => setEditProdNameEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">السعر الأساسي (ج.م):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editProdPrice}
                        onChange={(e) => setEditProdPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-black text-rose-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الكمية المتاحة في الستوك:</label>
                      <input
                        type="number"
                        value={editProdStock}
                        onChange={(e) => setEditProdStock(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ساعات التجهيز المسبق (Lead Time):</label>
                      <input
                        type="number"
                        value={editProdLeadHours}
                        onChange={(e) => setEditProdLeadHours(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editProdIsPreOrder}
                          onChange={(e) => setEditProdIsPreOrder(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500"
                        />
                        <span className="font-bold text-slate-700">يتطلب حجز مسبق</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editProdIsFeatured}
                          onChange={(e) => setEditProdIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500"
                        />
                        <span className="font-bold text-slate-700">أكثر مبيعاً ⭐</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الوصف والمكونات:</label>
                    <textarea
                      rows={2}
                      value={editProdDescAr}
                      onChange={(e) => setEditProdDescAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                    />
                  </div>

                  {/* Product Image URL & Presets in Edit Modal */}
                  <div className="space-y-2 pt-2 border-t border-rose-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block text-xs">صورة الصنف الأساسية (تغيير الصورة بحرية) 🖼️:</label>
                      <span className="text-[10px] text-sky-600 font-bold">تحديث فوري بالمتجر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://... أو مسار الصورة أو ارفع من جهازك مباشرة"
                        value={editProdImageUrl}
                        onChange={(e) => setEditProdImageUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono text-[11px]"
                      />
                      <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center gap-1.5 shrink-0 transition">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingEditProdImage ? "جاري الرفع..." : "رفع من الجهاز 📁"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingEditProdImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingEditProdImage(true);
                            try {
                              const res = await uploadImageFile(file);
                              setEditProdImageUrl(res);
                              showToast("تم رفع صورة المنتج بنجاح! 📸");
                            } catch (err: unknown) {
                              const error = err as Error;
                              showToast(error.message || "فشل رفع الصورة", "error");
                            } finally {
                              setUploadingEditProdImage(false);
                            }
                          }}
                        />
                      </label>
                      {editProdImageUrl && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-rose-200 relative shrink-0">
                          <Image src={editProdImageUrl} alt="معاينة" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                      <span className="text-slate-400 font-bold self-center">صور جاهزة:</span>
                      {[
                        { label: "🧁 كب كيك فراولة", url: "/placeholders/cupcake-1.jpg" },
                        { label: "🍫 كب كيك شوكولاتة", url: "/placeholders/cupcake-2.jpg" },
                        { label: "🎂 تورتة شوكولاتة", url: "/placeholders/cake-1.jpg" },
                        { label: "🍓 تورتة توت أحمر", url: "/placeholders/cake-2.jpg" },
                        { label: "🍰 جاتوه فاخر", url: "/placeholders/gateau-1.jpg" },
                        { label: "🎁 بوكس حلويات", url: "/placeholders/box-1.jpg" },
                      ].map((pre) => (
                        <button
                          key={pre.url}
                          type="button"
                          onClick={() => setEditProdImageUrl(pre.url)}
                          className={`px-2.5 py-1 rounded-lg border font-bold transition ${
                            editProdImageUrl === pre.url 
                              ? "bg-sky-500 text-white border-sky-500 shadow-xs" 
                              : "bg-white text-slate-600 border-rose-100 hover:bg-rose-50"
                          }`}
                        >
                          {pre.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={editProdSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-md hover:brightness-105 transition"
                    >
                      {editProdSubmitting ? "جاري الحفظ..." : "حفظ التعديلات ✨"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Category Modal (USER REQUEST: Full CRUD) */}
          {editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-200">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-sky-600" />
                    <span>تعديل التصنيف: {editingCategory.nameAr}</span>
                  </h4>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم التصنيف بالعربية:</label>
                    <input
                      type="text"
                      value={editCatNameAr}
                      onChange={(e) => setEditCatNameAr(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الاسم بالإنجليزية:</label>
                    <input
                      type="text"
                      value={editCatNameEn}
                      onChange={(e) => setEditCatNameEn(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الرابط اللطيف (Slug):</label>
                    <input
                      type="text"
                      value={editCatSlug}
                      onChange={(e) => setEditCatSlug(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-mono text-slate-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ترتيب العرض:</label>
                    <input
                      type="number"
                      value={editCatOrder}
                      onChange={(e) => setEditCatOrder(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 font-bold text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={editCatSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-md hover:brightness-105 transition"
                    >
                      {editCatSubmitting ? "جاري الحفظ..." : "حفظ التعديل ✨"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === "ORDERS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">قائمة طلبات المتجر</h3>
              <p className="text-xs text-slate-500">قبول الطلبات فوراً، أو الرفض مع تسجيل السبب وإشعار العميل، وتعديل المواعيد</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={exportOrdersToCsv}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                title="تصدير جميع الطلبات إلى ملف إكسل CSV"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الطلبات (CSV/Excel) 📥</span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، الهاتف، أو الاسم..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="pr-9 pl-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 bg-white min-w-[220px]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="">جميع الحالات</option>
                <option value="PENDING">قيد المراجعة (PENDING)</option>
                <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
                <option value="PREPARING">قيد التحضير (PREPARING)</option>
                <option value="READY">جاهز للاستلام/التوصيل (READY)</option>
                <option value="OUT_FOR_DELIVERY">خرج للتوصيل (OUT_FOR_DELIVERY)</option>
                <option value="COMPLETED">مكتمل (COMPLETED)</option>
                <option value="CANCELLED">ملغي (CANCELLED)</option>
                <option value="REJECTED">مرفوض (REJECTED)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-rose-500 text-white text-[11px]">
                    <th className="py-3.5 px-4 font-bold">رقم الطلب</th>
                    <th className="py-3.5 px-4 font-bold">العميل والهاتف</th>
                    <th className="py-3.5 px-4 font-bold">طريقة وموعد الاستلام</th>
                    <th className="py-3.5 px-4 font-bold">طريقة الدفع</th>
                    <th className="py-3.5 px-4 font-bold">المبلغ</th>
                    <th className="py-3.5 px-4 font-bold">حالة الطلب</th>
                    <th className="py-3.5 px-4 font-bold">حالة الدفع</th>
                    <th className="py-3.5 px-4 font-bold text-center">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {orders
                    .filter((o) => {
                      if (!orderSearchQuery.trim()) return true;
                      const q = orderSearchQuery.toLowerCase().trim();
                      return (
                        o.publicOrderNumber?.toLowerCase().includes(q) ||
                        o.customerPhone?.includes(q) ||
                        o.customerName?.toLowerCase().includes(q)
                      );
                    })
                    .map((o) => {
                      const payMethodLabel = 
                        o.paymentMethodLabelAr || 
                        (o.paymentMethod === "MANUAL_TRANSFER" ? "تحويل إلكتروني" : 
                         o.paymentMethod === "CASH" ? "الدفع عند الاستلام" : (o.paymentMethod || "الدفع عند الاستلام"));

                      return (
                      <tr key={o.id} className="hover:bg-rose-50/40 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-slate-900 block">#{o.publicOrderNumber}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString("ar-EG") : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{o.customerName || "عميل المتجر"}</span>
                            {o.customerId || o.isGuest === false ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                👤 مسجل
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                🛒 زائر
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-500 text-[11px] block" dir="ltr">{o.customerPhone || "—"}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">{o.fulfillmentTypeLabelAr}</span>
                          <span className="text-[11px] text-slate-500 block">{o.scheduledForDate} ({o.scheduledForTimeRange})</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            o.paymentMethod === "MANUAL_TRANSFER" ? "bg-purple-50 text-purple-800 border border-purple-200" : "bg-slate-100 text-slate-700"
                          }`}>
                            {payMethodLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-rose-600">{o.totalAmount.toFixed(2)} ج.م</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            o.orderStatus === "CONFIRMED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            o.orderStatus === "REJECTED" ? "bg-red-50 text-red-800 border border-red-200" :
                            o.orderStatus === "PENDING" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                            "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {o.orderStatusLabelAr}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {o.paymentStatusLabelAr}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Full Details Modal Button (USER REQUEST: بيانات العميل كاملة) */}
                            <button
                              type="button"
                              onClick={() => setInspectingOrder(o)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-black transition flex items-center gap-1 shadow-2xs"
                              title="عرض كافة بيانات العميل والطلب"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>التفاصيل 👁️</span>
                            </button>

                            {/* Quick Accept Button */}
                            {o.orderStatus === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => handleAcceptOrder(o)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black hover:bg-emerald-700 transition shadow flex items-center gap-1"
                                title="قبول واعتماد الطلب فوراً"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>قبول ✅</span>
                              </button>
                            )}

                            {/* Quick Reject Button */}
                            {(o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingOrder(o);
                                  setRejectReason("نعتذر لتعذر تنفيذ الطلب نظراً لعدم توفر المكونات المطلوبة اليوم");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-[11px] font-black transition flex items-center gap-1"
                                title="رفض الطلب مع ذكر السبب"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>رفض ❌</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(o);
                                setNewOrderStatus(o.orderStatus);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition shadow-sm"
                            >
                              الحالة
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(o)}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 text-[11px] font-bold transition flex items-center gap-1"
                              title="تعديل موعد الاستلام وإشعار العميل"
                            >
                              <Calendar className="w-3 h-3 text-sky-600" />
                              <span>تعديل الموعد</span>
                            </button>
                            <a
                              href={`https://wa.me/${o.customerPhone ? (o.customerPhone.replace(/\D/g, "").startsWith("01") ? "2" + o.customerPhone.replace(/\D/g, "") : o.customerPhone.replace(/\D/g, "")) : "201099887766"}?text=${encodeURIComponent(
                                `مرحباً ${o.customerName}، بخصوص طلبكم من لولو كب كيك رقم #${o.publicOrderNumber}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                              title="تواصل سريع عبر واتساب"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-base text-slate-900">
                  تحديث حالة الطلب #{selectedOrder.publicOrderNumber}
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الحالة الجديدة *:</label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 font-bold"
                    >
                      <option value="CONFIRMED">تأكيد الطلب (CONFIRMED)</option>
                      <option value="PREPARING">بدء التجهيز في المطبخ (PREPARING)</option>
                      <option value="READY">جاهز للاستلام/التوصيل (READY)</option>
                      <option value="OUT_FOR_DELIVERY">خرج للتوصيل مع المندوب (OUT_FOR_DELIVERY)</option>
                      <option value="COMPLETED">تم التسليم بنجاح (COMPLETED)</option>
                      <option value="CANCELLED">إلغاء الطلب (CANCELLED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ملاحظة التغيير (تظهر في سجل التدقيق):</label>
                    <input
                      type="text"
                      placeholder="مثال: تم تجهيز الطلب بالكامل"
                      value={orderStatusNote}
                      onChange={(e) => setOrderStatusNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-100 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUpdateOrderStatus}
                    className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow"
                  >
                    حفظ التغيير
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Order Modal & Automated Customer WhatsApp Alert */}
          {rescheduleModalOpen && reschedulingOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sky-200 space-y-5 animate-in fade-in">
                <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      تعديل موعد تسليم الطلب #{reschedulingOrder.publicOrderNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      العميل: {reschedulingOrder.customerName} ({reschedulingOrder.customerPhone})
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    الموعد الحالي: {reschedulingOrder.scheduledForDate}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">اختر التاريخ الجديد للتسليم *</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">اختر الفترة الزمنية المتاحة لليوم الجديد *</label>
                    {rescheduleSlots.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">جاري تحميل الفترات أو لا توجد فترات متاحة لهذا التاريخ</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {rescheduleSlots.map((slot) => {
                          const isSel = selectedRescheduleSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedRescheduleSlotId(slot.id)}
                              className={`p-2.5 rounded-xl border text-right transition ${
                                isSel
                                  ? "bg-sky-500 text-white border-sky-500 font-bold shadow-sm"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-sky-50"
                              }`}
                            >
                              <span className="block text-xs">{slot.timeDisplay}</span>
                              <span className={`text-[10px] ${isSel ? "text-sky-100" : "text-slate-400"}`}>
                                {slot.remainingCapacity} أماكن متاحة
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">سبب التعديل أو ملاحظة داخلية (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: رغبة العميل في التأجيل لمساء الغد..."
                      value={rescheduleNote}
                      onChange={(e) => setRescheduleNote(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {/* WhatsApp Notification Alert Prompt */}
                {rescheduleNotificationPrompt && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-black text-xs">تم تحديث موعد الطلب في قاعدة البيانات بنجاح!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      اضغط على الزر أدناه لإرسال رسالة واتساب تلقائية جاهزة للعميل بالموعد الجديد:
                    </p>
                    <a
                      href={`https://wa.me/${rescheduleNotificationPrompt.phone}?text=${encodeURIComponent(
                        rescheduleNotificationPrompt.message
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition shadow flex items-center justify-center gap-2"
                    >
                      <span>📲 إشعار العميل بالموعد الجديد عبر واتساب الآن</span>
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRescheduleModalOpen(false);
                      setReschedulingOrder(null);
                      setRescheduleNotificationPrompt(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-100 transition"
                  >
                    إغلاق
                  </button>
                  <button
                    disabled={rescheduleSubmitting}
                    onClick={handleExecuteReschedule}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold hover:brightness-105 transition shadow"
                  >
                    {rescheduleSubmitting ? "جاري التحديث..." : "حفظ الموعد الجديد"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Order Modal (USER REQUEST: رفض الطلب مع سبب الرفض وإشعار العميل) */}
          {rejectingOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-red-100 pb-3">
                  <h3 className="font-black text-base text-red-700 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>رفض الطلب #{rejectingOrder.publicOrderNumber}</span>
                  </h3>
                  <button onClick={() => setRejectingOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">العميل: {rejectingOrder.customerName} ({rejectingOrder.customerPhone})</p>
                  <p className="text-[11px] text-slate-400">سيتم تغيير حالة الطلب إلى (مرفوض REJECTED) وإشعار العميل بالسبب الموضح أدناه:</p>
                </div>

                <div>
                  <label className="font-black text-xs text-slate-700 block mb-1.5">سبب الرفض والاعتذار للعميل *:</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-red-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="مثال: نعتذر لعدم توفر المكونات الطازجة لهذا الصنف اليوم..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRejectingOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-100 transition"
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    disabled={rejectSubmitting || !rejectReason.trim()}
                    onClick={handleConfirmRejectOrder}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{rejectSubmitting ? "جاري الرفض..." : "تأكيد رفض الطلب ❌"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Customer & Order Details Modal (USER REQUEST: بيانات العميل لما يجيلي الطلب) */}
          {inspectingOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-rose-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900">
                        تفاصيل الطلب #{inspectingOrder.publicOrderNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        تاريخ الطلب: {inspectingOrder.createdAt ? new Date(inspectingOrder.createdAt).toLocaleString("ar-EG") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="طباعة الفاتورة"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectingOrder(null)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-slate-600 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status Badges Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">حالة الطلب</span>
                    <span className="text-xs font-black text-slate-900">{inspectingOrder.orderStatusLabelAr || inspectingOrder.orderStatus}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">حالة السداد</span>
                    <span className="text-xs font-black text-slate-900">{inspectingOrder.paymentStatusLabelAr || inspectingOrder.paymentStatus}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">طريقة الاستلام</span>
                    <span className="text-xs font-black text-slate-900">{inspectingOrder.fulfillmentTypeLabelAr || inspectingOrder.fulfillmentType}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">الموعد المحدد</span>
                    <span className="text-xs font-black text-slate-900">{inspectingOrder.scheduledForDate}</span>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="bg-gradient-to-br from-pink-50/50 via-white to-sky-50/50 p-5 rounded-2xl border border-pink-100 space-y-3">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2 border-b border-pink-100/60 pb-2">
                    <UserCheck className="w-4 h-4 text-pink-500" />
                    <span>بيانات العميل والتوصيل الكاملة</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold text-[11px]">اسم العميل:</span>
                      <span className="font-black text-slate-900 text-sm">{inspectingOrder.customerName || "—"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-bold text-[11px]">رقم الهاتف:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900" dir="ltr">{inspectingOrder.customerPhone || "—"}</span>
                        {inspectingOrder.customerPhone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${inspectingOrder.customerPhone}`}
                              className="p-1 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition"
                              title="اتصال هاتفياً"
                            >
                              <PhoneCall className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/${inspectingOrder.customerPhone.replace(/\D/g, "").startsWith("01") ? "2" + inspectingOrder.customerPhone.replace(/\D/g, "") : inspectingOrder.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `مرحباً ${inspectingOrder.customerName}، بخصوص طلبكم من متجر لولو كب كيك رقم #${inspectingOrder.publicOrderNumber}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                              title="محادثة واتساب"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block font-bold text-[11px] mb-1">عنوان التوصيل المعتمد وإحداثيات GPS:</span>
                      {(() => {
                        let parsed: any = null;
                        if (inspectingOrder.deliveryAddressSnapshot) {
                          try {
                            parsed = JSON.parse(inspectingOrder.deliveryAddressSnapshot);
                          } catch {}
                        }
                        const mapsUrl = parsed?.mapsUrl || 
                          (parsed?.latitude && parsed?.longitude ? `https://maps.google.com/?q=${parsed.latitude},${parsed.longitude}` : null) ||
                          (inspectingOrder.customerNotes?.match(/https:\/\/maps\.google\.com\/\?q=[0-9.,-]+/)?.[0] ?? null);

                        return (
                          <div className="space-y-2">
                            {parsed && typeof parsed === "object" ? (
                              <div className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                                {parsed.streetAddress && <p>📍 الشارع / العنوان: <span className="font-black text-slate-900">{parsed.streetAddress}</span></p>}
                                {parsed.buildingNumber && <p>🏢 رقم العمارة: <span className="font-black text-slate-900">{parsed.buildingNumber}</span></p>}
                                {parsed.floorDoor && <p>🚪 الدور والشقة: <span className="font-black text-slate-900">{parsed.floorDoor}</span></p>}
                                {parsed.landmark && <p>🏛️ علامة مميزة: <span className="font-black text-slate-900">{parsed.landmark}</span></p>}
                              </div>
                            ) : (
                              <span className="font-bold text-slate-800 leading-relaxed block bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                {inspectingOrder.deliveryAddressSnapshot || "استلام من الفرع"}
                              </span>
                            )}

                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>فتح موقع العميل على خرائط جوجل (GPS مباشر للمندوب) 🗺️</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {inspectingOrder.customerNotes && (
                      <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
                        <span className="text-[11px] font-black block mb-0.5">ملاحظات العميل الخاصة:</span>
                        <p className="text-xs font-medium leading-relaxed">{inspectingOrder.customerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Order Items Table */}
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <Cake className="w-4 h-4 text-pink-500" />
                    <span>عناصر وأصناف الطلب ({inspectingOrder.items?.length || 0})</span>
                  </h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                          <th className="py-2.5 px-3 font-bold">الصنف</th>
                          <th className="py-2.5 px-3 font-bold text-center">الكمية</th>
                          <th className="py-2.5 px-3 font-bold">سعر الوحدة</th>
                          <th className="py-2.5 px-3 font-bold">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectingOrder.items && inspectingOrder.items.length > 0 ? (
                          inspectingOrder.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 block">{item.productNameAr || item.productName}</span>
                                {(item.optionsSnapshot || item.options) && (
                                  <span className="text-[10px] text-slate-500 block font-medium">
                                    {item.optionsSnapshot || item.options}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {item.unitPrice.toFixed(2)} ج.م
                              </td>
                              <td className="py-2.5 px-3 font-bold text-pink-600">
                                {item.lineTotal.toFixed(2)} ج.م
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                              إجمالي الطلب: {inspectingOrder.totalAmount.toFixed(2)} ج.م
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي للأصناف:</span>
                    <span className="font-bold font-mono">{((inspectingOrder.subtotal || inspectingOrder.totalAmount) - (inspectingOrder.deliveryFee || 0) + (inspectingOrder.discountAmount || 0)).toFixed(2)} ج.م</span>
                  </div>
                  {inspectingOrder.discountAmount && inspectingOrder.discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>الخصم المطبق (كوبون):</span>
                      <span className="font-mono">-{inspectingOrder.discountAmount.toFixed(2)} ج.م</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم التوصيل:</span>
                    <span className="font-bold font-mono">{inspectingOrder.deliveryFee ? `${inspectingOrder.deliveryFee.toFixed(2)} ج.م` : "مجاناً"}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                    <span>الإجمالي المستحق:</span>
                    <span className="text-pink-600 font-mono">{inspectingOrder.totalAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>طريقة السداد المعتمدة:</span>
                    <span className="font-bold text-slate-800">
                      {inspectingOrder.paymentMethodLabelAr || (inspectingOrder.paymentMethod === "MANUAL_TRANSFER" ? "تحويل إلكتروني / إنستاباي / فودافون كاش" : "الدفع عند الاستلام")}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    {inspectingOrder.orderStatus === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAcceptOrder(inspectingOrder);
                          setInspectingOrder(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>قبول الطلب فوراً ✅</span>
                      </button>
                    )}
                    {(inspectingOrder.orderStatus === "PENDING" || inspectingOrder.orderStatus === "CONFIRMED") && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingOrder(inspectingOrder);
                          setInspectingOrder(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition"
                      >
                        رفض الطلب ❌
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(inspectingOrder);
                        setNewOrderStatus(inspectingOrder.orderStatus);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      تغيير الحالة
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectingOrder(null)}
                      className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Payments Verification */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">مراجعة إيصالات التحويل البنكي وإنستاباي</h3>
              <p className="text-xs text-slate-500">رفع العميل للإيصال لا يعني السداد حتى يقوم المشرف باعتماده</p>
            </div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="">جميع الحالات</option>
              <option value="PENDING_VERIFICATION">بانتظار التحقق (PENDING_VERIFICATION)</option>
              <option value="VERIFIED">معتمد ومؤكد (VERIFIED)</option>
              <option value="REJECTED">مرفوض (REJECTED)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payments.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-rose-100 p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">لا توجد مدفوعات معلقة بهذه الحالة</p>
              </div>
            ) : (
              payments.map((p) => {
                const isVerified = p.status === "VERIFIED";
                const isRejected = p.status === "REJECTED";
                const statusLabel = isVerified ? "معتمد ومؤكد" : isRejected ? "مرفوض" : "بانتظار التحقق";
                const methodLabel = 
                  p.paymentMethod === "MANUAL_TRANSFER" ? "تحويل إلكتروني (فودافون كاش / إنستاباي)" :
                  p.paymentMethod === "INSTAPAY" ? "إنستاباي (InstaPay)" : 
                  p.paymentMethod === "VODAFONE_CASH" ? "فودافون كاش" : 
                  p.paymentMethod === "BANK_TRANSFER" ? "تحويل بنكي" : 
                  p.paymentMethod === "CASH" ? "الدفع نقداً عند الاستلام" :
                  p.paymentMethod || "الدفع عند الاستلام";
                const firstProof = p.proofs && p.proofs.length > 0 ? p.proofs[0] : null;

                return (
                  <div key={p.id} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-800">
                        عملية #{p.id.slice(0, 8)} (طلب #{p.orderId ? p.orderId.slice(0, 8) : "—"})
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isVerified ? "bg-emerald-50 text-emerald-800" : isRejected ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs border-y border-rose-100 py-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">المبلغ المطلوب:</span>
                        <span className="font-bold text-rose-600">{p.amount.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">طريقة التحويل:</span>
                        <span className="font-bold text-slate-700">{methodLabel}</span>
                      </div>
                      {p.paymentReference && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">مرجع المحول / الرقم:</span>
                          <span className="font-mono font-bold text-slate-800">{p.paymentReference}</span>
                        </div>
                      )}
                      {firstProof && (
                        <div className="pt-2">
                          <a
                            href={`${API_BASE_URL}/admin/payments/proofs/${firstProof.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-rose-600 font-bold underline inline-flex items-center gap-1 hover:text-rose-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة إيصال التحويل المرفوع ({firstProof.originalFilename})</span>
                          </a>
                        </div>
                      )}
                    </div>

                  {p.status === "PENDING_VERIFICATION" && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleRejectPayment(p.id)}
                        className="flex-1 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition"
                      >
                        رفض الإيصال
                      </button>
                      <button
                        onClick={() => handleApprovePayment(p.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow"
                      >
                        اعتماد وتأكيد الدفع
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>
      )}

      {/* Tab 5: Custom Cake Quotes */}
      {activeTab === "CAKES" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-bold text-lg text-slate-900">طلبات التورتات الخاصة وعروض الأسعار</h3>
            <select
              value={cakeStatusFilter}
              onChange={(e) => setCakeStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="">جميع الحالات</option>
              <option value="SUBMITTED">بانتظار التسعير (SUBMITTED)</option>
              <option value="QUOTED">تم إرسال العرض (QUOTED)</option>
              <option value="ACCEPTED">مقبول (ACCEPTED)</option>
              <option value="DECLINED">مرفوض (DECLINED)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cakes.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900">{c.publicReference}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {c.statusLabelAr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-rose-100 py-3">
                  <div>
                    <span className="text-slate-400 block">العميل:</span>
                    <span className="font-bold text-slate-800">{c.customerName} ({c.customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تاريخ المناسبة:</span>
                    <span className="font-bold text-slate-800">{c.requestedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">الأفراد:</span>
                    <span className="font-bold text-slate-800">{c.servingsNeeded || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">النكهة:</span>
                    <span className="font-bold text-slate-800">{c.flavorPreference || "—"}</span>
                  </div>
                  {c.hasReferenceImage && (
                    <div className="col-span-2 pt-1">
                      <a
                        href={`${API_BASE_URL}/admin/custom-cake-requests/${c.id}/reference-image`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-rose-600 font-bold underline inline-flex items-center gap-1 hover:text-rose-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة الصورة المرجعية المرفقة من العميل</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Submit quote button */}
                <button
                  onClick={() => setSelectedCake(c)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow"
                >
                  {c.quotes.length > 0 ? "تقديم عرض سعر إضافي / محدث" : "دراسة الطلب وتقديم عرض سعر"}
                </button>
              </div>
            ))}
          </div>

          {/* Quote Modal */}
          {selectedCake && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-base text-slate-900">
                  إرسال عرض سعر لطلب {selectedCake.publicReference}
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">السعر المعروض (EGP) *:</label>
                    <input
                      type="number"
                      step="10"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الشروط والتفاصيل الفنية للتورتة *:</label>
                    <textarea
                      rows={3}
                      value={quoteTerms}
                      onChange={(e) => setQuoteTerms(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">مدة صلاحية العرض (بالساعات):</label>
                    <input
                      type="number"
                      value={quoteHours}
                      onChange={(e) => setQuoteHours(parseInt(e.target.value) || 24)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedCake(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-100 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmitCakeQuote}
                    className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow"
                  >
                    إرسال عرض السعر
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Registered Customers Management (USER REQUEST: إدارة العملاء والمستخدمين) */}
      {activeTab === "CUSTOMERS" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-200 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">إجمالي العملاء المسجلين</p>
                <h4 className="text-2xl font-black text-slate-900">{customers.length} عميل</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">إجمالي طلبات المسجلين</p>
                <h4 className="text-2xl font-black text-emerald-600">
                  {customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0)} طلب
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-black shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">إنفاق العملاء الإجمالي</p>
                <h4 className="text-2xl font-black text-purple-700">
                  {customers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0).toFixed(2)} ج.م
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-black shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">مسؤولي النظام (Admins)</p>
                <h4 className="text-2xl font-black text-sky-700">
                  {customers.filter((c) => c.isAdmin).length} مسؤول
                </h4>
              </div>
            </div>
          </div>

          {/* Customers Table and Filter */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  <span>دليل العملاء والمستخدمين المسجلين</span>
                </h3>
                <p className="text-xs text-slate-500">
                  عرض كامل لبيانات الحسابات، أرقام الهواتف، العناوين، وعدد الطلبات مع إمكانية التواصل الفوري عبر واتساب
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="بحث بالاسم، الهاتف، أو الإيميل..."
                    className="w-full sm:w-72 pr-9 pl-3 py-2 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomersLoading(true);
                    getAdminCustomers()
                      .then(setCustomers)
                      .catch(() => setCustomers([]))
                      .finally(() => setCustomersLoading(false));
                  }}
                  className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  title="تحديث قائمة العملاء"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${customersLoading ? "animate-spin" : ""}`} />
                  <span>تحديث</span>
                </button>
              </div>
            </div>

            {/* Table */}
            {customersLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm font-bold flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-rose-400" />
                <span>جاري تحميل بيانات العملاء...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm font-bold">
                لا يوجد عملاء مسجلين حالياً.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-rose-50/50 text-slate-700 border-b border-rose-100">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">العميل / الحساب</th>
                      <th className="py-3.5 px-4 font-bold">البريد الإلكتروني</th>
                      <th className="py-3.5 px-4 font-bold">رقم الهاتف</th>
                      <th className="py-3.5 px-4 font-bold">العنوان المسجل</th>
                      <th className="py-3.5 px-4 font-bold text-center">عدد الطلبات</th>
                      <th className="py-3.5 px-4 font-bold">إجمالي المشتريات</th>
                      <th className="py-3.5 px-4 font-bold">الصلاحية</th>
                      <th className="py-3.5 px-4 font-bold">تاريخ التسجيل</th>
                      <th className="py-3.5 px-4 font-bold text-center">تواصل فوري</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {customers
                      .filter((c) => {
                        if (!customerSearch.trim()) return true;
                        const q = customerSearch.toLowerCase().trim();
                        return (
                          c.fullName?.toLowerCase().includes(q) ||
                          c.phone?.includes(q) ||
                          c.email?.toLowerCase().includes(q) ||
                          c.address?.toLowerCase().includes(q)
                        );
                      })
                      .map((c) => {
                        const cleanPhone = c.phone?.replace(/\D/g, "") || "";
                        const waPhone = cleanPhone.startsWith("01") ? `2${cleanPhone}` : cleanPhone;

                        return (
                          <tr key={c.id} className="hover:bg-rose-50/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                {c.avatarUrl ? (
                                  <img
                                    src={c.avatarUrl}
                                    alt={c.fullName}
                                    className="w-9 h-9 rounded-full object-cover border border-rose-200 shadow-2xs shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                                    {c.fullName ? c.fullName.charAt(0).toUpperCase() : "👤"}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-900 block">{c.fullName || "بدون اسم"}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {c.email || "—"}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-800 font-bold" dir="ltr">
                              {c.phone || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={c.address || "لا يوجد عنوان مسجل"}>
                              {c.address || <span className="text-slate-400 italic">غير محدد</span>}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">
                                {c.totalOrders} طلب
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-rose-600">
                              {Number(c.totalSpent || 0).toFixed(2)} ج.م
                            </td>
                            <td className="py-3.5 px-4">
                              {c.isAdmin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 w-fit">
                                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                                  <span>مدير 👑</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 w-fit">
                                  عميل 👤
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString("ar-EG") : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {cleanPhone ? (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `أهلاً بك ${c.fullName || "عميلنا العزيز"} من لولو كب كيك 🧁 يسعدنا تواصلكم معنا!`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition shadow-2xs text-[11px]"
                                  title="مراسلة العميل مباشرة على واتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>واتساب</span>
                                </a>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Categories Management (USER REQUEST: Full CRUD) */}
      {activeTab === "CATEGORIES" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-5">
            <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-rose-500" />
                  <span>إضافة تصنيف جديد للمتجر</span>
                </h3>
                <p className="text-xs text-slate-500">أنشئ تصنيفاً جديداً مثل: تورتات المناسبات، كب كيك فاخر، حلويات غربية...</p>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم التصنيف (بالعربية) *:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تورتات المناسبات"
                  value={newCatNameAr}
                  onChange={(e) => {
                    setNewCatNameAr(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم بالإنجليزية:</label>
                <input
                  type="text"
                  placeholder="Occasion Cakes"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الرابط اللطيف (Slug) *:</label>
                <input
                  type="text"
                  required
                  placeholder="occasion-cakes"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ترتيب الظهور:</label>
                <input
                  type="number"
                  value={newCatOrder}
                  onChange={(e) => setNewCatOrder(Number(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={categorySubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-md hover:brightness-105 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{categorySubmitting ? "جاري الإضافة..." : "إضافة التصنيف للمتجر ✨"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-rose-50 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">تصنيفات المتجر الحالية ({catalogCategories.length})</h3>
              <button
                onClick={loadCatalogData}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث التصنيفات</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-rose-500 text-white text-[11px]">
                    <th className="py-3 px-4 font-bold">اسم التصنيف (عربي)</th>
                    <th className="py-3 px-4 font-bold">الاسم (إنجليزي)</th>
                    <th className="py-3 px-4 font-bold">الرابط (Slug)</th>
                    <th className="py-3 px-4 font-bold">ترتيب العرض</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {catalogCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-rose-50/40 transition">
                      <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                        <FolderPlus className="w-3.5 h-3.5 text-rose-400" />
                        <span>{c.nameAr}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.nameEn || "—"}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.slug}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{c.displayOrder ?? 1}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStartEditCategory(c)}
                            className="p-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                            title="تعديل التصنيف"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id, c.nameAr)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="حذف التصنيف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Delivery Zones CRUD (USER REQUEST: Full CRUD) */}
      {activeTab === "ZONES" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-5">
            <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <span>إضافة منطقة توصيل جديدة</span>
                </h3>
                <p className="text-xs text-slate-500">حدد اسم المنطقة ورسوم التوصيل والحد الأدنى للطلب</p>
              </div>
            </div>

            <form onSubmit={handleCreateZone} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المنطقة بالعربية *:</label>
                <input
                  type="text"
                  placeholder="مثال: المعادي ودجلة"
                  value={newZoneNameAr}
                  onChange={(e) => setNewZoneNameAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم بالإنجليزية:</label>
                <input
                  type="text"
                  placeholder="Maadi & Degla"
                  value={newZoneNameEn}
                  onChange={(e) => setNewZoneNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">سعر التوصيل (ج.م) *:</label>
                <input
                  type="number"
                  step="1"
                  value={newZoneFee}
                  onChange={(e) => setNewZoneFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">الحد الأدنى للطلب (ج.م):</label>
                <input
                  type="number"
                  step="5"
                  value={newZoneMinOrder}
                  onChange={(e) => setNewZoneMinOrder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 font-bold"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={zoneSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs shadow-md hover:brightness-105 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{zoneSubmitting ? "جاري الإضافة..." : "إضافة منطقة التوصيل 🛵"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Delivery Zones Table */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-sky-50 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">مناطق التوصيل المفعلة في النظام ({deliveryZones.length})</h3>
              <button
                onClick={loadAdminZones}
                disabled={zonesLoading}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${zonesLoading ? "animate-spin" : ""}`} />
                <span>تحديث المناطق</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-sky-500 text-white text-[11px]">
                    <th className="py-3 px-4 font-bold">المنطقة (عربي)</th>
                    <th className="py-3 px-4 font-bold">المنطقة (إنجليزي)</th>
                    <th className="py-3 px-4 font-bold">سعر التوصيل</th>
                    <th className="py-3 px-4 font-bold">الحد الأدنى للطلب</th>
                    <th className="py-3 px-4 font-bold text-center">الحالة</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {deliveryZones.map((z) => (
                    <tr key={z.id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span>{z.nameAr}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{z.nameEn || "—"}</td>
                      <td className="py-3 px-4 font-black text-emerald-600">{z.deliveryFee.toFixed(2)} ج.م</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{z.minOrderAmount.toFixed(2)} ج.م</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          z.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {z.isActive ? "مفعلة 🟢" : "معطلة 🔴"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingZone(z);
                              setEditZoneNameAr(z.nameAr);
                              setEditZoneFee(z.deliveryFee.toString());
                              setEditZoneMinOrder(z.minOrderAmount.toString());
                            }}
                            className="p-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                            title="تعديل بيانات المنطقة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(z.id, z.nameAr)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="حذف المنطقة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Zone Modal */}
          {editingZone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-sky-200">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-sky-600" />
                    <span>تعديل منطقة: {editingZone.nameAr}</span>
                  </h4>
                  <button onClick={() => setEditingZone(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleSaveEditZone} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم المنطقة بالعربية:</label>
                    <input
                      type="text"
                      value={editZoneNameAr}
                      onChange={(e) => setEditZoneNameAr(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sky-200 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رسوم التوصيل (ج.م):</label>
                    <input
                      type="number"
                      step="1"
                      value={editZoneFee}
                      onChange={(e) => setEditZoneFee(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sky-200 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الحد الأدنى للطلب (ج.م):</label>
                    <input
                      type="number"
                      step="5"
                      value={editZoneMinOrder}
                      onChange={(e) => setEditZoneMinOrder(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sky-200 font-bold"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-100">
                    <button
                      type="button"
                      onClick={() => setEditingZone(null)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={zoneSubmitting}
                      className="px-5 py-2 rounded-xl bg-sky-600 text-white font-black hover:bg-sky-700 transition shadow"
                    >
                      {zoneSubmitting ? "جاري الحفظ..." : "حفظ التعديلات ✨"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Coupons Management (USER REQUEST) */}
      {activeTab === "COUPONS" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                نظام كوبونات الخصم والعروض الترويجية 🏷️
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">إدارة كوبونات وقسائم الخصم</h2>
              <p className="text-xs text-white/90">أنشئ أكواد خصم بنسب مئوية أو مبالغ ثابتة مع حدود استخدام وتواريخ انتهاء</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateCoupon}
              className="px-5 py-2.5 rounded-2xl bg-white text-purple-700 text-xs font-black hover:bg-purple-50 transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كوبون جديد +</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-purple-50 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">الكوبونات المسجلة في النظام ({coupons.length})</h3>
              <button
                onClick={loadAdminCouponsList}
                disabled={couponsLoading}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${couponsLoading ? "animate-spin" : ""}`} />
                <span>تحديث الكوبونات</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-purple-600 text-white text-[11px]">
                    <th className="py-3.5 px-4 font-bold">كود الكوبون</th>
                    <th className="py-3.5 px-4 font-bold">نوع الخصم</th>
                    <th className="py-3.5 px-4 font-bold">قيمة الخصم</th>
                    <th className="py-3.5 px-4 font-bold">الحد الأدنى للطلب</th>
                    <th className="py-3.5 px-4 font-bold">الحد الأقصى للخصم</th>
                    <th className="py-3.5 px-4 font-bold">مرات الاستخدام</th>
                    <th className="py-3.5 px-4 font-bold">تاريخ الانتهاء</th>
                    <th className="py-3.5 px-4 font-bold text-center">الحالة</th>
                    <th className="py-3.5 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        لا توجد كوبونات مسجلة حتى الآن. اضغط على زر &quot;إضافة كوبون جديد +&quot; لإنشاء أول كوبون.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-purple-50/30 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-purple-700 bg-purple-100/70 px-2.5 py-1 rounded-xl text-xs border border-purple-200">
                            {c.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {c.discountType === "PERCENTAGE" ? "نسبة مئوية (%)" : "مبلغ ثابت (ج.م)"}
                        </td>
                        <td className="py-3.5 px-4 font-black text-rose-600">
                          {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `${c.discountValue.toFixed(2)} ج.م`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {c.minOrderAmount ? `${c.minOrderAmount.toFixed(2)} ج.م` : "بلا حد"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.maxDiscountAmount ? `${c.maxDiscountAmount.toFixed(2)} ج.م` : "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {c.usesCount ?? c.usageCount ?? 0} {(c.maxUses || c.usageLimit) ? `/ ${c.maxUses || c.usageLimit}` : "مرة"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {c.endDate ? new Date(c.endDate).toLocaleDateString("ar-EG") : "دائم"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleCoupon(c)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                              c.isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {c.isActive ? "نشط ومفعل ✨" : "معطل"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditCoupon(c)}
                              className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
                              title="تعديل الكوبون"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                              title="حذف الكوبون"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create / Edit Coupon Modal */}
          {couponModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-purple-200 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    <span>{editingCoupon ? `تعديل الكوبون: ${editingCoupon.code}` : "إنشاء كود خصم جديد"}</span>
                  </h4>
                  <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleCreateOrUpdateCoupon} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">رمز الكوبون (Code) *:</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: SAVE20"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 font-mono font-bold text-purple-800 uppercase"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">نوع الخصم *:</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 font-bold text-slate-800"
                      >
                        <option value="PERCENTAGE">نسبة مئوية (%)</option>
                        <option value="FIXED_AMOUNT">مبلغ ثابت (ج.م)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {newCouponType === "PERCENTAGE" ? "نسبة الخصم (%) *:" : "قيمة الخصم (ج.م) *:"}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الحد الأدنى للطلب (ج.م):</label>
                      <input
                        type="number"
                        step="5"
                        value={newCouponMinOrder}
                        onChange={(e) => setNewCouponMinOrder(e.target.value)}
                        placeholder="100"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">أقصى حد للخصم (ج.م - اختياري):</label>
                      <input
                        type="number"
                        step="5"
                        value={newCouponMaxDiscount}
                        onChange={(e) => setNewCouponMaxDiscount(e.target.value)}
                        placeholder="مثال: 50"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الحد الأقصى لمرات الاستخدام:</label>
                      <input
                        type="number"
                        value={newCouponUsageLimit}
                        onChange={(e) => setNewCouponUsageLimit(e.target.value)}
                        placeholder="مثال: 100 (اتركه فارغاً لغير محدود)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">تاريخ البدء (اختياري):</label>
                      <input
                        type="date"
                        value={newCouponStartDate}
                        onChange={(e) => setNewCouponStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">تاريخ الانتهاء (اختياري):</label>
                      <input
                        type="date"
                        value={newCouponEndDate}
                        onChange={(e) => setNewCouponEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => setCouponModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={couponSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition shadow disabled:opacity-50"
                    >
                      {couponSubmitting ? "جاري الحفظ..." : editingCoupon ? "تحديث الكوبون ✨" : "حفظ الكوبون 🏷️"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Sliders & Banners Customization (USER REQUEST) */}
      {activeTab === "SLIDERS" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Hero Slides Manager */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-6">
            <div className="border-b border-rose-100 pb-4">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-rose-500" />
                <span>شرائح السلايدر المتحرك في الصفحة الرئيسية (Hero Carousel)</span>
              </h3>
              <p className="text-xs text-slate-500">تتغير الصور تلقائياً كل 3.5 ثانية لجذب العميل مع إمكانية إضافة وحذف أي صورة</p>
            </div>

            {/* Current Slides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {heroSlidesAdmin.map((slide, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col group">
                  <div className="h-36 relative bg-slate-100">
                    <Image src={slide.src} alt={slide.title} fill className="object-cover" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow">
                      {slide.tag}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-black text-xs text-slate-900 line-clamp-1">{slide.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{slide.sub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHeroSlide(idx)}
                      className="w-full py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الشريحة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Slide Form */}
            <form onSubmit={handleAddHeroSlide} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3 text-xs">
              <h4 className="font-black text-slate-900">إضافة شريحة جديدة للسلايدر الرئيسي:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رابط الصورة (URL أو مسار محلي) *:</label>
                  <input
                    type="text"
                    placeholder="/images/hero-dessert.jpg أو رابط ويب"
                    value={newSlideSrc}
                    onChange={(e) => setNewSlideSrc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">العنوان الرئيسي للشريحة *:</label>
                  <input
                    type="text"
                    placeholder="مثال: تشكيلة الكب كيك الإسباني الفاخر"
                    value={newSlideTitle}
                    onChange={(e) => setNewSlideTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">شارة العرض (Badge):</label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر طلباً ★"
                    value={newSlideTag}
                    onChange={(e) => setNewSlideTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الوصف الفرعي:</label>
                  <input
                    type="text"
                    placeholder="مثال: كريمة خفيفة ومكونات طبيعية 100%"
                    value={newSlideSub}
                    onChange={(e) => setNewSlideSub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-md hover:brightness-105 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة وتفعيل في الصفحة الرئيسية</span>
                </button>
              </div>
            </form>
          </div>

          {/* Custom Cake Showcase Slides Manager */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-sm space-y-6">
            <div className="border-b border-pink-100 pb-4">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-500" />
                <span>شرائح معرض تورتات المناسبات في الصفحة الرئيسية (Section 5)</span>
              </h3>
              <p className="text-xs text-slate-500">الصور التفاعلية التي تظهر في قسم تصميم التورتة المخصصة بالصفحة الرئيسية</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cakeSlidesAdmin.map((slide, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-pink-200 bg-pink-50/20 shadow-sm flex flex-col">
                  <div className="h-40 relative bg-slate-100">
                    <Image src={slide.src} alt={slide.title} fill className="object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-600 text-white shadow">
                      {slide.tiers}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-black text-xs text-slate-900">{slide.title}</h4>
                    <p className="text-[11px] text-slate-500">{slide.flavor}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteCakeSlide(idx)}
                      className="w-full py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الصورة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCakeSlide} className="p-5 rounded-2xl bg-pink-50/40 border border-pink-200 space-y-3 text-xs">
              <h4 className="font-black text-slate-900">إضافة تورتة جديدة لمعرض الصفحة الرئيسية:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رابط صورة التورتة *:</label>
                  <input
                    type="text"
                    placeholder="/images/custom-cake-hero.jpg"
                    value={newCakeSrc}
                    onChange={(e) => setNewCakeSrc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان التورتة *:</label>
                  <input
                    type="text"
                    placeholder="مثال: تورتة زفاف ملكية"
                    value={newCakeTitle}
                    onChange={(e) => setNewCakeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">النكهة والحشوة:</label>
                  <input
                    type="text"
                    placeholder="شوكولاتة بلجيكية وتوت بري"
                    value={newCakeFlavor}
                    onChange={(e) => setNewCakeFlavor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عدد الأدوار / الفئة:</label>
                  <input
                    type="text"
                    placeholder="3 أدوار فاخرة"
                    value={newCakeTiers}
                    onChange={(e) => setNewCakeTiers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs shadow-md hover:brightness-105 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة تورتة العرض</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Loyalty Program Rules (USER REQUEST) */}
      {activeTab === "LOYALTY" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl">
          <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-6">
            <div className="border-b border-amber-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">نظام وقواعد برنامج مكافآت ونقاط الولاء (VIP Loyalty)</h3>
                <p className="text-xs text-slate-500">تحكم بقيمة النقاط المكتسبة ومعدل الاستبدال لخصومات المشتريات القادمة</p>
              </div>
            </div>

            <form onSubmit={handleSaveLoyalty} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                  <span className="font-black text-slate-800 text-sm block">معدل اكتساب النقاط (Earning Rate)</span>
                  <p className="text-[11px] text-slate-500">كم جنيه يتم إنفاقه ليكسب العميل نقطة ولاء واحدة؟</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-bold text-slate-600">نقطة 1 لكل:</span>
                    <input
                      type="number"
                      min="1"
                      value={loyaltyPointsPerEgp}
                      onChange={(e) => setLoyaltyPointsPerEgp(e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl border border-amber-300 font-black text-center text-sm"
                    />
                    <span className="font-bold text-slate-600">جنيه مصري</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                  <span className="font-black text-slate-800 text-sm block">قيمة استبدال النقطة (Redemption Value)</span>
                  <p className="text-[11px] text-slate-500">القيمة المادية للنقطة الواحدة بالجنيه عند الخصم من الفاتورة:</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-bold text-slate-600">النقطة =</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={loyaltyEgpPerPoint}
                      onChange={(e) => setLoyaltyEgpPerPoint(e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl border border-amber-300 font-black text-center text-sm"
                    />
                    <span className="font-bold text-slate-600">جنيه مصري خصم</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>مثال عملي:</strong> عندما ينفق العميل 500 جنيه، يحصل على 50 نقطة. عند استبدالها بمعدل 0.05 جنيه/نقطة، يحصل العميل على خصم فوري قيمته 2.50 جنيه، أو 500 نقطة = 25 جنيه خصم.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md hover:brightness-105 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وتطبيق قواعد نقاط الولاء 💎</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 6: Store Settings & Logo Customization */}
      {activeTab === "SETTINGS" && (
        <div className="space-y-8 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900">إعدادات المتجر وهوية العلامة التجارية</h3>
              <p className="text-xs text-slate-500">تحكم بشعار المتجر وأرقام التواصل والتعليمات دون الحاجة لإعادة نشر التطبيق</p>
            </div>
            <button
              type="button"
              disabled={savingSettingKey === "ALL"}
              onClick={handleSaveAllStoreSettings}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-md hover-jelly transition flex items-center gap-2 self-start sm:self-auto"
            >
              <Save className={`w-4 h-4 text-white ${savingSettingKey === "ALL" ? "animate-spin" : ""}`} />
              <span>{savingSettingKey === "ALL" ? "جاري الحفظ..." : "حفظ جميع إعدادات المتجر دفعة واحدة 💾"}</span>
            </button>
          </div>

          {/* Dedicated Logo Customization Card (USER REQUEST) */}
          <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50/40 p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-rose-glow">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-900">شعار المتجر (Store Logo)</h4>
                <p className="text-xs text-slate-500">يمكنك رفع صورة الشعار من جهازك مباشرة أو وضع رابط مباشر للصورة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-dashed border-rose-300 text-center space-y-3">
                <span className="text-[11px] font-bold text-slate-400 block">معاينة الشعار الحالي</span>
                {currentLogo ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-rose-200 shadow-sm bg-white">
                    <Image
                      src={currentLogo}
                      alt="لوجو المتجر"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 font-black text-xl">
                    LC
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700">شعار لولو كب كيك</span>
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-2 space-y-4">
                {/* Method 1: File Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    الخيار الأول: رفع ملف صورة من جهازك (PNG / JPG / WEBP)
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50 cursor-pointer transition shadow-sm text-xs font-bold text-rose-600">
                    <Upload className="w-4 h-4" />
                    <span>اضغط هنا لاختيار صورة الشعار من الكمبيوتر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Method 2: Direct URL */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    الخيار الثاني: أو الصق رابط صورة الشعار مباشرة (URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoInputUrl}
                      onChange={(e) => setLogoInputUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveLogoUrl}
                      className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>تطبيق وحفظ</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  💡 عند حفظ الشعار، سيتم تحديثه فوراً في شريط الموقع العلوي وتطبيقه على كل زوار المتجر.
                </div>
              </div>
            </div>
          </div>

          {/* Hero & Promo Banner & Minimum Order Customization (USER REQUEST: التحكم الكامل بالهيرو والبوستات والحد الأدنى) */}
          <div className="bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-purple-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">تخصيص الواجهة الرئيسية والحد الأدنى للطلب (Hero & Banner)</h4>
                  <p className="text-xs text-slate-500">تحكم كامل بالبوست الأول (الهيرو)، البانر الترويجي، والحد الأدنى للطلب للشراء الفوري والسلة</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Minimum Order & Promo Banner */}
              <div className="space-y-4">
                {/* Min Order Amount */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-xs text-amber-900">الحد الأدنى للطلب (Minimum Order Charge) 💰:</label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">إلزامي للمشتريات</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80">
                    أقل مبلغ يمكن للعميل الدفع والطلب به (مثال: 150 ج.م). أي منتج أقل من هذا المبلغ لن تظهر فيه أزرار الشراء الفوري حتى تكتمل السلة.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      placeholder="150"
                      value={editingSettings["min_order_amount"] ?? (settings.find((s) => s.key === "min_order_amount")?.value || "150")}
                      onChange={(e) => setEditingSettings({ ...editingSettings, min_order_amount: e.target.value })}
                      className="w-36 px-3 py-2 rounded-xl border border-amber-300 font-black text-sm text-amber-900 bg-white"
                    />
                    <span className="font-bold text-xs text-amber-900">ج.م</span>
                    <button
                      type="button"
                      disabled={savingSettingKey === "min_order_amount"}
                      onClick={() => handleSaveSetting("min_order_amount")}
                      className="px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition shadow-xs"
                    >
                      {savingSettingKey === "min_order_amount" ? "جاري الحفظ..." : "تطبيق وحفظ"}
                    </button>
                  </div>
                </div>

                {/* Promo Banner Active Toggle & Text */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-xs text-purple-900">الشريط الإعلاني العلوي (Top Promo Banner) 📢:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = (editingSettings["promo_banner_active"] ?? settings.find((s) => s.key === "promo_banner_active")?.value) === "true";
                        const nextVal = current ? "false" : "true";
                        setEditingSettings({ ...editingSettings, promo_banner_active: nextVal });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1.5 ${
                        (editingSettings["promo_banner_active"] ?? settings.find((s) => s.key === "promo_banner_active")?.value) === "true"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-500 border border-slate-300"
                      }`}
                    >
                      {(editingSettings["promo_banner_active"] ?? settings.find((s) => s.key === "promo_banner_active")?.value) === "true" ? "مفعل 🟢" : "معطل ⚪"}
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="خصم 15% على جميع التورتات والبوكسات اليوم بكود SWEET15 ✨"
                      value={editingSettings["promo_banner_text"] ?? (settings.find((s) => s.key === "promo_banner_text")?.value || "")}
                      onChange={(e) => setEditingSettings({ ...editingSettings, promo_banner_text: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-purple-200 text-xs font-bold"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={savingSettingKey === "promo_banner_text"}
                      onClick={async () => {
                        await handleSaveSetting("promo_banner_active");
                        await handleSaveSetting("promo_banner_text");
                      }}
                      className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition"
                    >
                      حفظ إعدادات البانر
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Post Details */}
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-purple-200">
                <h5 className="font-black text-xs text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>محتوى البوست الأول (Hero Post) بالصفحة الرئيسية</span>
                </h5>

                <div>
                  <label className="font-bold text-[11px] text-slate-600 block mb-1">الشارة الترويجية (Badge):</label>
                  <input
                    type="text"
                    placeholder="أشهى المخبوزات والحلويات الطازجة"
                    value={editingSettings["hero_badge"] ?? (settings.find((s) => s.key === "hero_badge")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, hero_badge: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[11px] text-slate-600 block mb-1">العنوان الرئيسي (Title) *:</label>
                  <input
                    type="text"
                    placeholder="لحظاتك السعيدة تبدأ بقطعة سكر فاخرة"
                    value={editingSettings["hero_title"] ?? (settings.find((s) => s.key === "hero_title")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, hero_title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[11px] text-slate-600 block mb-1">النص التوضيحي (Subtitle):</label>
                  <textarea
                    rows={2}
                    placeholder="نصنع كل قطعة كب كيك وحلوى شرقية بحب..."
                    value={editingSettings["hero_subtitle"] ?? (settings.find((s) => s.key === "hero_subtitle")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, hero_subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[11px] text-slate-600 block mb-1">نص زر الشراء الرئيسي (CTA Button):</label>
                  <input
                    type="text"
                    placeholder="استكشف تشكيلة اليوم الطازجة 🎂"
                    value={editingSettings["hero_cta_text"] ?? (settings.find((s) => s.key === "hero_cta_text")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, hero_cta_text: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs"
                  />
                </div>

                {/* Hero Image with File Upload */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[11px] text-slate-600 block">صورة البوست الرئيسي (رابط أو رفع من جهازك) 🖼️:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="/placeholders/cake-1.jpg أو رابط مباشر"
                      value={editingSettings["hero_image_url"] ?? (settings.find((s) => s.key === "hero_image_url")?.value || "")}
                      onChange={(e) => setEditingSettings({ ...editingSettings, hero_image_url: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-mono"
                    />
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs flex items-center gap-1.5 shrink-0 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingHeroImage ? "جاري الرفع..." : "رفع من الجهاز 📁"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingHeroImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingHeroImage(true);
                          try {
                            const res = await uploadImageFile(file);
                            setEditingSettings((prev) => ({ ...prev, hero_image_url: res }));
                            showToast("تم رفع صورة الهيرو بنجاح! 📸");
                          } catch (err: unknown) {
                            const error = err as Error;
                            showToast(error.message || "فشل رفع الصورة", "error");
                          } finally {
                            setUploadingHeroImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSaveSetting("hero_badge");
                      await handleSaveSetting("hero_title");
                      await handleSaveSetting("hero_subtitle");
                      await handleSaveSetting("hero_cta_text");
                      await handleSaveSetting("hero_image_url");
                      showToast("تم حفظ جميع تفاصيل الهيرو بنجاح! ✨");
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black rounded-xl hover:brightness-105 transition shadow-sm"
                  >
                    حفظ تفاصيل الهيرو بالكامل 💾
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Store Contacts & Facebook / n8n Integration Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Store Address, Phone & Working Hours */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <Store className="w-5 h-5 text-rose-500" />
                <h4 className="font-black text-sm text-slate-900">بيانات الفرع، الهاتف، وساعات العمل</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المتجر بالعربية:</label>
                  <input
                    type="text"
                    placeholder="لولو كب كيك"
                    value={editingSettings["store_name_ar"] ?? (settings.find((s) => s.key === "store_name_ar")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_name_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_name_ar"}
                    onClick={() => handleSaveSetting("store_name_ar")}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_name_ar" ? "جاري الحفظ..." : "حفظ اسم المتجر"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم هاتف المتجر:</label>
                  <input
                    type="text"
                    placeholder="01099887766"
                    value={editingSettings["store_phone"] ?? (settings.find((s) => s.key === "store_phone")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_phone"}
                    onClick={() => handleSaveSetting("store_phone")}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_phone" ? "جاري الحفظ..." : "حفظ الهاتف"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان الفرع الرئيسي بالتفصيل:</label>
                  <input
                    type="text"
                    placeholder="شارع 9 الرئيسي، المعادي، القاهرة"
                    value={editingSettings["store_address_ar"] ?? (settings.find((s) => s.key === "store_address_ar")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_address_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_address_ar"}
                    onClick={() => handleSaveSetting("store_address_ar")}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_address_ar" ? "جاري الحفظ..." : "حفظ العنوان"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">مواعيد وساعات العمل:</label>
                  <input
                    type="text"
                    placeholder="يومياً من 10:00 صباحاً حتى 11:00 مساءً"
                    value={editingSettings["store_working_hours"] ?? (settings.find((s) => s.key === "store_working_hours")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_working_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_working_hours"}
                    onClick={() => handleSaveSetting("store_working_hours")}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_working_hours" ? "جاري الحفظ..." : "حفظ ساعات العمل"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم فرع الاستلام (USER REQUEST: قابل للتغيير بدل المعادي الثابتة):</label>
                  <input
                    type="text"
                    placeholder="فرع المعادي الرئيسي"
                    value={editingSettings["store_pickup_branch_name"] ?? (settings.find((s) => s.key === "store_pickup_branch_name")?.value || "فرع المعادي الرئيسي")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_pickup_branch_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_pickup_branch_name"}
                    onClick={() => handleSaveSetting("store_pickup_branch_name")}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_pickup_branch_name" ? "جاري الحفظ..." : "حفظ اسم الفرع"}
                  </button>
                </div>
              </div>
            </div>

            {/* Box 2: Facebook Page & n8n Webhook Integration */}
            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-sky-100 pb-3">
                <Share2 className="w-5 h-5 text-sky-600" />
                <h4 className="font-black text-sm text-slate-900">أتمتة فيسبوك وربط Webhook عبر n8n</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم واتساب الشيف وإدارة المتجر (لاستقبال خطة اليوم):</label>
                  <input
                    type="text"
                    placeholder="201099887766"
                    value={editingSettings["store_manager_whatsapp"] ?? (settings.find((s) => s.key === "store_manager_whatsapp")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, store_manager_whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "store_manager_whatsapp"}
                    onClick={() => handleSaveSetting("store_manager_whatsapp")}
                    className="mt-1 px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "store_manager_whatsapp" ? "جاري الحفظ..." : "حفظ واتساب الإدارة"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رابط صفحة فيسبوك الرسمية (Facebook Page URL):</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/lolocupcakes.official"
                    value={editingSettings["facebook_page_url"] ?? (settings.find((s) => s.key === "facebook_page_url")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, facebook_page_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "facebook_page_url"}
                    onClick={() => handleSaveSetting("facebook_page_url")}
                    className="mt-1 px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "facebook_page_url" ? "جاري الحفظ..." : "حفظ رابط فيسبوك"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رابط Webhook لـ n8n لنشر المنتجات تلقائياً:</label>
                  <input
                    type="url"
                    placeholder="https://n8n.yourdomain.com/webhook/publish-product"
                    value={editingSettings["n8n_webhook_url"] ?? (settings.find((s) => s.key === "n8n_webhook_url")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, n8n_webhook_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "n8n_webhook_url"}
                    onClick={() => handleSaveSetting("n8n_webhook_url")}
                    className="mt-1 px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "n8n_webhook_url" ? "جاري الحفظ..." : "حفظ Webhook n8n"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">معرف صفحة فيسبوك (Facebook Page ID):</label>
                  <input
                    type="text"
                    placeholder="104928374928374"
                    value={editingSettings["facebook_page_id"] ?? (settings.find((s) => s.key === "facebook_page_id")?.value || "")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, facebook_page_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "facebook_page_id"}
                    onClick={() => handleSaveSetting("facebook_page_id")}
                    className="mt-1 px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "facebook_page_id" ? "جاري الحفظ..." : "حفظ Page ID"}
                  </button>
                </div>
              </div>
            </div>

            {/* Box 3: Payment Accounts Customization (USER REQUEST: فودافون كاش وإنستاباي) */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900">بيانات تحويل المدفوعات (فودافون كاش وإنستاباي InstaPay)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم محفظة فودافون كاش لاستقبال المدفوعات:</label>
                  <input
                    type="text"
                    placeholder="01099887766"
                    value={editingSettings["payment_vodafone_cash_number"] ?? (settings.find((s) => s.key === "payment_vodafone_cash_number")?.value || "01099887766")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, payment_vodafone_cash_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 font-mono font-bold"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "payment_vodafone_cash_number"}
                    onClick={() => handleSaveSetting("payment_vodafone_cash_number")}
                    className="mt-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "payment_vodafone_cash_number" ? "جاري الحفظ..." : "حفظ رقم فودافون كاش"}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان حساب إنستاباي (InstaPay Address / IPA):</label>
                  <input
                    type="text"
                    placeholder="lolocupcakes@instapay"
                    value={editingSettings["payment_instapay_address"] ?? (settings.find((s) => s.key === "payment_instapay_address")?.value || "lolocupcakes@instapay")}
                    onChange={(e) => setEditingSettings({ ...editingSettings, payment_instapay_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 font-mono font-bold"
                  />
                  <button
                    type="button"
                    disabled={savingSettingKey === "payment_instapay_address"}
                    onClick={() => handleSaveSetting("payment_instapay_address")}
                    className="mt-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {savingSettingKey === "payment_instapay_address" ? "جاري الحفظ..." : "حفظ حساب إنستاباي"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* All Store Settings Raw List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <h4 className="font-black text-base text-slate-900 border-b border-rose-100 pb-3">جميع إعدادات وسياسات النظام</h4>
            <div className="space-y-3">
              {settings.map((s) => (
                <div key={s.key} className="space-y-1.5 border-b border-rose-50 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{s.key}</span>
                    <span className="text-[11px] text-slate-400">{s.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSettings[s.key] ?? s.value}
                      onChange={(e) => setEditingSettings({ ...editingSettings, [s.key]: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      type="button"
                      disabled={savingSettingKey === s.key}
                      onClick={() => handleSaveSetting(s.key)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow flex items-center gap-1.5"
                    >
                      <Save className={`w-3.5 h-3.5 text-amber-400 ${savingSettingKey === s.key ? "animate-spin" : ""}`} />
                      <span>{savingSettingKey === s.key ? "جاري الحفظ..." : "حفظ"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reviews & Testimonials Management (USER REQUEST: التحكم الكامل بآراء وتقييمات العملاء المعروضة) */}
      {activeTab === "REVIEWS" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & KPI Card */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                آراء وتجارب العملاء • Customer Testimonials
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">إدارة التقييمات المعروضة في المتجر</h2>
              <p className="text-xs text-white/90">
                تحكم كامل في كل رأي يظهر للزوار في الصفحة الرئيسية، مع إمكانية إضافة تقييمات جديدة وحذف أي تقييم
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewReviewCustomer("");
                setNewReviewRating(5);
                setNewReviewComment("");
                setReviewModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-white text-amber-800 text-xs font-black hover:bg-amber-50 transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقييم جديد ⭐</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>التقييمات المعتمدة ({reviews.length})</span>
                </h3>
                <p className="text-xs text-slate-500">هذه التقييمات تظهر بشكل ديناميكي وجذاب في الصفحة الرئيسية لزيادة ثقة العملاء</p>
              </div>
              <button
                type="button"
                onClick={loadReviews}
                disabled={reviewsLoading}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reviewsLoading ? "animate-spin" : ""}`} />
                <span>تحديث</span>
              </button>
            </div>

            {reviewsLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm font-bold flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                <span>جاري تحميل التقييمات...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm font-bold space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <p>لا توجد تقييمات مضافة حالياً. اضغط على &quot;إضافة تقييم جديد&quot; لإضافة أول رأي!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-amber-50/30 border border-amber-200/80 hover:border-amber-400 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{rev.customerName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-amber-100 text-[11px] text-slate-400">
                      <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("ar-EG") : "معتمد"}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev)}
                        className="px-2.5 py-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition flex items-center gap-1"
                        title="حذف هذا التقييم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Modal */}
          {reviewModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-amber-200">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>إضافة تقييم عميل جديد</span>
                  </h4>
                  <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم العميل *:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ياسمين أحمد - المعادي"
                      value={newReviewCustomer}
                      onChange={(e) => setNewReviewCustomer(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">التقييم بالنجوم (1 إلى 5):</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className={`p-2 rounded-xl border transition ${
                            newReviewRating >= star
                              ? "bg-amber-50 border-amber-400 text-amber-500"
                              : "bg-slate-50 border-slate-200 text-slate-300"
                          }`}
                        >
                          <Star className={`w-5 h-5 ${newReviewRating >= star ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      ))}
                      <span className="font-black text-amber-800 mr-2">{newReviewRating} نجوم</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نص التعليق / الرأي *:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="أجمل كب كيك ذقته في حياتي، هش وطازج جداً والتوصيل في الموعد بالدقيقة..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={newReviewSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black hover:brightness-105 transition shadow disabled:opacity-50"
                    >
                      {newReviewSubmitting ? "جاري الحفظ..." : "حفظ ونشر التقييم ⭐"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      </main>
      {/* Interactive Toast Notification (USER REQUEST) */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" 
            ? "bg-slate-900/95 text-white border-emerald-400/50 backdrop-blur-xl" 
            : "bg-red-900/95 text-white border-red-400/50 backdrop-blur-xl"
        }`}>
          {toast.type === "success" ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-4 h-4 animate-pulse" />
            </div>
          )}
          <span className="font-extrabold text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="mr-2 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
