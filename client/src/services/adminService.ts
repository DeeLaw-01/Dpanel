import api from '@/api/api'

export interface AdminUserData {
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

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  isVerified?: boolean
}

class AdminService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers (): Promise<AdminUserData[]> {
    const response = await api.get('/api/admin/users')
    return response.data
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById (userId: string): Promise<AdminUserData> {
    const response = await api.get(`/api/admin/users/${userId}`)
    return response.data
  }

  /**
   * Update user (admin only)
   */
  async updateUser (
    userId: string,
    data: UpdateUserData
  ): Promise<AdminUserData> {
    const response = await api.put(`/api/admin/users/${userId}`, data)
    return response.data
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser (userId: string): Promise<void> {
    const response = await api.delete(`/api/admin/users/${userId}`)
    return response.data
  }

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats (): Promise<any> {
    const response = await api.get('/api/admin/stats')
    return response.data
  }
}

export default new AdminService()
