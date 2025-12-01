import User from '../models/User.js'

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -otp')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Make a user admin (admin only)
export const makeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.role = 'admin'
    await user.save()

    res.json({
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Make user admin error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Create first admin user (for setup)
export const createFirstAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' })
    }

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: 'admin',
      isVerified: true // Admin doesn't need email verification
    })

    await adminUser.save()

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Create first admin error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
