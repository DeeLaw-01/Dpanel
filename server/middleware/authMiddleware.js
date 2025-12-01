import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.userId).select('-password')
      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

export const verifyPassword = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  req.user = user
  next()
}

// Admin-only middleware
export const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    if (user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Access denied. Admin privileges required.' })
    }

    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
