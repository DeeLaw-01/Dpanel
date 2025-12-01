import api from '@/api/api'

export interface UpdateProfileData {
  name: string
  profilePicture: string
}

export interface UserResponse {
  _id: string
  name: string
  email: string
  role: string
  isGoogle: boolean
  isVerified: boolean
  onBoardingComplete: boolean
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

class UserService {
  /**
   * Update user profile information
   */
  async updateProfile (data: UpdateProfileData): Promise<UserResponse> {
    const response = await api.put('/api/users/profile', data)
    return response.data
  }

  /**
   * Get current user profile
   */
  async getProfile (): Promise<UserResponse> {
    const response = await api.get('/api/users/profile')
    return response.data
  }

  /**
   * Delete user account
   */
  async deleteAccount (): Promise<void> {
    const response = await api.delete('/api/users/profile')
    return response.data
  }

  /**
   * Get user by ID (for viewing other users' profiles)
   */
  async getUserById (userId: string): Promise<UserResponse> {
    const response = await api.get(`/api/users/${userId}`)
    return response.data
  }

  /**
   * Get all users (for user discovery)
   */
  async getAllUsers (params?: {
    search?: string
    limit?: number
    skip?: number
  }): Promise<{
    users: UserResponse[]
    total: number
    hasMore: boolean
  }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())

    const response = await api.get(`/api/users/all?${queryParams.toString()}`)
    return response.data
  }
}

export default new UserService()
