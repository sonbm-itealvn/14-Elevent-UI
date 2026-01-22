import HttpService from "./http.service";
import axiosInstance from "@/core/interceptors/axios.instance";
import type {
  Order,
  AdminOrderPageResponse,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
  ApproveOrderRequest,
  CancelOrderRequest,
  DashboardStatsResponse,
  OrderStatus
} from "@/domain/models/order.model";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

class OrderService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  /**
   * Lấy danh sách đơn hàng (Admin) - GET /api/admin/orders
   */
  async getOrders(params?: {
    page?: number;
    size?: number;
    status?: OrderStatus;
  }): Promise<AdminOrderPageResponse> {
    const response = await this.httpService.get<AdminOrderPageResponse>(
      "/api/admin/orders",
      params
    );
    // HttpService.get() trả về BaseResponse<T>, nên response.data là AdminOrderPageResponse | undefined
    // Xử lý trường hợp data có thể null hoặc orders rỗng - không phải lỗi
    if (!response.data) {
      return {
        orders: [],
        page: params?.page || 0,
        size: params?.size || 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
    return response.data;
  }

  /**
   * Lấy chi tiết đơn hàng (Admin) - GET /api/admin/orders/{orderId}
   */
  async getOrderById(orderId: number): Promise<Order> {
    const response = await this.httpService.get<Order>(
      `/api/admin/orders/${orderId}`
    );
    // HttpService.get() trả về BaseResponse<T>, nên response.data là Order | undefined
    if (!response.data) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    return response.data;
  }

  /**
   * Duyệt đơn hàng - POST /api/admin/orders/{orderId}/approve
   */
  async approveOrder(orderId: number, data?: ApproveOrderRequest): Promise<Order> {
    const response = await this.httpService.post<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/approve`,
      data || {}
    );
    return response.data!.data;
  }

  /**
   * Cập nhật trạng thái đơn hàng - PUT /api/admin/orders/{orderId}/status
   */
  async updateOrderStatus(
    orderId: number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    const response = await this.httpService.put<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/status`,
      data
    );
    return response.data!.data;
  }

  /**
   * Hủy đơn hàng - POST /api/admin/orders/{orderId}/cancel
   */
  async cancelOrder(orderId: number, data: CancelOrderRequest): Promise<void> {
    await this.httpService.post<ApiResponse<void>>(
      `/api/admin/orders/${orderId}/cancel`,
      data
    );
  }

  /**
   * Xác nhận thanh toán COD - POST /api/admin/orders/{orderId}/confirm-cod-payment
   */
  async confirmCodPayment(orderId: number): Promise<void> {
    await this.httpService.post<ApiResponse<void>>(
      `/api/admin/orders/${orderId}/confirm-cod-payment`,
      null
    );
  }

  /**
   * Lấy thống kê dashboard - GET /api/admin/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await this.httpService.get<DashboardStatsResponse>(
      "/api/admin/dashboard/stats"
    );
    return response.data!;
  }

  /**
   * Cập nhật trạng thái thanh toán (deprecated - sử dụng updateOrderStatus)
   */
  async updatePaymentStatus(
    orderId: number,
    data: UpdatePaymentStatusRequest
  ): Promise<Order> {
    const response = await this.httpService.put<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/payment-status`,
      data
    );
    return response.data!.data;
  }

  /**
   * Xuất file Excel doanh thu - GET /api/admin/dashboard/export-revenue
   */
  async exportRevenue(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axiosInstance.get(
      "/api/admin/dashboard/export-revenue",
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Xuất file Excel đơn hàng - GET /api/admin/orders/export
   */
  async exportOrders(params?: {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axiosInstance.get(
      "/api/admin/orders/export",
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data;
  }
}

export default new OrderService();
