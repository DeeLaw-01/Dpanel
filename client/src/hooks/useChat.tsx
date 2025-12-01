import { useEffect, useState } from 'react'
import {
  websocketService,
  notificationService,
  type Notification
} from '@/services'
import useUserStore from '@/store/userStore'

export function useChat () {
  const { user, token } = useUserStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token || !user) {
      // Clean up if user logs out
      websocketService.disconnect()
      notificationService.stopPolling()
      setIsConnected(false)
      setNotifications([])
      return
    }

    // Initialize websocket connection
    websocketService.connect(token)
    setIsConnected(websocketService.isSocketConnected())

    // Start notification polling
    notificationService.startPolling(10000) // Poll every 10 seconds

    // Listen for notifications
    const handleNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications)
    }

    notificationService.addListener(handleNotifications)

    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      setIsConnected(websocketService.isSocketConnected())
    }, 5000)

    return () => {
      notificationService.removeListener(handleNotifications)
      clearInterval(connectionCheckInterval)
    }
  }, [token, user])

  const clearNotifications = () => {
    notificationService.clearNotifications()
    setNotifications([])
  }

  return {
    notifications,
    isConnected,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  }
}
