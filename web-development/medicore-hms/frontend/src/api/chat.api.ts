import apiClient from './client';
import { ChatMessage, Conversation } from '../types/chat.types';

export async function listConversations(): Promise<Conversation[]> {
  const r = await apiClient.get<{ data: Conversation[] }>('/api/chat/conversations');
  return r.data.data;
}

export async function startConversation(participantId: string, subject?: string): Promise<Conversation> {
  const r = await apiClient.post<Conversation>('/api/chat/conversations', { participantId, subject });
  return r.data;
}

export async function getMessages(conversationId: string, page = 1): Promise<{ data: ChatMessage[]; total: number; totalPages: number }> {
  const r = await apiClient.get(`/api/chat/conversations/${conversationId}/messages`, { params: { page, limit: 50 } });
  return r.data;
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const r = await apiClient.post<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, { text });
  return r.data;
}

export async function getUnreadCount(): Promise<number> {
  const r = await apiClient.get<{ unread: number }>('/api/chat/unread');
  return r.data.unread;
}
