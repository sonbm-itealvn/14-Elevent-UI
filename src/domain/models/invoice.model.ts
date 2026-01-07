export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  order?: {
    id: number;
    orderNumber: string;
    totalAmount: number;
  };
  amount: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface InvoicePageResponse {
  content: Invoice[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  period: {
    start: string;
    end: string;
  };
  dailyRevenue?: DailyRevenue[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface CreateInvoiceRequest {
  orderId: number;
  amount: number;
  tax?: number;
  discount?: number;
  dueDate?: string;
}

export interface UpdateInvoiceRequest {
  amount?: number;
  tax?: number;
  discount?: number;
  status?: InvoiceStatus;
  dueDate?: string;
}

