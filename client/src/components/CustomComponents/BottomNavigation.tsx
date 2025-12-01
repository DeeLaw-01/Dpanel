import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const navigationItems = [
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

export default function BottomNavigation () {
  const location = useLocation()

  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)] px-4 py-2'>
      <div className='flex items-center justify-around'>
        {navigationItems.map(item => {
          const isActive =
            location.pathname === item.path ||
            (item.exact && location.pathname === item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1',
                isActive
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/10'
              )}
            >
              {typeof item.icon === 'function' ? (
                <item.icon />
              ) : (
                //@ts-ignore
                <item.icon size={20} />
              )}
              <span className='text-xs mt-1 truncate'>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
