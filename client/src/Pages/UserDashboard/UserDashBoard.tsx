import React, { useEffect } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'
import useUserStore from '@/store/userStore'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-provider'
import BottomNavigation from '@/components/CustomComponents/BottomNavigation'
import authService from '@/services/authService'

// Custom icons
const FriendsIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
)

const sidebarLinks = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    exact: true
  },
  {
    title: 'Profile',
    icon: User,
    path: '/dashboard/profile'
  },
  {
    title: 'Friends',
    icon: FriendsIcon,
    path: '/dashboard/friends'
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/dashboard/settings'
  }
]

export default function UserDashboard () {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, refreshToken, logout } = useUserStore()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleLogout = async () => {
    try {
      // Call server to invalidate refresh token
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with logout even if server call fails
    }
    
    // Clear local state
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='animate-pulse text-white'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]'>
      <div className='flex'>
        {/* Sidebar - Desktop */}
        <aside className='hidden md:flex flex-col w-64 border-r border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] h-[calc(100vh-4rem)] sticky top-0'>
          <div className='p-6'>
            <h2 className='text-xl font-bold flex items-center gap-2'>
              <LayoutDashboard className='text-[var(--primary)]' />
              Dashboard
            </h2>
          </div>

          <div className='flex-1 px-4 py-2'>
            <nav className='space-y-1'>
              {sidebarLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    location.pathname === link.path ||
                      (link.exact && location.pathname === link.path)
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]'
                  )}
                >
                  {typeof link.icon === 'function' ? (
                    <link.icon />
                  ) : (
                    React.createElement(link.icon, { size: 20 })
                  )}
                  <span>{link.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className='p-4 border-t border-[var(--dashboard-border)]'>
            <div className='flex items-center gap-3 mb-4 p-2'>
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className='w-10 h-10 rounded-full object-cover border-2 border-[var(--primary)]'
                  referrerPolicy='no-referrer'
                  crossOrigin='anonymous'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-[var(--dashboard-card-hover)] border-2 border-[var(--primary)] flex items-center justify-center'>
                  <User
                    size={20}
                    className='text-[var(--dashboard-text-muted)]'
                  />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{user.name}</p>
                <p className='text-xs text-[var(--dashboard-text-muted)] truncate'>
                  {user.email}
                </p>
              </div>
            </div>

            <Button
              onClick={toggleTheme}
              className='w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors mb-3'
            >
              <div className='flex items-center gap-2'>
                {theme === 'dark' ? (
                  <Moon size={18} className='' />
                ) : (
                  <Sun size={18} className='' />
                )}
                <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </div>
              <span className='text-xs '>Toggle</span>
            </Button>

            <Button
              onClick={handleLogout}
              className='w-full flex items-center gap-2 px-3 py-2 text-sm  rounded-md transition-colors'
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-8 pt-4 md:pt-8 pb-20 bg-[var(--dashboard-bg)]'>
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  )
}
