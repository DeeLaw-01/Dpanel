import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: function() {
        // Password is only required for email/password authentication
        // OAuth users don't need passwords
        return this.authProvider === 'email' || !this.authProvider
      }
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email'
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    profilePicture: String,
    conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
      }
    ],
    refreshToken: {
      type: String,
      default: null
    },
    refreshTokenExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Skip password hashing if no password (OAuth users) or password not modified
  if (!this.password || !this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // OAuth users don't have passwords to compare
  if (!this.password) {
    return false
  }
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
