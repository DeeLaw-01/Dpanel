import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields if provided
    if (name) user.name = name
    if (profilePicture) user.profilePicture = profilePicture

    const updatedUser = await user.save()

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isGoogle: updatedUser.isGoogle,
      onBoardingComplete: updatedUser.onBoardingComplete,
      profilePicture: updatedUser.profilePicture
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user by ID (for viewing other users' profiles)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select('-password -otp -email')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user._id,
      name: user.name,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all users (for user discovery)
export const getAllUsers = async (req, res) => {
  try {
    const { search, limit = 20, skip = 0 } = req.query
    const currentUserId = req.user._id

    let query = { _id: { $ne: currentUserId } } // Exclude current user

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const users = await User.find(query)
      .select('name profilePicture isVerified createdAt')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ name: 1 })

    const totalUsers = await User.countDocuments(query)

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      })),
      total: totalUsers,
      hasMore: parseInt(skip) + users.length < totalUsers
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
