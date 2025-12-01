import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  chatService,
  websocketService,
  type Conversation,
  type Message
} from '@/services'
import useUserStore from '@/store/userStore'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react'

export default function ChatPage () {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user: currentUser, token } = useUserStore()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: string; userName: string }>
  >([])
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId) {
      navigate('/dashboard')
      return
    }

    initializeChat()

    return () => {
      // Clean up websocket listeners
      websocketService.offMessageReceived()
      websocketService.offTypingAndSeenListeners()
      if (conversationId) {
        websocketService.leaveConversation(conversationId)
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [conversationId, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    if (!conversationId || !token) return

    try {
      setIsLoading(true)

      // Initialize websocket connection
      websocketService.connect(token)

      // Fetch conversation details
      const conv = await chatService.getConversation(conversationId)
      setConversation(conv)

      // Fetch messages
      const msgs = await chatService.getMessages(conversationId)
      setMessages(msgs)

      // Join conversation room
      websocketService.joinConversation(conversationId)

      // Listen for new messages
      websocketService.onMessageReceived((message: Message) => {
        setMessages(prev => [...prev, message])
      })

      // Listen for typing indicators
      websocketService.onUserTyping(({ userId, userName }) => {
        setTypingUsers(prev => {
          const existing = prev.find(u => u.userId === userId)
          if (!existing) {
            return [...prev, { userId, userName }]
          }
          return prev
        })
      })

      websocketService.onUserStoppedTyping(({ userId }) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId))
      })

      // Listen for seen receipts
      websocketService.onMessagesSeen(({ userId, seenAt }) => {
        setMessages(prev =>
          prev.map(msg => ({
            ...msg,
            seenBy: [
              ...(msg.seenBy || []),
              { user: userId, seenAt: seenAt.toString() }
            ]
          }))
        )
      })

      // Mark messages as seen when entering chat
      if (currentUser) {
        websocketService.markAsSeen(conversationId, currentUser.id)
      }
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to load chat'
      })
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || !currentUser) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    try {
      // Try to send via websocket first
      if (websocketService.isSocketConnected()) {
        websocketService.sendMessage({
          conversationId,
          message: messageContent,
          senderId: currentUser.id
        })
      } else {
        // Fallback to HTTP
        await chatService.sendMessage({
          content: messageContent,
          conversationId
        })

        // Refresh messages if using HTTP fallback
        const msgs = await chatService.getMessages(conversationId)
        setMessages(msgs)
      }
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to send message'
      })
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setIsSending(false)
    }
  }

  const getOtherParticipant = () => {
    if (!conversation || !currentUser) return null
    return conversation.participants.find(p => p._id !== currentUser.id)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Handle typing indicators
    if (value.trim() && conversationId && currentUser) {
      // Send typing indicator
      websocketService.sendTyping(
        conversationId,
        currentUser.id,
        currentUser.name
      )

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      // Set new timeout to stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        websocketService.sendStopTyping(conversationId, currentUser.id)
      }, 2000)

      setTypingTimeout(timeout)
    } else if (conversationId && currentUser) {
      // Stop typing if input is empty
      websocketService.sendStopTyping(conversationId, currentUser.id)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
    }
  }

  const isMessageSeen = (message: Message, otherParticipantId: string) => {
    return message.seenBy?.some(seen => seen.user === otherParticipantId)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] flex items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='animate-spin' size={20} />
          <span>Loading chat...</span>
        </div>
      </div>
    )
  }

  const otherParticipant = getOtherParticipant()

  return (
    <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] flex flex-col'>
      {/* Chat Header */}
      <div className='bg-[var(--dashboard-card)] border-b border-[var(--dashboard-border)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              onClick={() => navigate(-1)}
              variant='outline'
              size='sm'
              className='flex items-center gap-2'
            >
              <ArrowLeft size={16} />
            </Button>

            {otherParticipant && (
              <>
                {otherParticipant.profilePicture ? (
                  <img
                    src={otherParticipant.profilePicture}
                    alt={otherParticipant.name}
                    className='w-10 h-10 rounded-full object-cover'
                    referrerPolicy='no-referrer'
                    crossOrigin='anonymous'
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center'>
                    <User
                      size={20}
                      className='text-[var(--dashboard-text-muted)]'
                    />
                  </div>
                )}
                <div>
                  <h2 className='font-medium'>{otherParticipant.name}</h2>
                  <p className='text-sm text-[var(--dashboard-text-muted)]'>
                    Online
                  </p>
                </div>
              </>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Phone size={16} />
            </Button>
            <Button variant='outline' size='sm'>
              <Video size={16} />
            </Button>
            <Button variant='outline' size='sm'>
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-[var(--dashboard-text-muted)]'>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map(message => {
            const otherParticipant = getOtherParticipant()
            const isSeen =
              otherParticipant && isMessageSeen(message, otherParticipant._id)
            const isOwnMessage = message.sender._id === currentUser?.id

            return (
              <div
                key={message._id}
                className={`flex ${
                  isOwnMessage ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]'
                  }`}
                >
                  <p className='text-sm'>{message.content}</p>
                  <div className='flex items-center justify-between mt-1'>
                    <p
                      className={`text-xs ${
                        isOwnMessage
                          ? 'text-white/70'
                          : 'text-[var(--dashboard-text-muted)]'
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </p>
                    {isOwnMessage && (
                      <span
                        className={`text-xs ml-2 ${
                          isSeen ? 'text-blue-300' : 'text-white/50'
                        }`}
                      >
                        {isSeen ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className='flex justify-start'>
            <div className='bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] px-4 py-2 rounded-lg'>
              <div className='flex items-center gap-2'>
                <div className='flex gap-1'>
                  <div className='w-2 h-2 bg-[var(--dashboard-text-muted)] rounded-full animate-bounce'></div>
                  <div
                    className='w-2 h-2 bg-[var(--dashboard-text-muted)] rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='w-2 h-2 bg-[var(--dashboard-text-muted)] rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className='text-xs text-[var(--dashboard-text-muted)]'>
                  {typingUsers.map(u => u.userName).join(', ')}{' '}
                  {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className='bg-[var(--dashboard-card)] border-t border-[var(--dashboard-border)] p-4'>
        <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
          <input
            type='text'
            value={newMessage}
            onChange={handleInputChange}
            placeholder='Type a message...'
            className='flex-1 px-4 py-2 bg-[var(--dashboard-card-hover)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            disabled={isSending}
          />
          <Button
            type='submit'
            disabled={!newMessage.trim() || isSending}
            className='bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2'
          >
            {isSending ? (
              <Loader2 className='animate-spin' size={16} />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
