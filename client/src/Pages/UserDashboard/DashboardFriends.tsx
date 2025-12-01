import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Gamepad2,
  MoreHorizontal,
  X,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chatService } from '@/services'
import { toast } from 'sonner'

// Sample friends data
const friends = [
  {
    id: 1,
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online',
    lastSeen: 'Now',
    currentGame: 'Cyberpunk 2077'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    username: 'sarahw',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'online',
    lastSeen: 'Now',
    currentGame: 'Valorant'
  },
  {
    id: 3,
    name: 'Mike Chen',
    username: 'mikec',
    avatar: 'https://i.pravatar.cc/150?img=8',
    status: 'online',
    lastSeen: 'Now',
    currentGame: null
  },
  {
    id: 4,
    name: 'Jessica Lee',
    username: 'jesslee',
    avatar: 'https://i.pravatar.cc/150?img=9',
    status: 'offline',
    lastSeen: '3 hours ago',
    currentGame: null
  },
  {
    id: 5,
    name: 'David Kim',
    username: 'davidk',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'offline',
    lastSeen: '1 day ago',
    currentGame: null
  },
  {
    id: 6,
    name: 'Emily Rodriguez',
    username: 'emilyr',
    avatar: 'https://i.pravatar.cc/150?img=10',
    status: 'offline',
    lastSeen: '2 days ago',
    currentGame: null
  }
]

// Sample friend requests
const friendRequests = [
  {
    id: 101,
    name: 'Chris Taylor',
    username: 'christ',
    avatar: 'https://i.pravatar.cc/150?img=11',
    mutualFriends: 3
  },
  {
    id: 102,
    name: 'Olivia Parker',
    username: 'oliviap',
    avatar: 'https://i.pravatar.cc/150?img=12',
    mutualFriends: 1
  }
]

export default function DashboardFriends () {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'online', 'requests'
  const [isStartingChat, setIsStartingChat] = useState<number | null>(null)

  // Filter friends based on search query and active tab
  const filteredFriends = friends.filter(friend => {
    const matchesSearch =
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'online')
      return matchesSearch && friend.status === 'online'

    return matchesSearch
  })

  const handleStartChat = async (friendId: number) => {
    try {
      setIsStartingChat(friendId)
      // In a real app, you'd use the actual user ID
      // For now, we'll simulate with the friend ID
      const conversation = await chatService.createOrGetConversation({
        participantId: friendId.toString()
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

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Users className='text-[var(--primary)]' />
          Friends
        </h1>
        <Button className='bg-[var(--primary)] hover:bg-[var(--primary)]/90'>
          <UserPlus size={16} className='mr-2' />
          Add Friend
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex bg-[var(--dashboard-card)] rounded-lg p-1 border border-[var(--dashboard-border)]'>
          <Button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Friends ({friends.length})
          </Button>
          <Button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'online'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('online')}
          >
            Online ({friends.filter(f => f.status === 'online').length})
          </Button>
          <Button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'requests'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({friendRequests.length})
          </Button>
        </div>
        <div className='relative flex-1'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dashboard-text-muted)]'
            size={18}
          />
          <input
            type='text'
            placeholder='Search friends...'
            className='w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Friends List */}
      {activeTab !== 'requests' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              className='bg-[var(--dashboard-card)] rounded-xl p-4 border border-[var(--dashboard-border)]'
            >
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className='w-12 h-12 rounded-full'
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--dashboard-card)] ${
                      friend.status === 'online'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                <div className='flex-1'>
                  <Link
                    to={`/profile/${friend.id}`}
                    className='font-medium hover:text-[var(--primary)] transition-colors'
                  >
                    {friend.name}
                  </Link>
                  <p className='text-sm text-[var(--dashboard-text-muted)]'>
                    @{friend.username}
                  </p>
                </div>
                <div className='flex gap-1'>
                  <Button
                    className='p-2 rounded-full hover:bg-[var(--dashboard-card-hover)]'
                    onClick={() => handleStartChat(friend.id)}
                    disabled={isStartingChat === friend.id}
                  >
                    <MessageSquare
                      size={18}
                      className='text-[var(--dashboard-text-muted)]'
                    />
                  </Button>
                  <Button className='p-2 rounded-full hover:bg-[var(--dashboard-card-hover)]'>
                    <MoreHorizontal
                      size={18}
                      className='text-[var(--dashboard-text-muted)]'
                    />
                  </Button>
                </div>
              </div>

              <div className='mt-3 pt-3 border-t border-[var(--dashboard-border)]'>
                <div className='flex items-center justify-between'>
                  <div className='text-xs text-[var(--dashboard-text-muted)]'>
                    {friend.status === 'online' ? (
                      friend.currentGame ? (
                        <div className='flex items-center'>
                          <Gamepad2 size={14} className='mr-1 text-green-500' />
                          <span>Playing {friend.currentGame}</span>
                        </div>
                      ) : (
                        <span className='text-green-500'>Online</span>
                      )
                    ) : (
                      <span>Last online {friend.lastSeen}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='space-y-4'>
          <h2 className='text-lg font-medium mb-4'>Friend Requests</h2>

          {friendRequests.map(request => (
            <div
              key={request.id}
              className='bg-[var(--dashboard-card)] rounded-xl p-4 border border-[var(--dashboard-border)] flex items-center gap-4'
            >
              <img
                src={request.avatar}
                alt={request.name}
                className='w-12 h-12 rounded-full'
              />

              <div className='flex-1'>
                <h3 className='font-medium'>{request.name}</h3>
                <p className='text-sm text-[var(--dashboard-text-muted)]'>
                  @{request.username} • {request.mutualFriends} mutual{' '}
                  {request.mutualFriends === 1 ? 'friend' : 'friends'}
                </p>
              </div>

              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='bg-[var(--primary)] hover:bg-[var(--primary)]/90'
                >
                  <Check size={16} className='mr-1' />
                  Accept
                </Button>
                <Button size='sm' variant='outline'>
                  <X size={16} className='mr-1' />
                  Decline
                </Button>
              </div>
            </div>
          ))}

          {friendRequests.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-[var(--dashboard-text-muted)]'>
                No friend requests
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'requests' && filteredFriends.length === 0 && (
        <div className='text-center py-12'>
          <Users
            className='mx-auto mb-4 text-[var(--dashboard-text-muted)]'
            size={48}
          />
          <h3 className='text-lg font-medium mb-2'>No friends found</h3>
          <p className='text-[var(--dashboard-text-muted)]'>
            Try adjusting your search or add new friends
          </p>
        </div>
      )}
    </div>
  )
}
