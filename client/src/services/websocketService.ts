import { io, Socket } from 'socket.io-client'
import type { Message } from './chatService'

export interface SocketMessage {
  conversationId: string
  message: string
  senderId: string
}

class WebSocketService {
  private socket: Socket | null = null
  private isConnected = false

  /**
   * Initialize websocket connection
   */
  connect (token: string): void {
    if (this.socket?.connected) {
      return
    }

    const serverUrl =
      import.meta.env.VITE_API_URL?.replace('/api', '') ||
      'http://localhost:4000'

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to websocket server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket server')
      this.isConnected = false
    })

    this.socket.on('connect_error', error => {
      console.error('Websocket connection error:', error)
      this.isConnected = false
    })
  }

  /**
   * Disconnect from websocket server
   */
  disconnect (): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation (conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinConversation', conversationId)
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation (conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveConversation', conversationId)
    }
  }

  /**
   * Send a message via websocket
   */
  sendMessage (data: SocketMessage): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', data)
    }
  }

  /**
   * Listen for incoming messages
   */
  onMessageReceived (callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('messageReceived', callback)
    }
  }

  /**
   * Remove message listener
   */
  offMessageReceived (): void {
    if (this.socket) {
      this.socket.off('messageReceived')
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping (conversationId: string, userId: string, userName: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { conversationId, userId, userName })
    }
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping (conversationId: string, userId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', { conversationId, userId })
    }
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping (
    callback: (data: { userId: string; userName: string }) => void
  ): void {
    if (this.socket) {
      this.socket.on('userTyping', callback)
    }
  }

  /**
   * Listen for stop typing indicators
   */
  onUserStoppedTyping (callback: (data: { userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback)
    }
  }

  /**
   * Mark messages as seen
   */
  markAsSeen (conversationId: string, userId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('markAsSeen', { conversationId, userId })
    }
  }

  /**
   * Listen for messages seen events
   */
  onMessagesSeen (
    callback: (data: { userId: string; seenAt: Date }) => void
  ): void {
    if (this.socket) {
      this.socket.on('messagesSeen', callback)
    }
  }

  /**
   * Remove all typing and seen listeners
   */
  offTypingAndSeenListeners (): void {
    if (this.socket) {
      this.socket.off('userTyping')
      this.socket.off('userStoppedTyping')
      this.socket.off('messagesSeen')
    }
  }

  /**
   * Check if websocket is connected
   */
  isSocketConnected (): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket (): Socket | null {
    return this.socket
  }
}

export default new WebSocketService()
