export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/v1`
    : "http://localhost:3000/api/v1");

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  fieldErrors: Array<{ field: string; message: string }>;
  traceId: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  database: string;
  businessTimezone: string;
  businessTimeCairo: string;
}

// Catalog Models
export interface CategoryDto {
  id: string;
  slug: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  iconName?: string;
  displayOrder: number;
}

export interface OptionValueDto {
  id: string;
  nameAr: string;
  priceDelta: number;
  isDefault: boolean;
}

export interface OptionGroupDto {
  id: string;
  nameAr: string;
  isRequired: boolean;
  allowMultiple: boolean;
  values: OptionValueDto[];
}

export interface ProductAddonDto {
  id: string;
  nameAr: string;
  price: number;
}

export interface ProductDto {
  id: string;
  categoryId: string;
  slug: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  basePrice: number;
  leadTimeHours: number;
  prepLeadHours?: number;
  stockQuantity?: number;
  isPreOrder?: boolean;
  badge?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isCustomizable: boolean;
  primaryImageUrl?: string;
  categoryNameAr?: string;
  categorySlug?: string;
  optionGroups: OptionGroupDto[];
  addons: ProductAddonDto[];
  variants?: ProductVariantDto[];
}

export interface ProductVariantDto {
  id: string;
  nameAr: string;
  nameEn?: string;
  priceDelta: number;
  priceOverride?: number;
  stockQuantity?: number;
}

// Cart Models
export interface CartItemDto {
  id: string;
  productId: string;
  productNameAr: string;
  productSlug: string;
  variantId?: string | null;
  variantNameAr?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedConfiguration: string;
  optionDescriptions: string[];
  addonDescriptions: string[];
}

export interface CartDto {
  cartToken: string;
  items: CartItemDto[];
  totalQuantity: number;
  subtotal: number;
  currency: string;
}

export interface CheckoutQuoteResponse {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  appliedCouponCode?: string | null;
  couponDiscountLabel?: string | null;
  deliveryZoneNameAr?: string | null;
  fulfillmentType: string;
}

// Fulfillment & Scheduling
export interface DeliveryZoneDto {
  id: string;
  nameAr: string;
  nameEn?: string;
  deliveryFee: number;
  minOrderAmount: number;
  displayOrder: number;
  isActive?: boolean;
}

export interface TimeSlotDto {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  timeRangeDisplay?: string;
  timeDisplay: string;
  fulfillmentType: string;
  maxCapacity: number;
  reservedCount: number;
  remainingCapacity: number;
  isAvailable?: boolean;
  available: boolean;
}

export interface BranchDto {
  id: string;
  nameAr: string;
  addressAr: string;
  phone: string;
}

// Orders & Payments
export interface CreateOrderRequest {
  idempotencyKey: string;
  cartToken: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: "DELIVERY" | "PICKUP";
  deliveryZoneId?: string | null;
  streetAddress?: string | null;
  buildingNumber?: string | null;
  floorDoor?: string | null;
  landmark?: string | null;
  timeSlotId: string;
  paymentMethod: "CASH" | "MANUAL_TRANSFER" | "CARD_ONLINE";
  customerNotes?: string | null;
  couponCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
}

export interface OrderResponseDto {
  id: string;
  publicOrderNumber: string;
  trackingToken: string;
  orderStatus: string;
  orderStatusLabelAr: string;
  paymentStatus: string;
  paymentStatusLabelAr: string;
  paymentMethod: string;
  paymentMethodLabelAr: string;
  fulfillmentType: string;
  fulfillmentTypeLabelAr: string;
  scheduledForDate: string;
  scheduledForTimeRange: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  deliveryAddressSnapshot?: string | null;
  customerNotes?: string | null;
  items?: OrderItemDetailDto[];
  createdAt: string;
  customerId?: string;
  isGuest?: boolean;
}

export interface OrderItemDetailDto {
  id: string;
  productName: string;
  productNameAr?: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  options?: string | null;
  optionsSnapshot?: string | null;
}

export interface OrderStatusHistoryItem {
  status: string;
  statusLabelAr: string;
  note?: string;
  timestamp: string;
}

export interface OrderTrackingDto {
  publicOrderNumber: string;
  trackingToken?: string;
  orderStatus: string;
  orderStatusLabelAr: string;
  paymentStatus: string;
  paymentStatusLabelAr: string;
  paymentMethod?: string;
  paymentMethodLabelAr?: string;
  fulfillmentType: string;
  fulfillmentTypeLabelAr: string;
  scheduledForDate: string;
  scheduledForTimeRange: string;
  customerName?: string;
  customerPhone?: string;
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  totalAmount: number;
  currency: string;
  deliveryAddressSnapshot?: string | null;
  customerNotes?: string | null;
  items?: OrderItemDetailDto[];
  createdAt: string;
  timeline: OrderStatusHistoryItem[];
}

export interface PaymentInstructionField {
  labelAr: string;
  value: string;
  copyable: boolean;
}

export interface PaymentInstructionDto {
  method: string;
  titleAr: string;
  descriptionAr: string;
  fields: PaymentInstructionField[];
  proofUploadNote: string;
}

export interface PaymentProofDto {
  id: string;
  paymentId: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  paymentReference?: string;
  reviewNote?: string;
  proofs: PaymentProofDto[];
  createdAt: string;
}

// Custom Cakes
export interface CustomCakeQuoteDto {
  id: string;
  quotedPrice: number;
  termsAndDetails: string;
  expiresAt: string;
  status: string;
  statusLabelAr: string;
  respondedAt?: string;
  createdAt: string;
  expired: boolean;
}

export interface CustomCakeRequestResponseDto {
  id: string;
  publicReference: string;
  requestReference?: string;
  accessToken?: string;
  trackingToken?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  requestedDate: string;
  servingsNeeded?: number;
  flavorPreference?: string;
  messageOnCake?: string;
  notes?: string;
  status: string;
  statusLabelAr: string;
  hasReferenceImage: boolean;
  quotes: CustomCakeQuoteDto[];
  createdAt: string;
}

// Admin Dashboard & Settings
export interface DashboardMetricsDto {
  totalOrdersCount: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  pendingPaymentsCount: number;
  pendingCustomCakesCount: number;
  totalSalesEgp: number;
  todaySalesEgp: number;
  recentOrders: OrderResponseDto[];
}

export interface StoreSettingDto {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

// Generic Fetch Helper
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: HeadersInit = {
    "Accept": "application/json",
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !("Content-Type" in (options.headers || {}))) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    throw new Error(errorBody.message || "حدث خطأ غير متوقع أثناء معالجة الطلب");
  }

  return body as ApiResponse<T>;
}

// Client API Methods
export async function getSystemHealth(): Promise<HealthStatus> {
  try {
    const res = await fetchApi<HealthStatus>("/health");
    return res.data;
  } catch {
    return {
      status: "DOWN",
      service: "lolo-cupcakes-backend",
      database: "UNREACHABLE",
      businessTimezone: "Africa/Cairo",
      businessTimeCairo: new Date().toISOString(),
    };
  }
}

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await fetchApi<CategoryDto[]>("/categories");
  return res.data;
}

export interface ProductListResponse {
  content: ProductDto[];
  totalElements: number;
  totalPages: number;
}

export async function getProducts(params?: { categorySlug?: string; search?: string; page?: number; size?: number }): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.categorySlug) query.append("category", params.categorySlug);
  if (params?.search) query.append("search", params.search);
  if (params?.page !== undefined) query.append("page", params.page.toString());
  if (params?.size !== undefined) query.append("size", params.size.toString());

  const res = await fetchApi<ProductListResponse>(`/products?${query.toString()}`);
  return res.data;
}

export async function getProduct(slug: string): Promise<ProductDto> {
  const res = await fetchApi<ProductDto>(`/products/${slug}`);
  return res.data;
}

// Cart API
export async function getOrCreateCart(cartToken?: string): Promise<CartDto> {
  if (cartToken) {
    try {
      const res = await fetchApi<CartDto>(`/carts/${cartToken}`);
      return res.data;
    } catch {
      // Create new cart on error
    }
  }
  const res = await fetchApi<CartDto>("/carts", { method: "POST" });
  return res.data;
}

export async function addItemToCart(
  cartToken: string,
  item: {
    productId: string;
    variantId?: string | null;
    quantity: number;
    selectedOptionValueIds?: string[];
    selectedAddonIds?: string[];
    customerNote?: string;
  }
): Promise<CartDto> {
  const res = await fetchApi<CartDto>(`/carts/${cartToken}/items`, {
    method: "POST",
    body: JSON.stringify(item),
  });
  return res.data;
}

export async function removeItemFromCart(cartToken: string, itemId: string): Promise<CartDto> {
  const res = await fetchApi<CartDto>(`/carts/${cartToken}/items/${itemId}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function clearCart(cartToken: string): Promise<void> {
  await fetchApi(`/carts/${cartToken}`, { method: "DELETE" });
}

