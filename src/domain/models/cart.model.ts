export interface CartItemResponse {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  /** Ảnh sản phẩm / biến thể (API trả về) */
  imageUrl?: string;
  quantity: number;
  /** Giá người dùng thực trả (đã áp dụng sale) */
  price: number;
  /** Giá gốc ban đầu chưa giảm của biến thể */
  originalPrice?: number;
  /** Tổng phụ dòng = price * quantity (backend tính theo giá sale) */
  lineTotal: number;
}

export interface CartResponse {
  cartToken: string | null; // Token cho guest cart (null nếu là user cart)
  userCart: boolean; // true nếu là user cart, false nếu là guest cart
  items: CartItemResponse[];
  totalItems: number; // Tổng số lượng sản phẩm (tổng quantity)
  subtotal: number; // Tổng tiền trước giảm giá
}

export interface AddItemRequest {
  productVariantId: number;
  quantity: number;
}

export interface UpdateItemQuantityRequest {
  quantity: number;
}

export interface CheckoutItemResponse {
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  attributes?: Record<string, any>;
  quantity: number;
  /** Giá đơn vị người dùng thực trả (đã áp dụng sale) */
  unitPrice: number;
  /** Giá gốc ban đầu chưa giảm (để hiển thị gạch ngang khi đang sale) */
  originalPrice?: number;
  lineTotal: number;
  priceAtAdd: number;
  priceChanged: boolean;
}

export interface VoucherInfo {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscount: number | null;
}

export interface CheckoutPreviewResponse {
  items: CheckoutItemResponse[];
  subtotal: number; // Tổng tiền sản phẩm (tính theo giá hiện tại)
  shippingFee: number; // Phí vận chuyển
  discount: number; // Số tiền giảm giá từ voucher
  total: number; // Tổng tiền cuối cùng = subtotal + shippingFee - discount
  priceChangeWarning: string | null; // Cảnh báo nếu có giá thay đổi
  appliedVoucher: VoucherInfo | null; // Thông tin voucher đã áp dụng
}

// Checkout Confirm Request/Response
export interface CheckoutConfirmRequest {
  buyerEmail?: string; // Bắt buộc cho guest, optional cho user
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingCity: string;
  paymentMethod: 'COD' | 'BANKING' | 'VNPAY' | 'MOMO';
  expectedTotal?: number;
  note?: string;
}

export interface CheckoutConfirmResponse {
  orderId: number;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  paymentUrl: string | null; // null cho COD
}

