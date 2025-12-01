import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  chatService,
  userService,
  type Conversation,
  type UserResponse
} from '@/services'
import useUserStore from '@/store/userStore'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Search,
  User,
  Loader2,
  // @ts-ignore
  Plus,
  Shield
} from 'lucide-react'

export default function ConversationsPage () {
  const navigate = useNavigate()
  const { user: currentUser } = useUserStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allUsers, setAllUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>(
    'conversations'
  )
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, searchQuery])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const convs = await chatService.getConversations()
      setConversations(convs)
    } catch (error: any) {
      toast.error('Error', {
        description:
          error.response?.data?.message || 'Failed to load conversations'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const result = await userService.getAllUsers({
        search: searchQuery || undefined,
        limit: 50
      })
      setAllUsers(result.users)
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to load users'
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleStartChat = async (userId: string) => {
    try {
      setIsStartingChat(userId)
      const conversation = await chatService.createOrGetConversation({
        participantId: userId
      })
      navigate(`/chat/${conversation._id}`)
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to start chat'
      })
    } finally {
      setIsStartingChat(null)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return null
    return conversation.participants.find(p => p._id !== currentUser.id)
  }

  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet'
    }
    const lastMessage = conversation.messages[0]
    return lastMessage.content.length > 50
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content
  }

  const formatLastMessageTime = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return ''
    }
    const lastMessage = conversation.messages[0]
    const date = new Date(lastMessage.createdAt)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation)
    if (!otherParticipant) return false

    return otherParticipant.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] flex items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='animate-spin' size={20} />
          <span>Loading conversations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <MessageSquare className='text-[var(--primary)]' />
            Messages
          </h1>
        </div>

        {/* Tabs */}
        <div className='flex bg-[var(--dashboard-card)] rounded-lg p-1 border border-[var(--dashboard-border)] mb-6'>
          <Button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'conversations'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('conversations')}
          >
            <MessageSquare size={16} className='mr-2' />
            Conversations
          </Button>
          <Button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'users'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <User size={16} className='mr-2' />
            Find Users
          </Button>
        </div>

        {/* Search */}
        <div className='relative mb-6'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dashboard-text-muted)]'
            size={18}
          />
          <input
            type='text'
            placeholder={
              activeTab === 'conversations'
                ? 'Search conversations...'
                : 'Search users...'
            }
            className='w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden'>
          {activeTab === 'conversations' ? (
            // Conversations Tab
            <>
              {isLoading ? (
                <div className='text-center py-12'>
                  <Loader2 className='animate-spin mx-auto mb-4' size={32} />
                  <p className='text-[var(--dashboard-text-muted)]'>
                    Loading conversations...
                  </p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className='text-center py-12'>
                  <MessageSquare
                    className='mx-auto mb-4 text-[var(--dashboard-text-muted)]'
                    size={48}
                  />
                  <h3 className='text-lg font-medium mb-2'>
                    No conversations yet
                  </h3>
                  <p className='text-[var(--dashboard-text-muted)] mb-4'>
                    Start chatting with users to see your conversations here
                  </p>
                  <Button
                    className='bg-[var(--primary)] hover:bg-[var(--primary)]/90'
                    onClick={() => setActiveTab('users')}
                  >
                    <User size={16} className='mr-2' />
                    Find Users to Chat
                  </Button>
                </div>
              ) : (
                <div className='divide-y divide-[var(--dashboard-border)]'>
                  {filteredConversations.map(conversation => {
                    const otherParticipant = getOtherParticipant(conversation)
                    if (!otherParticipant) return null

                    return (
                      <Link
                        key={conversation._id}
                        to={`/chat/${conversation._id}`}
                        className='block p-4 hover:bg-[var(--dashboard-card-hover)] transition-colors'
                      >
                        <div className='flex items-center gap-3'>
                          {otherParticipant.profilePicture ? (
                            <img
                              src={otherParticipant.profilePicture}
                              alt={otherParticipant.name}
                              className='w-12 h-12 rounded-full object-cover'
                              referrerPolicy='no-referrer'
                              crossOrigin='anonymous'
                            />
                          ) : (
                            <div className='w-12 h-12 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center'>
                              <User
                                size={20}
                                className='text-[var(--dashboard-text-muted)]'
                              />
                            </div>
                          )}

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                              <h3 className='font-medium truncate'>
                                {otherParticipant.name}
                              </h3>
                              <span className='text-xs text-[var(--dashboard-text-muted)]'>
                                {formatLastMessageTime(conversation)}
                              </span>
                            </div>
                            <p className='text-sm text-[var(--dashboard-text-muted)] truncate'>
                              {getLastMessage(conversation)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            // Users Tab
            <>
              {isLoadingUsers ? (
                <div className='text-center py-12'>
                  <Loader2 className='animate-spin mx-auto mb-4' size={32} />
                  <p className='text-[var(--dashboard-text-muted)]'>
                    Loading users...
                  </p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className='text-center py-12'>
                  <User
                    className='mx-auto mb-4 text-[var(--dashboard-text-muted)]'
                    size={48}
                  />
                  <h3 className='text-lg font-medium mb-2'>
                    {searchQuery ? 'No users found' : 'No users available'}
                  </h3>
                  <p className='text-[var(--dashboard-text-muted)]'>
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'There are no other users on the platform yet'}
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-[var(--dashboard-border)]'>
                  {allUsers.map(user => (
                    <div
                      // @ts-ignore
                      key={user.id}
                      className='p-4 hover:bg-[var(--dashboard-card-hover)] transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className='w-12 h-12 rounded-full object-cover'
                            referrerPolicy='no-referrer'
                            crossOrigin='anonymous'
                          />
                        ) : (
                          <div className='w-12 h-12 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center'>
                            <User
                              size={20}
                              className='text-[var(--dashboard-text-muted)]'
                            />
                          </div>
                        )}

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <Link
                              // @ts-ignore
                              to={`/profile/${user.id}`}
                              className='font-medium hover:text-[var(--primary)] transition-colors'
                            >
                              {user.name}
                            </Link>
                            {user.isVerified && (
                              <Shield size={14} className='text-green-500' />
                            )}
                          </div>
                          <p className='text-sm text-[var(--dashboard-text-muted)]'>
                            Joined{' '}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <Button
                          // @ts-ignore
                          onClick={() => handleStartChat(user.id)}
                          // @ts-ignore
                          disabled={isStartingChat === user.id}
                          className='bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2'
                        >
                          {/* @ts-ignore */}
                          {isStartingChat === user.id ? (
                            <Loader2 className='animate-spin' size={16} />
                          ) : (
                            <MessageSquare size={16} />
                          )}
                          <span className='ml-2 hidden sm:inline'>
                            {/* @ts-ignore */}
                            {isStartingChat === user.id
                              ? 'Starting...'
                              : 'Chat'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
