import api from '@/api/api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface GoogleAuthData {
  name: string
  email: string
  profilePicture: string
}

export interface OTPData {
  email: string
  otp: string
}

export interface ResendOTPData {
  email: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  user: any
  needsVerification?: boolean
  message?: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

class AuthService {
  /**
   * Login with email and password
   */
  async login (data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', data)
    return response.data
  }

  /**
   * Register new user with email and password
   */
  async register (data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', data)
    return response.data
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth (data: GoogleAuthData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/google', data)
    return response.data
  }

  /**
   * Verify OTP for email verification
   */
  async verifyOTP (data: OTPData): Promise<void> {
    const response = await api.post('/api/auth/verify-otp', data)
    return response.data
  }

  /**
   * Resend OTP for email verification
   */
  async resendOTP (data: ResendOTPData): Promise<void> {
    const response = await api.post('/api/auth/resend-otp', data)
    return response.data
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken (refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post('/api/auth/refresh-token', { refreshToken })
    return response.data
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout (refreshToken?: string): Promise<void> {
    const response = await api.post('/api/auth/logout', { refreshToken })
    return response.data
  }
}

export default new AuthService()
