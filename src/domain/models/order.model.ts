export interface Order {
  id: number;
  buyerEmail?: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingCity: string;
  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentTxnRef?: string;
  paymentTransactionNo?: string;
  paymentPaidAt?: string;
  note?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  attributes?: Record<string, any>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
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

export interface OrderPageResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

