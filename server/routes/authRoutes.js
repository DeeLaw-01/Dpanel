import express from 'express'
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  resetUserPassword,
  googleAuth,
  refreshToken,
  logout
} from '../controllers/authController.js'
import { createFirstAdmin } from '../controllers/adminController.js'

const router = express.Router()

// Register route
router.post('/register', register)

// Login route
router.post('/login', login)

// OTP verification route
router.post('/verify-otp', verifyOTP)

// Resend OTP route
router.post('/resend-otp', resendOTP)

// Reset password route (for fixing double-hashed passwords)
router.post('/reset-password', resetUserPassword)

// Google OAuth route
router.post('/google', googleAuth)

// Create first admin user (setup only)
router.post('/create-first-admin', createFirstAdmin)

// Refresh token route
router.post('/refresh-token', refreshToken)

// Logout route
router.post('/logout', logout)

export default router
