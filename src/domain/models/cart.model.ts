export interface CartItemResponse {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  quantity: number;
  price: number; // Giá tại thời điểm thêm vào giỏ (priceAtAdd)
  lineTotal: number; // price * quantity
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
  unitPrice: number; // Giá hiện tại
  lineTotal: number;
  priceAtAdd: number; // Giá tại thời điểm thêm vào giỏ
  priceChanged: boolean; // true nếu giá hiện tại khác priceAtAdd
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

