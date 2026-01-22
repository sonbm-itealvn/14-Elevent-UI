import HttpService from "./http.service";
import type {
  Voucher,
  VoucherPageResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  ToggleVoucherActiveRequest,
  VoucherUsageStatsResponse,
} from "@/domain/models/voucher.model";

class VoucherService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getVouchers(params?: {
    code?: string;
    active?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<VoucherPageResponse> {
    const response = await this.httpService.getPaginated<Voucher>(
      "/api/admin/vouchers",
      params
    );
    return response;
  }

  async getVoucherById(id: number): Promise<Voucher> {
    const response = await this.httpService.get<Voucher>(
      `/api/admin/vouchers/${id}`
    );
    return response.data!;
  }

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    const response = await this.httpService.post<Voucher>(
      "/api/admin/vouchers",
      data
    );
    return response.data!;
  }

  async updateVoucher(
    id: number,
    data: UpdateVoucherRequest
  ): Promise<Voucher> {
    const response = await this.httpService.put<Voucher>(
      `/api/admin/vouchers/${id}`,
      data
    );
    return response.data!;
  }

  async toggleActive(
    id: number,
    data: ToggleVoucherActiveRequest
  ): Promise<void> {
    await this.httpService.put(`/api/admin/vouchers/${id}/active`, data);
  }

  async deleteVoucher(id: number): Promise<void> {
    await this.httpService.delete(`/api/admin/vouchers/${id}`);
  }

  async getUsageStats(
    id: number,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<VoucherUsageStatsResponse> {
    const response = await this.httpService.get<VoucherUsageStatsResponse>(
      `/api/admin/vouchers/${id}/usage`,
      params
    );
    return response.data!;
  }
}

export default new VoucherService();

