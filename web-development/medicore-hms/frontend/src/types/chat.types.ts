export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: { _id: string; username: string; role: string };
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: { _id: string; username: string; role: string }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