export async function getCheckoutQuote(quoteRequest: {
  cartToken: string;
  fulfillmentType: "DELIVERY" | "PICKUP";
  deliveryZoneId?: string | null;
  couponCode?: string | null;
}): Promise<CheckoutQuoteResponse> {
  const res = await fetchApi<CheckoutQuoteResponse>("/checkout/quote", {
    method: "POST",
    body: JSON.stringify(quoteRequest),
  });
  return res.data;
}

// Fulfillment
export async function getDeliveryZones(): Promise<DeliveryZoneDto[]> {
  const res = await fetchApi<DeliveryZoneDto[]>("/delivery-zones");
  return res.data;
}

export async function getAvailableSlots(date?: string, fulfillmentType?: string): Promise<TimeSlotDto[]> {
  const query = new URLSearchParams();
  if (date) query.append("date", date);
  if (fulfillmentType) query.append("fulfillmentType", fulfillmentType);

  const res = await fetchApi<TimeSlotDto[]>(`/availability/slots?${query.toString()}`);
  return (res.data || []).map((s) => ({
    ...s,
    timeDisplay: s.timeRangeDisplay || s.timeDisplay || `${s.startTime} - ${s.endTime}`,
    timeRangeDisplay: s.timeRangeDisplay || s.timeDisplay || `${s.startTime} - ${s.endTime}`,
    available: s.isAvailable ?? s.available ?? (s.remainingCapacity > 0),
    isAvailable: s.isAvailable ?? s.available ?? (s.remainingCapacity > 0),
  }));
}

