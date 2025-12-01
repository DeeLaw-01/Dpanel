import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import useUserStore from '@/store/userStore'
import { Button } from '@/components/ui/button'
import NotificationBell from './NotificationBell'
import authService from '@/services/authService'

export default function Navbar () {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, token, refreshToken, logout } = useUserStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setIsMobileMenuOpen(false)
    setIsUserDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(token
      ? [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Messages', path: '/messages' },
          { name: 'Admin', path: '/admin', adminOnly: true }
        ]
      : [
          { name: 'Login', path: '/login' },
          { name: 'Register', path: '/register' }
        ])
  ]

  // Filter admin link based on user role
  const filteredNavLinks = navLinks.filter(
    link => !link.adminOnly || user?.role === 'admin'
  )

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link
            to='/'
            className='text-xl font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors'
          >
            HackStarter
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            {filteredNavLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className='hidden md:flex items-center space-x-4'>
            {/* Notifications */}
            {token && user && <NotificationBell />}
            {/* User Section */}
            {token && user ? (
              <div className='relative' ref={dropdownRef}>
                <Button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className='flex items-center space-x-2 p-2 rounded-md hover:bg-[var(--accent)]/10 transition-colors bg-transparent'
                  aria-label='User menu'
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className='w-8 h-8 rounded-full object-cover border border-[var(--border)]'
                      referrerPolicy='no-referrer'
                      crossOrigin='anonymous'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center'>
                      <User size={16} className='text-white' />
                    </div>
                  )}
                  <span className='text-sm text-[var(--foreground)] hidden lg:block'>
                    {user.name}
                  </span>
                </Button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg z-50'>
                    <div className='py-1'>
                      <div className='px-4 py-2 border-b border-[var(--border)]'>
                        <p className='text-sm font-medium text-[var(--foreground)]'>
                          {user.name}
                        </p>
                        <p className='text-xs text-[var(--foreground-muted)]'>
                          {user.email}
                        </p>
                      </div>

                      <Button
                        onClick={() => {
                          toggleTheme()
                          setIsUserDropdownOpen(false)
                        }}
                        className='w-full flex items-center justify-start px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/10 transition-colors bg-transparent'
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun size={16} className='mr-2' />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon size={16} className='mr-2' />
                            Dark Mode
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleLogout}
                        className='w-full flex items-center justify-start px-4 py-2 text-sm hover:bg-[var(--accent)]/10 transition-colors text-red-600 hover:text-red-700 bg-transparent'
                      >
                        <LogOut size={16} className='mr-2' />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Link
                  to='/login'
                  className='px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden p-2 rounded-md hover:bg-[var(--accent)]/10 transition-colors'
            aria-label='Toggle mobile menu'
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-[var(--border)] py-4'>
            <div className='flex flex-col space-y-4'>
              {/* Navigation Links */}
              {filteredNavLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors px-2 py-1'
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile User Section */}
              {token && user && (
                <div className='pt-4 border-t border-[var(--border)]'>
                  <div className='flex items-center space-x-3 px-2 py-2'>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className='w-8 h-8 rounded-full object-cover border border-[var(--border)]'
                        referrerPolicy='no-referrer'
                        crossOrigin='anonymous'
                      />
                    ) : (
                      <div className='w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center'>
                        <User size={16} className='text-[var(--foreground)]' />
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-medium text-[var(--foreground)]'>
                        {user.name}
                      </p>
                      <p className='text-xs text-[var(--foreground-muted)]'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    className='w-full flex items-center space-x-2 px-2 py-2 transition-colors'
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              )}

              {/* Theme Toggle */}
              <div className='pt-4 border-t border-[var(--border)]'>
                <Button
                  onClick={toggleTheme}
                  className='flex items-center space-x-2 px-2 py-2 transition-colors bg-transparent'
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={16} />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
