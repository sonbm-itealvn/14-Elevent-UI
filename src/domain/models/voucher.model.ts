export type DiscountType = 'PERCENT' | 'AMOUNT';

export interface Voucher {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  quantity: number;
  usageLimitPerUser?: number;
  active: boolean;
  createdAt: string;
  totalUsage?: number;
  remainingQuantity?: number;
}

export interface VoucherPageResponse {
  content: Voucher[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateVoucherRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  quantity: number;
  usageLimitPerUser?: number;
  active?: boolean;
}

export interface UpdateVoucherRequest {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  usageLimitPerUser?: number;
  active?: boolean;
}

export interface ToggleVoucherActiveRequest {
  active: boolean;
}

export interface VoucherUsage {
  id: number;
  userEmail: string;
  userId?: number;
  orderId: number;
  discountAmount: number;
  usedAt: string;
}

export interface VoucherUsageStatsResponse {
  totalUsage: number;
  recentUsage: VoucherUsage[];
}

export interface ApplyVoucherRequest {
  voucherCode: string;
}

