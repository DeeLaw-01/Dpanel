import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChat } from '@/hooks/useChat'

export default function NotificationBell () {
  const { notifications, unreadCount, clearNotifications } = useChat()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`

    const diffInHours = diffInMinutes / 60
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`

    const diffInDays = diffInHours / 24
    return `${Math.floor(diffInDays)}d ago`
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 rounded-full hover:bg-[var(--accent)]/10 transition-colors bg-transparent'
        aria-label='Notifications'
      >
        <Bell size={20} className='text-[var(--foreground)]' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 max-h-96 overflow-hidden'>
          <div className='p-4 border-b border-[var(--border)] flex items-center justify-between'>
            <h3 className='font-medium text-[var(--foreground)]'>
              Notifications
            </h3>
            {notifications.length > 0 && (
              <Button
                onClick={clearNotifications}
                variant='outline'
                size='sm'
                className='text-xs'
              >
                Clear all
              </Button>
            )}
          </div>

          <div className='max-h-80 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='p-8 text-center'>
                <Bell
                  className='mx-auto mb-2 text-[var(--muted-foreground)]'
                  size={32}
                />
                <p className='text-sm text-[var(--muted-foreground)]'>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className='divide-y divide-[var(--border)]'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[var(--accent)]/5 transition-colors ${
                      !notification.read ? 'bg-[var(--accent)]/10' : ''
                    }`}
                  >
                    {notification.type === 'message' && notification.data ? (
                      <Link
                        to={`/chat/${notification.data.conversationId}`}
                        className='block'
                        onClick={() => setIsOpen(false)}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex-shrink-0'>
                            <MessageSquare size={16} />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-[var(--foreground)]'>
                              {notification.title}
                            </p>
                            <p className='text-sm text-[var(--muted-foreground)] truncate'>
                              {notification.message}
                            </p>
                            <p className='text-xs text-[var(--muted-foreground)] mt-1'>
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className='flex items-start gap-3'>
                        <div className='p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex-shrink-0'>
                          <Bell size={16} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-[var(--foreground)]'>
                            {notification.title}
                          </p>
                          <p className='text-sm text-[var(--muted-foreground)]'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-[var(--muted-foreground)] mt-1'>
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