export async function getCurrentBranch(): Promise<BranchDto> {
  const res = await fetchApi<BranchDto>("/branches/current");
  return res.data;
}

// Orders & Payments
export async function createOrder(request: CreateOrderRequest): Promise<OrderResponseDto> {
  const res = await fetchApi<OrderResponseDto>("/orders", {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Idempotency-Key": request.idempotencyKey,
    },
  });
  return res.data;
}

export async function getOrderTracking(orderNumber: string, token?: string): Promise<OrderTrackingDto> {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  const res = await fetchApi<OrderTrackingDto>(`/orders/${orderNumber}/tracking${query}`);
  return res.data;
}

export async function lookupOrders(query: string): Promise<OrderTrackingDto[]> {
  const res = await fetchApi<OrderTrackingDto[]>(`/orders/lookup?query=${encodeURIComponent(query)}`);
  return res.data;
}

export async function getPaymentInstructions(): Promise<PaymentInstructionDto[]> {
  const res = await fetchApi<PaymentInstructionDto[]>("/payment-instructions");
  return res.data;
}

export async function uploadPaymentProof(
  orderNumber: string,
  token: string,
  file: File,
  details?: { senderPhone?: string; senderName?: string; transactionRef?: string }
): Promise<PaymentProofDto> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("token", token);
  if (details?.senderPhone) formData.append("senderPhone", details.senderPhone);
  if (details?.senderName) formData.append("senderName", details.senderName);
  if (details?.transactionRef) formData.append("transactionRef", details.transactionRef);

  const res = await fetchApi<PaymentProofDto>(`/orders/${orderNumber}/manual-payment-proofs`, {
    method: "POST",
    body: formData,
  });
  return res.data;
}

// Custom Cakes
export async function createCustomCakeRequest(
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    requestedDate: string;
    servingsNeeded?: number;
    flavorPreference?: string;
    messageOnCake?: string;
    notes?: string;
  },
  referenceImage?: File | null
): Promise<CustomCakeRequestResponseDto> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (referenceImage) {
    formData.append("referenceImage", referenceImage);
  }

  const res = await fetchApi<CustomCakeRequestResponseDto>("/custom-cake-requests", {
    method: "POST",
    body: formData,
  });
  return res.data;
}

