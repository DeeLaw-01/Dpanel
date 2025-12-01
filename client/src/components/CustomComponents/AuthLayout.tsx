import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AuthLayout ({ children, title }: AuthLayoutProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--background)] relative'>
      {/* Home Button */}
      <Link
        to='/'
        className='absolute top-4 left-4 flex items-center space-x-2 px-3 py-2 rounded-md bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)]/10 transition-colors'
      >
        <Home size={16} className='text-[var(--primary)]' />
        <span className='text-sm text-[var(--foreground)]'>Home</span>
      </Link>

      {/* Auth Card */}
      <div className='max-w-sm w-full space-y-8 p-8 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)]'>
        <div>
          <h2 className='text-center text-3xl font-extrabold text-[var(--foreground)]'>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  )
}
