import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { userService } from '@/services'
import useUserStore from '@/store/userStore'
import { Button } from '@/components/ui/button'
import {
  User,
  Mail,
  Calendar,
  AtSign,
  Camera,
  Upload,
  Check
} from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'

export default function DashboardProfile () {
  const { user, setUser } = useUserStore()
  // @ts-ignore
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info' or 'security'
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: ''
  })

  useEffect(() => {
    // Set initial form data from user store
    if (user) {
      setFormData({
        name: user.name || '',
        profilePicture: user.profilePicture || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const updatedUser = await userService.updateProfile(formData)

      // Update user in store
      setUser(updatedUser)

      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully'
      })

      setIsEditing(false)
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.response?.data?.message || 'Something went wrong'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <User className='text-[var(--primary)]' />
          My Profile
        </h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Profile Card */}
        <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6 lg:col-span-1'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative mb-4'>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className='w-32 h-32 rounded-full object-cover border-4 border-[var(--primary)] mb-2'
                  referrerPolicy='no-referrer'
                  crossOrigin='anonymous'
                />
              ) : (
                <div className='w-32 h-32 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center border-4 border-[var(--primary)] mb-2'>
                  <User className='w-16 h-16 text-[var(--dashboard-text-muted)]' />
                </div>
              )}
              {isEditing && (
                <Button
                  className='absolute bottom-0 right-0 p-2 bg-[var(--primary)] rounded-full text-white hover:bg-[var(--accent)] transition-colors'
                  onClick={() =>
                    document.getElementById('profilePicture')?.focus()
                  }
                >
                  <Camera size={18} />
                </Button>
              )}
            </div>
            <h2 className='text-xl font-bold'>{user?.name}</h2>
            <p className='text-[var(--dashboard-text-muted)]'>{user?.email}</p>

            <div className='mt-6 w-full'>
              <div className='flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg mb-3'>
                <div className='p-2 bg-[var(--dashboard-card-hover)] rounded-lg'>
                  <Mail
                    size={16}
                    className='text-[var(--dashboard-text-muted)]'
                  />
                </div>
                <div className='text-left'>
                  <p className='text-xs text-[var(--dashboard-text-muted)]'>
                    Email
                  </p>
                  <p className='text-sm'>{user?.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg mb-3'>
                <div className='p-2 bg-[var(--dashboard-card-hover)] rounded-lg'>
                  <AtSign
                    size={16}
                    className='text-[var(--dashboard-text-muted)]'
                  />
                </div>
                <div className='text-left'>
                  <p className='text-xs text-[var(--dashboard-text-muted)]'>
                    Account Type
                  </p>
                  <p className='text-sm'>
                    {user?.isGoogle ? 'Google Account' : 'Email Account'}
                  </p>
                </div>
              </div>

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
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className='lg:col-span-3 space-y-6'>
          {/* Tabs */}
          <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-1'>
            <div className='flex'>
              <Button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === 'info'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Personal Information
              </Button>
              <Button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === 'security'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' ? (
            <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-medium'>Personal Information</h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant='outline'
                    size='sm'
                    className='text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]'
                  >
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-[var(--dashboard-text)] mb-1'
                      >
                        Full Name
                      </label>
                      <input
                        id='name'
                        name='name'
                        type='text'
                        required
                        className='w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        placeholder='Your name'
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-[var(--dashboard-text)] mb-1'
                      >
                        Email Address
                      </label>
                      <input
                        id='email'
                        type='email'
                        disabled
                        className='w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/50 text-[var(--dashboard-text-muted)] rounded-md cursor-not-allowed'
                        value={user?.email || ''}
                      />
                      <p className='mt-1 text-xs text-[var(--dashboard-text-muted)]'>
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='profilePicture'
                      className='block text-sm font-medium text-[var(--dashboard-text)] mb-1'
                    >
                      Profile Picture URL
                    </label>
                    <div className='flex'>
                      <input
                        id='profilePicture'
                        name='profilePicture'
                        type='text'
                        className='flex-1 px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                        placeholder='https://example.com/your-image.jpg'
                        value={formData.profilePicture}
                        onChange={handleChange}
                      />
                      <Button
                        type='button'
                        className='px-3 py-2 bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-r-md hover:bg-[var(--primary)] hover:text-white'
                        onClick={() => {
                          // This would typically open a file picker
                          toast.info('File upload', {
                            description:
                              'File upload functionality would be implemented here'
                          })
                        }}
                      >
                        <Upload size={18} />
                      </Button>
                    </div>
                    <p className='mt-1 text-xs text-[var(--dashboard-text-muted)]'>
                      Enter a URL for your profile picture or upload an image
                    </p>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      type='submit'
                      disabled={isLoading}
                      className='bg-[var(--primary)] hover:bg-[var(--accent)]'
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      className='border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]'
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        if (user) {
                          setFormData({
                            name: user.name || '',
                            profilePicture: user.profilePicture || ''
                          })
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                      <p className='text-sm text-[var(--dashboard-text-muted)] mb-1'>
                        Full Name
                      </p>
                      <p className='font-medium'>{user?.name}</p>
                    </div>
                    <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                      <p className='text-sm text-[var(--dashboard-text-muted)] mb-1'>
                        Email Address
                      </p>
                      <p className='font-medium'>{user?.email}</p>
                    </div>
                  </div>

                  <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                    <p className='text-sm text-[var(--dashboard-text-muted)] mb-1'>
                      Profile Picture
                    </p>
                    {user?.profilePicture ? (
                      <div className='flex items-center gap-2'>
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className='w-8 h-8 rounded-full object-cover border-2 border-[var(--primary)]'
                          referrerPolicy='no-referrer'
                          crossOrigin='anonymous'
                        />
                        <p className='text-sm text-[var(--dashboard-text-muted)]'>
                          Profile picture from Google
                        </p>
                      </div>
                    ) : (
                      <p className='text-[var(--dashboard-text-muted)]'>
                        No profile picture set
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-medium'>Security Settings</h2>
              </div>

              <div className='space-y-6'>
                <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium mb-1'>Change Password</p>
                      <p className='text-sm text-[var(--dashboard-text-muted)]'>
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]'
                      onClick={() => {
                        toast.info('Password Change', {
                          description:
                            'Password change functionality would be implemented here'
                        })
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium mb-1'>
                        Two-Factor Authentication
                      </p>
                      <p className='text-sm text-[var(--dashboard-text-muted)]'>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]'
                      onClick={() => {
                        toast.info('Two-Factor Authentication', {
                          description:
                            '2FA functionality would be implemented here'
                        })
                      }}
                    >
                      Enable
                    </Button>
                  </div>
                </div>

                <div className='p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium mb-1'>Account Verification</p>
                      <p className='text-sm text-[var(--dashboard-text-muted)]'>
                        {user?.isVerified
                          ? 'Your account is verified'
                          : 'Verify your account to access all features'}
                      </p>
                    </div>
                    {user?.isVerified ? (
                      <div className='flex items-center gap-1 text-[var(--gaming-green)] text-sm'>
                        <Check size={16} />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]'
                        onClick={() => {
                          toast.info('Account Verification', {
                            description:
                              'Verification functionality would be implemented here'
                          })
                        }}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
