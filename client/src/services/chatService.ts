import api from '@/api/api'

export interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name: string
    email: string
  }
  conversation: string
  seenBy: Array<{
    user: string
    seenAt: string
  }>
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  _id: string
  participants: Array<{
    _id: string
    name: string
    email: string
    profilePicture?: string
  }>
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface SendMessageData {
  content: string
  conversationId: string
}

export interface CreateConversationData {
  participantId: string
}

class ChatService {
  /**
   * Get all conversations for the current user
   */
  async getConversations (): Promise<Conversation[]> {
    const response = await api.get('/api/chat/conversations')
    return response.data
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation (conversationId: string): Promise<Conversation> {
    const response = await api.get(`/api/chat/conversations/${conversationId}`)
    return response.data
  }

  /**
   * Create or get existing conversation between current user and another user
   */
  async createOrGetConversation (
    data: CreateConversationData
  ): Promise<Conversation> {
    const response = await api.post('/api/chat/conversations', data)
    return response.data
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages (conversationId: string): Promise<Message[]> {
    const response = await api.get(`/api/chat/messages/${conversationId}`)
    return response.data
  }

  /**
   * Send a message via HTTP (fallback when websocket is not available)
   */
  async sendMessage (data: SendMessageData): Promise<void> {
    const response = await api.post('/api/chat/messages', data)
    return response.data
  }

  /**
   * Mark messages as seen in a conversation
   */
  async markMessagesAsSeen (conversationId: string): Promise<void> {
    const response = await api.post(`/api/chat/messages/${conversationId}/seen`)
    return response.data
  }

  /**
   * Get unread message count for current user
   */
  async getUnreadCount (): Promise<{ unreadCount: number }> {
    const response = await api.get('/api/chat/unread-count')
    return response.data
  }
}

export default new ChatService()
