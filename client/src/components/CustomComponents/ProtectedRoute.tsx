import { Navigate, useLocation } from 'react-router-dom'
import useUserStore from '@/store/userStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  adminOnly?: boolean
}

export default function ProtectedRoute ({
  children,
  requireAuth = true,
  adminOnly = false
}: ProtectedRouteProps) {
  const { user, token } = useUserStore()
  const location = useLocation()

  // If route requires authentication but user is not logged in
  if (requireAuth && !token) {
    // Save the attempted location for redirect after login
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // If route requires admin access but user is not admin
  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to='/dashboard' replace />
  }

  // If user is logged in but trying to access auth pages (login/register)
  if (
    !requireAuth &&
    token &&
    (location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/verify-otp')
  ) {
    // Redirect to dashboard or the page they were trying to access
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
