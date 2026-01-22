import axiosInstance from "@/core/interceptors/axios.instance";
import type { BaseResponse } from "@/core/models/base-response.model";
import type {
  CheckoutConfirmRequest,
  CheckoutConfirmResponse,
} from "@/domain/models/cart.model";

class CheckoutService {
  /**
   * Lấy headers cho checkout requests
   * Tương tự CartService - xử lý cartToken và Authorization
   */
  private getHeaders(cartToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cartToken) {
      headers["X-Cart-Token"] = cartToken;
    }

    return headers;
  }

  /**
   * Xác nhận checkout và tạo đơn hàng
   */
  async confirmCheckout(
    data: CheckoutConfirmRequest,
    cartToken?: string
  ): Promise<CheckoutConfirmResponse> {
    const response = await axiosInstance.post<
      BaseResponse<CheckoutConfirmResponse>
    >("/api/checkout/confirm", data, {
      headers: this.getHeaders(cartToken),
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể xác nhận đơn hàng"
      );
    }

    return response.data.data;
  }
}

export default new CheckoutService();

