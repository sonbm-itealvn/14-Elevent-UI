import HttpService from "./http.service";
import type { 
  Invoice, 
  InvoicePageResponse,
  RevenueReport,
  CreateInvoiceRequest,
  UpdateInvoiceRequest 
} from "@/domain/models/invoice.model";
class InvoiceService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getInvoices(params?: {
    keyword?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<InvoicePageResponse> {
    const response = await this.httpService.getPaginated<Invoice>(
      "/api/admin/invoices",
      params
    );
    return response;
  }

  async getInvoiceById(invoiceId: number): Promise<Invoice> {
    const response = await this.httpService.get<Invoice>(
      `/api/admin/invoices/${invoiceId}`
    );
    return response.data!;
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await this.httpService.post<Invoice>(
      "/api/admin/invoices",
      data
    );
    return response.data!;
  }

  async updateInvoice(
    invoiceId: number, 
    data: UpdateInvoiceRequest
  ): Promise<Invoice> {
    const response = await this.httpService.put<Invoice>(
      `/api/admin/invoices/${invoiceId}`,
      data
    );
    return response.data!;
  }

  async deleteInvoice(invoiceId: number): Promise<void> {
    await this.httpService.delete(`/api/admin/invoices/${invoiceId}`);
  }

  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueReport> {
    const response = await this.httpService.get<RevenueReport>(
      "/api/admin/revenue",
      params
    );
    return response.data!;
  }
}

export default new InvoiceService();