export async function getCustomCakeRequest(ref: string, token: string): Promise<CustomCakeRequestResponseDto> {
  const res = await fetchApi<CustomCakeRequestResponseDto>(`/custom-cake-requests/${ref}?token=${token}`);
  return res.data;
}

export async function acceptCustomCakeQuote(ref: string, quoteId: string, token: string): Promise<CustomCakeRequestResponseDto> {
  const res = await fetchApi<CustomCakeRequestResponseDto>(`/custom-cake-requests/${ref}/quotes/${quoteId}/accept?token=${token}`, {
    method: "POST",
  });
  return res.data;
}

export async function declineCustomCakeQuote(ref: string, quoteId: string, token: string): Promise<CustomCakeRequestResponseDto> {
  const res = await fetchApi<CustomCakeRequestResponseDto>(`/custom-cake-requests/${ref}/quotes/${quoteId}/decline?token=${token}`, {
    method: "POST",
  });
  return res.data;
}

// Admin APIs
export async function getAdminMetrics(): Promise<DashboardMetricsDto> {
  const res = await fetchApi<DashboardMetricsDto>("/admin/dashboard/metrics");
  return res.data;
}

export interface PagedOrdersResponse {
  content: OrderResponseDto[];
  totalElements: number;
  totalPages: number;
}

export async function getAdminOrders(status?: string, page = 0, size = 20): Promise<PagedOrdersResponse> {
  const query = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (status) query.append("status", status);

  const res = await fetchApi<PagedOrdersResponse>(`/admin/orders?${query.toString()}`);
  return res.data;
}

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string): Promise<OrderResponseDto> {
  const res = await fetchApi<OrderResponseDto>(`/admin/orders/${orderId}/status`, {
    method: "POST",
    body: JSON.stringify({ newStatus, note }),
  });
  return res.data;
}

export async function getAdminPayments(status?: string): Promise<PaymentResponseDto[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetchApi<PaymentResponseDto[]>(`/admin/payments${query}`);
  return res.data;
}

