import api from '@/api/api'

export interface Friend {
  id: string
  name: string
  username: string
  avatar?: string
  status: 'online' | 'offline'
  lastSeen: string
  currentGame?: string
}

export interface FriendRequest {
  id: string
  name: string
  username: string
  avatar?: string
  mutualFriends: number
}

export interface AddFriendData {
  username?: string
  email?: string
}

class FriendsService {
  /**
   * Get all friends
   */
  async getFriends (): Promise<Friend[]> {
    const response = await api.get('/api/friends')
    return response.data
  }

  /**
   * Get online friends
   */
  async getOnlineFriends (): Promise<Friend[]> {
    const response = await api.get('/api/friends/online')
    return response.data
  }

  /**
   * Get friend requests
   */
  async getFriendRequests (): Promise<FriendRequest[]> {
    const response = await api.get('/api/friends/requests')
    return response.data
  }

  /**
   * Send friend request
   */
  async sendFriendRequest (data: AddFriendData): Promise<void> {
    const response = await api.post('/api/friends/request', data)
    return response.data
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest (requestId: string): Promise<void> {
    const response = await api.post(`/api/friends/accept/${requestId}`)
    return response.data
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest (requestId: string): Promise<void> {
    const response = await api.post(`/api/friends/decline/${requestId}`)
    return response.data
  }

  /**
   * Remove friend
   */
  async removeFriend (friendId: string): Promise<void> {
    const response = await api.delete(`/api/friends/${friendId}`)
    return response.data
  }

  /**
   * Search for users to add as friends
   */
  async searchUsers (query: string): Promise<any[]> {
    const response = await api.get(
      `/api/friends/search?q=${encodeURIComponent(query)}`
    )
    return response.data
  }
}

export default new FriendsService()
