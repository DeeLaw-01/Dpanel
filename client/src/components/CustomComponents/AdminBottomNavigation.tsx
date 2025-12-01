import { Link, useLocation } from 'react-router-dom'
import { Shield, Users, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavigationItems = [
  {
    title: 'Dashboard',
    icon: Shield,
    path: '/admin'
  },
  {
    title: 'Users',
    icon: Users,
    path: '/admin/users'
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics'
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/admin/settings'
  }
]

export default function AdminBottomNavigation () {
  const location = useLocation()

  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)] px-4 py-2'>
      <div className='flex items-center justify-around'>
        {adminNavigationItems.map(item => {
          const isActive = location.pathname === item.path

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
              <item.icon size={20} />
              <span className='text-xs mt-1 truncate'>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
