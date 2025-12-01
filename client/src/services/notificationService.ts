import api from '@/api/api'
import chatService from './chatService'
import websocketService from './websocketService'
import useUserStore from '@/store/userStore'
import type { Conversation } from './chatService'

export interface Notification {
  id: string
  type: 'message' | 'friend_request' | 'system'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

class NotificationService {
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastConversationCheck: Date = new Date()
  private listeners: Array<(notifications: Notification[]) => void> = []

  /**
   * Start polling for notifications
   */
  startPolling (intervalMs: number = 5000): void {
    if (this.isPolling) {
      return
    }

    this.isPolling = true
    this.pollingInterval = setInterval(() => {
      this.checkForNotifications()
    }, intervalMs)

    // Listen for WebSocket messages to trigger immediate checks
    websocketService.onMessageReceived(() => {
      console.log(
        '🔔 NotificationService: WebSocket message received, checking notifications...'
      )
      this.forceRefresh()
    })

    // Initial check
    this.checkForNotifications()
  }

  /**
   * Stop polling for notifications
   */
  stopPolling (): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    // Clean up WebSocket listener
    websocketService.offMessageReceived()
    this.isPolling = false
  }

  /**
   * Check for new notifications
   */
  private async checkForNotifications (): Promise<void> {
    try {
      const notifications: Notification[] = []

      // Get unread count from server
      const { unreadCount } = await chatService.getUnreadCount()
      console.log('🔔 Notification check - Unread count:', unreadCount)

      if (unreadCount > 0) {
        // Check for new messages in conversations
        const conversations = await this.getRecentConversations()
        console.log('🔔 Found conversations:', conversations.length)
        const messageNotifications =
          this.processConversationNotifications(conversations)
        console.log('🔔 Created notifications:', messageNotifications.length)
        notifications.push(...messageNotifications)
      }

      // Notify all listeners
      this.notifyListeners(notifications)
    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }

  /**
   * Get recent conversations to check for new messages
   */
  private async getRecentConversations (): Promise<Conversation[]> {
    try {
      const response = await api.get('/api/chat/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  /**
   * Process conversations to find new messages
   */
  private processConversationNotifications (
    conversations: Conversation[]
  ): Notification[] {
    const notifications: Notification[] = []
    const currentUserId = this.getCurrentUserId()

    console.log('🔔 Processing conversations for notifications...')
    console.log('🔔 Current user ID:', currentUserId)
    console.log('🔔 Last check time:', this.lastConversationCheck)
    console.log('🔔 Conversations to process:', conversations.length)

    conversations.forEach((conversation, index) => {
      console.log(`🔔 Conversation ${index + 1}:`, {
        id: conversation._id,
        participants: conversation.participants.map(p => ({
          id: p._id,
          name: p.name
        })),
        messageCount: conversation.messages?.length || 0
      })

      if (conversation.messages && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[0]
        const messageTime = new Date(lastMessage.createdAt)

        console.log(`🔔 Last message:`, {
          id: lastMessage._id,
          sender: lastMessage.sender.name,
          senderId: lastMessage.sender._id,
          content: lastMessage.content.substring(0, 30) + '...',
          time: messageTime,
          seenBy: lastMessage.seenBy
        })

        // Check if message is from another user (not current user)
        if (lastMessage.sender._id !== currentUserId) {
          console.log('🔔 Message is from another user, checking if seen...')

          // Check if current user has seen this message
          const hasBeenSeen = lastMessage.seenBy?.some(
            seen => seen.user === currentUserId
          )

          console.log('🔔 Has been seen by current user:', hasBeenSeen)

          // Only create notification if message hasn't been seen
          if (!hasBeenSeen) {
            console.log('🔔 Creating notification for unseen message')
            notifications.push({
              id: `message_${lastMessage._id}`,
              type: 'message',
              title: `New message from ${lastMessage.sender.name}`,
              message:
                lastMessage.content.length > 50
                  ? lastMessage.content.substring(0, 50) + '...'
                  : lastMessage.content,
              data: {
                conversationId: conversation._id,
                senderId: lastMessage.sender._id,
                senderName: lastMessage.sender.name
              },
              read: false,
              createdAt: lastMessage.createdAt
            })
          } else {
            console.log('🔔 Message already seen, skipping notification')
          }
        } else {
          console.log('🔔 Message is from current user, skipping')
        }
      }
    })

    console.log('🔔 Total notifications created:', notifications.length)
    return notifications
  }

  /**
   * Get current user ID from the user store
   */
  private getCurrentUserId (): string {
    try {
      const user = useUserStore.getState().user
      return user?.id || ''
    } catch (error) {
      console.error('Error getting current user ID:', error)
      return ''
    }
  }

  /**
   * Add a notification listener
   */
  addListener (callback: (notifications: Notification[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * Remove a notification listener
   */
  removeListener (callback: (notifications: Notification[]) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners (notifications: Notification[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(notifications)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  }

  /**
   * Manually trigger a notification check
   */
  async checkNow (): Promise<void> {
    await this.checkForNotifications()
  }

  /**
   * Force refresh notifications (resets last check time)
   */
  async forceRefresh (): Promise<void> {
    console.log('🔔 Force refreshing notifications...')
    // Reset last check to get all recent messages
    this.lastConversationCheck = new Date(Date.now() - 60000) // 1 minute ago
    await this.checkForNotifications()
  }

  /**
   * Clear all notifications (mark as read)
   */
  clearNotifications (): void {
    this.notifyListeners([])
  }

  /**
   * Get current unread count from server
   */
  async getUnreadCount (): Promise<number> {
    try {
      const { unreadCount } = await chatService.getUnreadCount()
      return unreadCount
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export default new NotificationService()
