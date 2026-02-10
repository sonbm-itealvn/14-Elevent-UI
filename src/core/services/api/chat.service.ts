import HttpService from "./http.service";

export interface ChatSession {
  id: number;
  conversationId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  content: string;
  sender: string;
  createdAt: string;
}

export interface ChatSessionsResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  data: ChatSession[];
  timestamp: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  data: ChatMessage[];
  timestamp: string;
}

class ChatService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getSessions(): Promise<ChatSession[]> {
    const response = await this.httpService.get<ChatSession[]>("/api/chat/sessions");
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await this.httpService.get<ChatMessage[]>(
      `/api/chat/sessions/${conversationId}/messages`
    );
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async sendMessage(message: string, conversationId?: string): Promise<{
    conversationId: string;
    reply: string;
  }> {
    const response = await this.httpService.post<{
      conversationId: string;
      reply: string;
    }>("/api/chat", {
      message,
      conversationId,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Failed to send message");
  }
}

export default new ChatService();

