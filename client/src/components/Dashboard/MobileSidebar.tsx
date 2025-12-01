import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Terminal,
  BarChart3,
  FileEdit,
  FileCode,
  Server,
  LogOut,
  X
} from 'lucide-react'
import { useUserRole } from '../../hooks/useUserRole'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Console', href: '/console', icon: Terminal },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Server Config', href: '/config', icon: FileEdit },
  { name: 'Bukkit/Spigot', href: '/bukkit-spigot', icon: FileCode }
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar ({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isReadOnly } = useUserRole()

  const handleLogout = () => {
    sessionStorage.removeItem('dpanel_authenticated')
    sessionStorage.removeItem('dpanel_username')
    sessionStorage.removeItem('dpanel_role')
    navigate('/login')
  }

  const username = sessionStorage.getItem('dpanel_username') || 'Admin'

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className='flex h-16 items-center justify-between px-6 border-b border-gray-800'>
          <div className='flex items-center gap-2'>
            <Server className='h-8 w-8 text-green-500' />
            <span className='text-xl font-bold text-white'>DPanel</span>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-3 py-6 space-y-2 overflow-y-auto'>
          {navigation.map(item => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <item.icon className='h-5 w-5 flex-shrink-0' />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className='border-t border-gray-800 p-4 space-y-3'>
          <div className='text-xs text-gray-400'>
            <p className='text-gray-300 font-medium mb-1'>Logged in as</p>
            <p className='text-green-400 font-semibold'>{username}</p>
            <p className='text-gray-500 text-xs mt-1'>
              {isReadOnly ? 'Read-only' : 'Administrator'}
            </p>
          </div>
          <button
            onClick={() => {
              handleLogout()
              onClose()
            }}
            className='w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors'
          >
            <LogOut className='h-4 w-4' />
            <span>Logout</span>
          </button>
          <div className='text-xs text-gray-500 text-center'>v1.0.0</div>
        </div>
      </div>
    </>
  )
}