export async function approvePayment(paymentId: string, note?: string): Promise<PaymentResponseDto> {
  const res = await fetchApi<PaymentResponseDto>(`/admin/payments/${paymentId}/approve`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return res.data;
}

export async function rejectPayment(paymentId: string, note: string): Promise<PaymentResponseDto> {
  const res = await fetchApi<PaymentResponseDto>(`/admin/payments/${paymentId}/reject`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return res.data;
}

export interface PagedCustomCakesResponse {
  content: CustomCakeRequestResponseDto[];
  totalElements: number;
  totalPages: number;
}

export async function getAdminCustomCakes(status?: string, page = 0, size = 20): Promise<PagedCustomCakesResponse> {
  const query = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (status) query.append("status", status);

  const res = await fetchApi<PagedCustomCakesResponse>(`/admin/custom-cake-requests?${query.toString()}`);
  return res.data;
}

export async function submitAdminQuote(requestId: string, quote: { quotedPrice: number; termsAndDetails: string; expiresInHours?: number }): Promise<CustomCakeRequestResponseDto> {
  const res = await fetchApi<CustomCakeRequestResponseDto>(`/admin/custom-cake-requests/${requestId}/quote`, {
    method: "POST",
    body: JSON.stringify(quote),
  });
  return res.data;
}

export async function getStoreSettings(): Promise<StoreSettingDto[]> {
  const res = await fetchApi<StoreSettingDto[]>("/admin/settings");
  return res.data;
}

export async function updateStoreSetting(key: string, value: string): Promise<StoreSettingDto> {
  const res = await fetchApi<StoreSettingDto>(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
  return res.data;
}

export async function getPublicStoreSettings(): Promise<Record<string, string>> {
  const res = await fetchApi<Record<string, string>>("/settings");
  return res.data;
}

export interface CreateCategoryRequest {
  nameAr: string;
  nameEn?: string;
  slug: string;
  displayOrder?: number;
  imageStorageKey?: string;
  isActive?: boolean;
}

export interface CreateProductRequest {
  categoryId: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  productType: "CUPCAKE" | "CAKE" | "GATEAU" | "ORIENTAL" | "WESTERN" | "BOX" | "CUSTOM";
  sellingUnit: "PIECE" | "BOX" | "WEIGHT" | "CONFIGURABLE";
  basePrice: number;
  prepLeadHours?: number;
  stockQuantity?: number;
  isPreOrder?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  displayOrder?: number;
  primaryImageUrl?: string;
}

export interface CustomerAdminDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  customerTier?: "NORMAL" | "VIP" | "BLOCKED" | string;
  loyaltyPoints?: number;
  isAdmin: boolean;
  avatarUrl?: string;
  address?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export async function getAdminCustomers(): Promise<CustomerAdminDto[]> {
  const res = await fetchApi<CustomerAdminDto[]>("/admin/customers");
  return res.data;
}

export async function updateCustomerAdmin(id: string, data: { loyaltyPoints?: number; customerTier?: string; status?: string }): Promise<CustomerAdminDto> {
  const res = await fetch(`/api/v1/admin/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "فشل تحديث العميل");
  return json.data;
}

export async function getCustomerOrders(id: string): Promise<any[]> {
  const res = await fetch(`/api/v1/admin/customers/${id}/orders`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "فشل جلب طلبات العميل");
  return json.data;
}

export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!json.success || !json.url) {
    throw new Error(json.message || "فشل رفع الصورة");
  }
  return json.url;
}

export interface ReviewItemDto {
  id: string;
  productId: string;
  productNameAr?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateAdminReviewRequest {
  productId?: string;
  customerName: string;
  rating: number;
  comment: string;
  isFeatured?: boolean;
}

export async function getFeaturedReviews(): Promise<ReviewItemDto[]> {
  const res = await fetchApi<ReviewItemDto[]>("/reviews/featured");
  return res.data || [];
}

export async function getAdminReviews(): Promise<ReviewItemDto[]> {
  const res = await fetchApi<ReviewItemDto[]>("/admin/reviews");
  return res.data || [];
}

export async function createAdminReview(data: CreateAdminReviewRequest): Promise<ReviewItemDto> {
  const res = await fetchApi<ReviewItemDto>("/admin/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminReview(id: string): Promise<void> {
  await fetchApi<void>(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
}

export async function createAdminCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
  const res = await fetchApi<CategoryDto>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function createAdminProduct(data: CreateProductRequest): Promise<ProductDto> {
  const res = await fetchApi<ProductDto>("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminProduct(productId: string, data: Partial<CreateProductRequest>): Promise<ProductDto> {
  const res = await fetchApi<ProductDto>(`/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await fetchApi<void>(`/admin/products/${productId}`, {
    method: "DELETE",
  });
}

export async function updateAdminCategory(categoryId: string, data: Partial<CreateCategoryRequest>): Promise<CategoryDto> {
  const res = await fetchApi<CategoryDto>(`/admin/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminCategory(categoryId: string): Promise<void> {
  await fetchApi<void>(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function toggleAdminProductStatus(productId: string): Promise<void> {
  await fetchApi<void>(`/admin/products/${productId}/toggle-status`, {
    method: "PATCH",
  });
}

// Integrations, Automation & Rescheduling
export async function rescheduleOrder(
  orderId: string, 
  newDate: string, 
  newTimeSlotId?: string, 
  note?: string
): Promise<OrderResponseDto> {
  const res = await fetchApi<OrderResponseDto>(`/admin/orders/${orderId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({
      newDate,
      newTimeSlotId: newTimeSlotId || null,
      note: note || null,
    }),
  });
  return res.data;
}

export interface DailyReminderSummary {
  targetDate: string;
  totalOrdersDue: number;
  chefWhatsAppMessage: string;
  customerReminders: Array<{
    orderId: string;
    publicOrderNumber: string;
    customerName: string;
    customerPhone: string;
    timeRange: string;
    fulfillmentType: string;
    customerWhatsAppMessage: string;
  }>;
}

export async function getDailyReminders(date?: string): Promise<DailyReminderSummary> {
  const query = date ? `?date=${date}` : "";
  const res = await fetchApi<DailyReminderSummary>(`/admin/integrations/reminders${query}`, {
    method: "GET",
  });
  return res.data;
}

export async function publishProductToN8n(productId: string): Promise<{
  success: boolean;
  message: string;
  webhookUrl: string;
  facebookPageUrl: string;
  productNameAr: string;
  payload: unknown;
}> {
  const res = await fetchApi<{
    success: boolean;
    message: string;
    webhookUrl: string;
    facebookPageUrl: string;
    productNameAr: string;
    payload: unknown;
  }>(`/admin/integrations/n8n/publish-product/${productId}`, {
    method: "POST",
  });
  return res.data;
}

// Authentication & Customer Profile
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  isAdmin?: boolean;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
  message: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  isAdmin?: boolean;
  avatarUrl?: string | null;
  address?: string;
  createdAt: string;
  recentOrders: OrderResponseDto[];
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
}

export async function registerUser(req: RegisterRequest): Promise<AuthResponse> {
  const res = await fetchApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function loginUser(req: LoginRequest): Promise<AuthResponse> {
  const res = await fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  const res = await fetchApi<UserProfile>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateUserProfile(token: string, req: UpdateProfileRequest): Promise<UserProfile> {
  const res = await fetchApi<UserProfile>("/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function getProductDetail(identifier: string): Promise<ProductDto> {
  const res = await fetchApi<ProductDto>(`/products/${identifier}`);
  return res.data;
}

// Admin Delivery Zones CRUD
export async function getAdminDeliveryZones(): Promise<DeliveryZoneDto[]> {
  const res = await fetchApi<DeliveryZoneDto[]>("/admin/delivery-zones");
  return res.data;
}

export async function createDeliveryZone(data: Partial<DeliveryZoneDto>): Promise<DeliveryZoneDto> {
  const res = await fetchApi<DeliveryZoneDto>("/admin/delivery-zones", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateDeliveryZone(id: string, data: Partial<DeliveryZoneDto>): Promise<DeliveryZoneDto> {
  const res = await fetchApi<DeliveryZoneDto>(`/admin/delivery-zones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  await fetchApi(`/admin/delivery-zones/${id}`, { method: "DELETE" });
}

// Password Reset
export async function resetPassword(identifier: string, newPassword: string): Promise<string> {
  const res = await fetchApi<string>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ identifier, newPassword }),
  });
  return res.data;
}

// Admin Coupons CRUD
export interface CouponDto {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  maxUses?: number | null;
  usageLimit?: number | null;
  usageCount?: number;
  usesCount: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type CreateCouponRequest = Partial<CouponDto>;

export async function getAdminCoupons(): Promise<CouponDto[]> {
  const res = await fetchApi<CouponDto[]>("/admin/coupons");
  return res.data;
}

export async function createAdminCoupon(data: Partial<CouponDto>): Promise<CouponDto> {
  const res = await fetchApi<CouponDto>("/admin/coupons", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminCoupon(id: string, data: Partial<CouponDto>): Promise<CouponDto> {
  const res = await fetchApi<CouponDto>(`/admin/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function toggleAdminCoupon(id: string): Promise<CouponDto> {
  const res = await fetchApi<CouponDto>(`/admin/coupons/${id}/toggle`, {
    method: "PATCH",
  });
  return res.data;
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  await fetchApi(`/admin/coupons/${id}`, { method: "DELETE" });
}

// Product Reviews
export interface ProductReviewDto {
  id: string;
  productId: string;
  userId?: string | null;
  customerName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export async function getProductReviews(productId: string): Promise<ProductReviewDto[]> {
  const res = await fetchApi<ProductReviewDto[]>(`/products/${productId}/reviews`);
  return res.data;
}

export async function createProductReview(
  productId: string,
  data: { customerName: string; rating: number; comment?: string; userId?: string }
): Promise<ProductReviewDto> {
  const res = await fetchApi<ProductReviewDto>(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// Customer Cancel Order
export async function cancelCustomerOrder(publicOrderNumber: string, reason?: string): Promise<OrderTrackingDto> {
  const res = await fetchApi<OrderTrackingDto>(`/orders/${publicOrderNumber}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.data;
}




