import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services'
import AuthLayout from '@/components/CustomComponents/AuthLayout'

export default function OTPPage () {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail')
    if (!storedEmail) {
      navigate('/register')
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await authService.verifyOTP({ email, otp })
      toast.success('Email Verified', {
        description: 'Your email has been verified successfully'
      })
      localStorage.removeItem('verificationEmail')
      navigate('/login')
    } catch (error: any) {
      toast.error('Verification Failed', {
        description: error.response?.data?.message || 'Invalid OTP'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setIsResending(true)
      await authService.resendOTP({ email })
      toast.success('OTP Resent', {
        description: 'A new verification code has been sent to your email'
      })
    } catch (error: any) {
      toast.error('Resend Failed', {
        description: error.response?.data?.message || 'Failed to resend OTP'
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout title='Verify your email'>
      <div className='text-center mb-6'>
        <p className='text-sm text-[var(--muted-foreground)]'>
          Please enter the OTP sent to {email}
        </p>
      </div>
      <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
        <div>
          <label htmlFor='otp' className='sr-only'>
            OTP
          </label>
          <input
            id='otp'
            name='otp'
            type='text'
            required
            maxLength={6}
            className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent'
            placeholder='Enter 6-digit OTP'
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
        </div>

        <div>
          <button
            type='submit'
            disabled={isLoading}
            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50'
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </form>

      {/* Resend OTP */}
      <div className='mt-4 text-center'>
        <p className='text-sm text-[var(--muted-foreground)]'>
          Didn't receive the code?{' '}
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className='font-medium text-[var(--primary)] hover:text-[var(--accent)] disabled:opacity-50'
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
