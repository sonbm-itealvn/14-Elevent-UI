import axiosInstance from "@/core/interceptors/axios.instance";
import type { BaseResponse } from "@/core/models/base-response.model";
import type { ApplyVoucherRequest } from "@/domain/models/voucher.model";
import type {
  CartResponse,
  AddItemRequest,
  UpdateItemQuantityRequest,
  CheckoutPreviewResponse,
} from "@/domain/models/cart.model";

class CartService {
  /**
   * Lấy headers cho cart requests
   * 
   * Logic:
   * - Nếu có cartToken (guest cart): chỉ gửi X-Cart-Token, KHÔNG gửi Authorization
   * - Nếu không có cartToken (user cart): chỉ gửi Authorization (tự động bởi axios interceptor)
   * - Không bao giờ gửi cả hai cùng lúc trừ khi đang merge (merge sẽ tự động xử lý)
   * 
   * Lưu ý: 
   * - Authorization header được thêm tự động bởi axios interceptor nếu có token
   * - Khi có cartToken (guest), cần xóa Authorization header để tránh gửi nhầm
   */
  private getHeaders(cartToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Nếu có cartToken (guest cart), chỉ gửi X-Cart-Token
    // KHÔNG gửi Authorization header (sẽ được xóa trong request config)
    if (cartToken) {
      headers["X-Cart-Token"] = cartToken;
    }

    return headers;
  }

  /**
   * Lấy request config với headers đã xử lý
   * 
   * @param cartToken token của guest cart
   * @param options.allowAuthWithCartToken cho phép gửi kèm Authorization cùng X-Cart-Token (chỉ dùng khi merge)
   */
  private getRequestConfig(
    cartToken?: string,
    options?: { allowAuthWithCartToken?: boolean }
  ): { headers: Record<string, string> } {
    const headers = this.getHeaders(cartToken);
    if (options?.allowAuthWithCartToken) {
      headers["X-Allow-Auth-With-Cart-Token"] = "true";
    }
    return { headers };
  }

  /**
   * Lấy giỏ hàng hiện tại
   */
  async getCart(cartToken?: string): Promise<CartResponse> {
    const response = await axiosInstance.get<BaseResponse<CartResponse>>(
      "/api/cart",
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể lấy giỏ hàng");
    }
    return response.data.data;
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItem(
    productVariantId: number,
    quantity: number,
    cartToken?: string
  ): Promise<CartResponse> {
    const request: AddItemRequest = { productVariantId, quantity };
    const config = this.getRequestConfig(cartToken);
    const response = await axiosInstance.post<BaseResponse<CartResponse>>(
      "/api/cart/items",
      request,
      config
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể thêm sản phẩm vào giỏ hàng"
      );
    }
    return response.data.data;
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateItemQuantity(
    itemId: number,
    quantity: number,
    cartToken?: string
  ): Promise<CartResponse> {
    const request: UpdateItemQuantityRequest = { quantity };
    const response = await axiosInstance.patch<BaseResponse<CartResponse>>(
      `/api/cart/items/${itemId}`,
      request,
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể cập nhật số lượng sản phẩm"
      );
    }
    return response.data.data;
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeItem(itemId: number, cartToken?: string): Promise<void> {
    const response = await axiosInstance.delete<BaseResponse<void>>(
      `/api/cart/items/${itemId}`,
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể xóa sản phẩm");
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(cartToken?: string): Promise<void> {
    const response = await axiosInstance.delete<BaseResponse<void>>(
      "/api/cart",
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể xóa giỏ hàng");
    }
  }

  /**
   * Merge guest cart vào user cart
   * 
   * Lưu ý: Khi merge, cần gửi cả X-Cart-Token và Authorization header
   * Nên KHÔNG xóa Authorization header trong trường hợp này
   */
  async mergeCart(cartToken: string): Promise<CartResponse> {
    // Cho phép gửi cả X-Cart-Token và Authorization
    const response = await axiosInstance.post<BaseResponse<CartResponse>>(
      "/api/cart/merge",
      {},
      this.getRequestConfig(cartToken, { allowAuthWithCartToken: true })
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể merge giỏ hàng"
      );
    }
    return response.data.data;
  }

  /**
   * Áp dụng voucher vào giỏ hàng
   */
  async applyVoucher(
    voucherCode: string,
    cartToken?: string
  ): Promise<void> {
    const response = await axiosInstance.put<BaseResponse<void>>(
      "/api/cart/voucher",
      { voucherCode } as ApplyVoucherRequest,
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể áp dụng voucher");
    }
  }

  /**
   * Xóa voucher khỏi giỏ hàng
   */
  async removeVoucher(cartToken?: string): Promise<void> {
    const response = await axiosInstance.delete<BaseResponse<void>>(
      "/api/cart/voucher",
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể xóa voucher");
    }
  }

  /**
   * Lấy thông tin checkout preview (bao gồm discount từ voucher)
   */
  async getCheckoutPreview(
    cartToken?: string
  ): Promise<CheckoutPreviewResponse> {
    const response = await axiosInstance.get<BaseResponse<CheckoutPreviewResponse>>(
      "/api/checkout/preview",
      this.getRequestConfig(cartToken)
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể lấy thông tin thanh toán"
      );
    }
    return response.data.data;
  }
}

export default new CartService();

