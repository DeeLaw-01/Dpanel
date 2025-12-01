import User from '../models/User.js'
import { sendOTP, generateOTP } from '../services/emailService.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

dotenv.config()

// Helper function to generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m' // Short-lived access token
  })
  
  const refreshToken = generateRefreshToken()
  
  return { accessToken, refreshToken }
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      // If user exists but is not verified, allow them to get a new OTP
      if (!existingUser.isVerified) {
        // Generate new OTP
        const otp = generateOTP()
        const otpExpiry = new Date()
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 30)

        existingUser.otp = otp
        existingUser.otpExpiry = otpExpiry
        await existingUser.save()

        // Send verification OTP
        await sendOTP(email, otp)

        return res.status(200).json({
          message: 'A new verification code has been sent to your email.',
          needsVerification: true
        })
      }

      return res
        .status(400)
        .json({ message: 'User already exists and is verified' })
    }

    // Generate OTP for email verification
    const otp = generateOTP()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30) // OTP valid for 30 minutes

    // Create new user (password will be hashed by the pre-save hook)
    const user = new User({
      name,
      email,
      password, // Don't hash here - let the model's pre-save hook handle it
      otp,
      otpExpiry,
      isVerified: false
    })

    await user.save()

    // Send verification OTP
    await sendOTP(email, otp)

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id)
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)
    
    // Save refresh token to user
    user.refreshToken = refreshToken
    user.refreshTokenExpiry = refreshTokenExpiry
    await user.save()

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: user._id,
      token: accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      // Debug: Log password verification failure for troubleshooting
      console.log(`Password verification failed for user: ${email}`)
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP if needed
      const otp = generateOTP()
      const otpExpiry = new Date()
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 30)

      user.otp = otp
      user.otpExpiry = otpExpiry
      await user.save()

      // Send verification OTP
      await sendOTP(email, otp)

      return res.status(401).json({
        message:
          'Account not verified. A new verification code has been sent to your email.',
        needsVerification: true
      })
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id)
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)
    
    // Save refresh token to user
    user.refreshToken = refreshToken
    user.refreshTokenExpiry = refreshTokenExpiry
    await user.save()

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.log('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
}

// Helper function to fix double-hashed passwords (for existing users)
export const resetUserPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ message: 'Password reset failed' })
  }
}

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Mark user as verified
    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({ message: 'Verification failed' })
  }
}

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP
    const sent = await sendOTP(email, otp)

    if (!sent) {
      return res.status(500).json({ message: 'Failed to send OTP' })
    }

    res.json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({ message: 'Failed to resend OTP' })
  }
}

// Google OAuth authentication
export const googleAuth = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })

    if (user) {
      // User exists, update profile picture if provided
      if (profilePicture && user.profilePicture !== profilePicture) {
        user.profilePicture = profilePicture
        await user.save()
      }
    } else {
      // Create new user for Google OAuth
      user = new User({
        name,
        email,
        profilePicture,
        isVerified: true, // Google users are pre-verified
        role: 'user',
        authProvider: 'google' // Mark as Google OAuth user
      })
      await user.save()
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id)
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)
    
    // Save refresh token to user
    user.refreshToken = refreshToken
    user.refreshTokenExpiry = refreshTokenExpiry
    await user.save()

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Google OAuth error:', error)
    res.status(500).json({ message: 'Google authentication failed' })
  }
}

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    // Find user with this refresh token
    const user = await User.findOne({ 
      refreshToken,
      refreshTokenExpiry: { $gt: new Date() } // Check if refresh token is not expired
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)
    
    // Set new refresh token expiry (7 days)
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)
    
    // Update user with new refresh token
    user.refreshToken = newRefreshToken
    user.refreshTokenExpiry = refreshTokenExpiry
    await user.save()

    res.json({
      token: accessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ message: 'Token refresh failed' })
  }
}

// Logout endpoint (invalidate refresh token)
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Find user and clear refresh token
      const user = await User.findOne({ refreshToken })
      if (user) {
        user.refreshToken = null
        user.refreshTokenExpiry = null
        await user.save()
      }
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Logout failed' })
  }
}
