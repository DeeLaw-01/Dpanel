import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { userService, chatService, type UserResponse } from '@/services'
import useUserStore from '@/store/userStore'
import { Button } from '@/components/ui/button'
import {
  User,
  MessageSquare,
  Calendar,
  Shield,
  ArrowLeft,
  Loader2
} from 'lucide-react'

export default function UserProfilePage () {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useUserStore()
  const [profileUser, setProfileUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingChat, setIsStartingChat] = useState(false)

  useEffect(() => {
    if (!userId) {
      navigate('/dashboard')
      return
    }

    // If trying to view own profile, redirect to dashboard profile
    if (userId === currentUser?.id) {
      navigate('/dashboard/profile')
      return
    }

    fetchUserProfile()
  }, [userId, currentUser, navigate])

  const fetchUserProfile = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const user = await userService.getUserById(userId)
      setProfileUser(user)
    } catch (error: any) {
      toast.error('Error', {
        description:
          error.response?.data?.message || 'Failed to load user profile'
      })
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (!userId || !profileUser) return

    try {
      setIsStartingChat(true)
      const conversation = await chatService.createOrGetConversation({
        participantId: userId
      })

      // Navigate to chat page with conversation ID
      navigate(`/chat/${conversation._id}`)
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to start chat'
      })
    } finally {
      setIsStartingChat(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] flex items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='animate-spin' size={20} />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-bold mb-2'>User not found</h2>
          <p className='text-[var(--dashboard-text-muted)] mb-4'>
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Button
            onClick={() => navigate(-1)}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className='text-2xl font-bold'>User Profile</h1>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Profile Card */}
          <div className='lg:col-span-1'>
            <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
              <div className='flex flex-col items-center text-center'>
                <div className='relative mb-4'>
                  {profileUser.profilePicture ? (
                    <img
                      src={profileUser.profilePicture}
                      alt={profileUser.name}
                      className='w-32 h-32 rounded-full object-cover border-4 border-[var(--primary)]'
                      referrerPolicy='no-referrer'
                      crossOrigin='anonymous'
                    />
                  ) : (
                    <div className='w-32 h-32 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center border-4 border-[var(--primary)]'>
                      <User className='w-16 h-16 text-[var(--dashboard-text-muted)]' />
                    </div>
                  )}
                </div>

                <h2 className='text-xl font-bold mb-2'>{profileUser.name}</h2>

                {profileUser.isVerified && (
                  <div className='flex items-center gap-1 text-green-500 text-sm mb-4'>
                    <Shield size={16} />
                    <span>Verified User</span>
                  </div>
                )}

                <div className='w-full space-y-3'>
                  <div className='flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                    <div className='p-2 bg-[var(--dashboard-card-hover)] rounded-lg'>
                      <Calendar
                        size={16}
                        className='text-[var(--dashboard-text-muted)]'
                      />
                    </div>
                    <div className='text-left'>
                      <p className='text-xs text-[var(--dashboard-text-muted)]'>
                        Joined
                      </p>
                      <p className='text-sm'>
                        {new Date(profileUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Button */}
                <div className='w-full mt-6'>
                  <Button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className='w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 flex items-center gap-2'
                  >
                    {isStartingChat ? (
                      <Loader2 className='animate-spin' size={16} />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                    {isStartingChat ? 'Starting Chat...' : 'Start Chat'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className='lg:col-span-2'>
            <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
              <h3 className='text-lg font-medium mb-4'>
                About {profileUser.name}
              </h3>

              <div className='space-y-4'>
                <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                  <h4 className='font-medium mb-2'>Profile Information</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-[var(--dashboard-text-muted)]'>
                        Name:
                      </span>
                      <span className='ml-2 font-medium'>
                        {profileUser.name}
                      </span>
                    </div>
                    <div>
                      <span className='text-[var(--dashboard-text-muted)]'>
                        Status:
                      </span>
                      <span
                        className={`ml-2 font-medium ${
                          profileUser.isVerified
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        }`}
                      >
                        {profileUser.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <span className='text-[var(--dashboard-text-muted)]'>
                        Member since:
                      </span>
                      <span className='ml-2 font-medium'>
                        {new Date(profileUser.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                  <h4 className='font-medium mb-2'>Connect</h4>
                  <p className='text-sm text-[var(--dashboard-text-muted)] mb-3'>
                    Start a conversation with {profileUser.name} to get to know
                    them better.
                  </p>
                  <Button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    variant='outline'
                    className='flex items-center gap-2'
                  >
                    {isStartingChat ? (
                      <Loader2 className='animate-spin' size={16} />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                    {isStartingChat ? 'Starting Chat...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
