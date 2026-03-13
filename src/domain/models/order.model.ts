// Order Model based on ADMIN_ORDER_ENDPOINTS.md

export interface Order {
  id: number;
  orderCode?: string;
  userId?: number;
  buyerEmail?: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingCity: string;
  // Các trường này có thể không có trong list response, chỉ có trong detail
  subtotal?: number;
  shippingFee?: number;
  voucherDiscount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentTxnRef?: string;
  paymentTransactionNo?: string;
  paymentPaidAt?: string;
  note?: string;
  trackingUrl?: string;
  // items có thể không có trong list response, chỉ có trong detail
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
  itemCount?: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productVariantId: number;
  /** Slug sản phẩm để link sang trang chi tiết (API trả về) */
  productSlug?: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  attributes?: Record<string, any>;
  quantity: number;
  /** Giá đơn vị thực trả (đã áp dụng sale) */
  unitPrice: number;
  /** Giá gốc ban đầu chưa giảm (hiển thị gạch ngang khi đang sale) */
  originalPrice?: number;
  lineTotal: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANKING = 'BANKING',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
}

// Response types for Admin API
export interface AdminOrderPageResponse {
  orders: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OrderPageResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Request types
export interface ApproveOrderRequest {
  note?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
  trackingUrl?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

// Dashboard Stats Response
export interface DashboardStatsResponse {
  overall: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  };
  revenue: {
    todayRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
    thisYearRevenue: number;
    dailyRevenueLast7Days: Array<{
      date: string;
      revenue: number;
      orderCount: number;
    }>;
    monthlyRevenueLast12Months: Array<{
      year: number;
      month: number;
      revenue: number;
      orderCount: number;
    }>;
  };
  orderCounts: {
    todayOrders: number;
    thisWeekOrders: number;
    thisMonthOrders: number;
    thisYearOrders: number;
  };
  recentOrders: Array<{
    orderId: number;
    buyerEmail: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}
