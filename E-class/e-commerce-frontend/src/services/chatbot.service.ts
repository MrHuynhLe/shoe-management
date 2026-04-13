import { axiosClient } from './axiosClient';

export interface ChatbotAskRequest {
  message: string;
  conversationId?: number | null;
  channel?: string;
}

export interface ChatbotAskResponse {
  conversationId: number;
  intent: string;
  answer: string;
  suggestions: string[];
}

export interface ChatbotHistoryMessage {
  id: number;
  senderType: "USER" | "BOT";
  messageText: string;
  intent?: string;
  createdAt?: string;
}

export const chatbotService = {
  ask(payload: ChatbotAskRequest) {
    return axiosClient.post<ChatbotAskResponse>("/v1/chatbot/ask", payload);
  },

  getMessages(conversationId: number) {
    return axiosClient.get<ChatbotHistoryMessage[]>(
      `/v1/chatbot/conversations/${conversationId}/messages`
    );
  },
};