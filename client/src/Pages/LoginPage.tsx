import { useState } from 'react'
import { Server, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'WEAREkakashi22@@a'

export default function LoginPage () {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple authentication check
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Store auth in sessionStorage
      sessionStorage.setItem('dpanel_authenticated', 'true')
      sessionStorage.setItem('dpanel_username', username)

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/')
        setLoading(false)
      }, 500)
    } else {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-950 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='flex items-center justify-center gap-3 mb-8'>
          <Server className='h-10 w-10 text-green-500' />
          <h1 className='text-3xl font-bold text-white'>DPanel</h1>
        </div>

        {/* Login Card */}
        <div className='bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white mb-2'>
            Welcome Back
          </h2>
          <p className='text-gray-400 mb-6'>
            Sign in to access your Minecraft server dashboard
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Username
              </label>
              <input
                id='username'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors'
                placeholder='Enter your username'
                required
                autoComplete='username'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors'
                  placeholder='Enter your password'
                  required
                  autoComplete='current-password'
                />
                <Lock className='absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none' />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className='text-center text-gray-500 text-sm mt-6'>
          Minecraft Server Dashboard v1.0.0
        </p>
      </div>
    </div>
  )
}
