import HttpService from "./http.service";

// Lịch sử hội thoại chi tiết (giữ cho admin nếu cần dùng sau)
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

// Người dùng có lịch sử chat
export interface ChatUser {
  id: number;
  fullName?: string;
  email?: string;
  avatar?: string;
  lastChatTime?: string;
  sessionCount?: number;
}

// Session hội thoại theo user
export interface ChatUserSession {
  id: number;
  conversationId: string;
  title?: string;
  createdAt: string;
}

// Tin nhắn trong một session (dùng cho admin khi xem lịch sử)
export interface ChatSessionMessage {
  content: string;
  sender: string;
  createdAt: string;
}

class ChatbotService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  // Danh sách người dùng có lịch sử chat
  async getChatUsers(): Promise<ChatUser[]> {
    const response = await this.httpService.get<ChatUser[]>(
      "/api/admin/chat/users"
    );

    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Danh sách session chat của một user
  async getUserSessions(userId: number): Promise<ChatUserSession[]> {
    const response = await this.httpService.get<ChatUserSession[]>(
      `/api/admin/chat/users/${userId}/sessions`
    );

    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Lịch sử tin nhắn của một session theo conversationId
  async getSessionMessages(
    conversationId: string
  ): Promise<ChatSessionMessage[]> {
    const response = await this.httpService.get<ChatSessionMessage[]>(
      `/api/chat/sessions/${conversationId}/messages`
    );

    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Lịch sử hội thoại chi tiết (theo conversation / email)
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


