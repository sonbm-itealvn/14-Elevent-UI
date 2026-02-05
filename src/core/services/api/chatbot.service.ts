import HttpService from "./http.service";

export interface ChatHistory {
  id: string;
  conversationId: string;
  userId?: number;
  userEmail?: string;
  message: string;
  reply: string;
  agent?: string;
  createdAt: string;
}

export interface ChatHistoryPageResponse {
  content: ChatHistory[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

class ChatbotService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getChatHistory(params?: {
    conversationId?: string;
    userEmail?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ChatHistoryPageResponse> {
    const response = await this.httpService.getPaginated<ChatHistory>(
      "/api/admin/chatbot/history",
      params
    );
    return response;
  }

  async updateProductData(): Promise<void> {
    await this.httpService.post("/api/admin/chatbot/update-products", null);
  }

  async updateSystemDocuments(): Promise<void> {
    await this.httpService.post("/api/admin/chatbot/update-documents", null);
  }
}

export default new ChatbotService();

