import HttpService from "./http.service";
import type { 
  Order, 
  OrderPageResponse,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest 
} from "@/domain/models/order.model";
import type { BasePaginationResponse } from "@/core/models/base-pagination-response.model";

class OrderService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getOrders(params?: {
    page?: number;
    size?: number;
  }): Promise<OrderPageResponse> {
    // Admin uses /api/orders to see all orders (requires authentication)
    const response = await this.httpService.getPaginated<Order>(
      "/api/orders",
      params
    );
    return response;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const response = await this.httpService.get<Order>(
      `/api/orders/${orderId}`
    );
    return response.data!;
  }

  async updateOrderStatus(
    orderId: number, 
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    // Note: These endpoints might need to be created on backend
    // For now, using placeholder endpoints
    const response = await this.httpService.put<Order>(
      `/api/admin/orders/${orderId}/status`,
      data
    );
    return response.data!;
  }

  async updatePaymentStatus(
    orderId: number, 
    data: UpdatePaymentStatusRequest
  ): Promise<Order> {
    // Note: These endpoints might need to be created on backend
    const response = await this.httpService.put<Order>(
      `/api/admin/orders/${orderId}/payment-status`,
      data
    );
    return response.data!;
  }
}

export default new OrderService();

