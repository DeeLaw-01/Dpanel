import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type AdminUserData } from '@/services'
import { Button } from '@/components/ui/button'
import {
  Search,
  RefreshCw,
  Shield,
  User,
  Mail,
  Calendar,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import AdminBottomNavigation from '@/components/CustomComponents/AdminBottomNavigation'

export default function AdminDashboard () {
  const [users, setUsers] = useState<AdminUserData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const usersData = await adminService.getAllUsers()
      setUsers(usersData)
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to fetch users'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch users on component mount
    fetchUsers()
  }, [])

  // Filter users based on search term
  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] pt-20 px-4 md:px-8 pb-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Shield className='text-[var(--primary)]' />
            Admin Dashboard
          </h1>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='text'
                placeholder='Search users...'
                className='pl-10 pr-4 py-2 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-full md:w-64'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={fetchUsers}
              className='p-2 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-md hover:bg-[var(--dashboard-card-hover)] transition-colors'
              disabled={isLoading}
            >
              <RefreshCw
                size={18}
                className={isLoading ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className='bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)]'>
                  <th className='px-4 py-3 text-left'>User</th>
                  <th className='px-4 py-3 text-left'>Email</th>
                  <th className='px-4 py-3 text-left'>Joined</th>
                  <th className='px-4 py-3 text-left'>Status</th>
                  <th className='px-4 py-3 text-left'>Auth</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className='px-4 py-8 text-center'>
                      <div className='flex items-center justify-center'>
                        <RefreshCw size={20} className='animate-spin mr-2' />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-4 py-8 text-center'>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr
                      key={user._id}
                      className='border-b border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)] transition-colors'
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          <div className='w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center overflow-hidden mr-3'>
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className='w-full h-full object-cover'
                                referrerPolicy='no-referrer'
                                crossOrigin='anonymous'
                              />
                            ) : (
                              <User size={18} className='text-white' />
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/profile/${user._id}`}
                              className='font-medium hover:text-[var(--primary)] transition-colors'
                            >
                              {user.name}
                            </Link>
                            <div className='text-xs text-[var(--dashboard-text-muted)]'>
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          <Mail
                            size={16}
                            className='mr-2 text-[var(--dashboard-text-muted)]'
                          />
                          {user.email}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          <Calendar
                            size={16}
                            className='mr-2 text-[var(--dashboard-text-muted)]'
                          />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          {user.isVerified ? (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              <Check size={12} className='mr-1' />
                              Verified
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                              <X size={12} className='mr-1' />
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          {user.isGoogle ? (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                              Google
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                              Email
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Actions - Commented out as requested */}
        {/*
        <div className="mt-6 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="p-3 bg-[var(--dashboard-card-hover)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors">
              Manage Users
            </Button>
            <Button className="p-3 bg-[var(--dashboard-card-hover)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors">
              System Settings
            </Button>
            <Button className="p-3 bg-[var(--dashboard-card-hover)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors">
              View Logs
            </Button>
          </div>
        </div>
        */}

        {/* Admin Notes */}
        <div className='mt-6 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-lg p-4'>
          <h2 className='text-lg font-medium mb-2'>Admin Notes</h2>
          <p className='text-[var(--dashboard-text-muted)]'>
            This admin dashboard currently only displays users. Additional admin
            functionality (authentication, user management, etc.) will be
            implemented later.
          </p>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <AdminBottomNavigation />
    </div>
  )
}
