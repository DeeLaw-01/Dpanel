import { useState } from 'react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services'
import useUserStore from '@/store/userStore'
import AuthLayout from '@/components/CustomComponents/AuthLayout'
import { Button } from '@/components/ui/button'

interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string
}

export default function RegisterPage () {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

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
      const response = await authService.register(formData)

      // Check if user needs verification (existing unverified user or new user)
      if (response.needsVerification) {
        toast.info('Verification Required', {
          description:
            response.message || 'Please check your email for OTP verification'
        })
        // Store email for OTP verification
        localStorage.setItem('verificationEmail', formData.email)
        navigate('/verify-otp')
        return
      }

      toast.success('Registration Successful', {
        description: 'Please check your email for OTP verification'
      })
      // Store email for OTP verification
      localStorage.setItem('verificationEmail', formData.email)
      navigate('/verify-otp')
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.response?.data?.message || 'Something went wrong'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      setIsLoading(true)
      if (!credentialResponse.credential) {
        toast.error('Authentication Failed', {
          description: 'No credentials received from Google'
        })
        return
      }

      const decoded = jwtDecode<GoogleUser>(credentialResponse.credential)
      const response = await authService.googleAuth({
        name: decoded.name,
        email: decoded.email,
        profilePicture: decoded.picture
      })

      const { token, refreshToken, user } = response
      useUserStore.getState().setTokens(token, refreshToken)
      useUserStore.getState().setUser(user)

      toast.success('Success', {
        description: 'Successfully registered with Google'
      })
      navigate('/dashboard')
    } catch (error: any) {
      toast.error('Google Registration Failed', {
        description:
          error.response?.data?.message ||
          'An error occurred during Google sign-in'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleFailure = () => {
    toast.error('Google Registration Failed', {
      description: 'Unable to register with Google. Please try again.'
    })
  }

  return (
    <AuthLayout title='Create your account'>
      <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
        <div className='rounded-md shadow-sm space-y-4'>
          <div>
            <label htmlFor='name' className='sr-only'>
              Name
            </label>
            <input
              id='name'
              name='name'
              type='text'
              required
              className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent'
              placeholder='Full name'
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor='email' className='sr-only'>
              Email address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent'
              placeholder='Email address'
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor='password' className='sr-only'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Button
            type='submit'
            disabled={isLoading}
            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50'
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-[var(--border)]'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-[var(--card)] text-[var(--muted-foreground)]'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='mt-6 flex justify-center'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>

        <div className='mt-4 text-center'>
          <p className='text-sm text-[var(--muted-foreground)]'>
            Already have an account?{' '}
            <Button
              onClick={() => navigate('/login')}
              className='font-medium '
              variant='link'
            >
              Login here
            </Button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
