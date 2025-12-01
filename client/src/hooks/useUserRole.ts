export type UserRole = 'admin' | 'readonly'

export function useUserRole(): { role: UserRole; isAdmin: boolean; isReadOnly: boolean } {
  const role = (sessionStorage.getItem('dpanel_role') || 'readonly') as UserRole
  return {
    role,
    isAdmin: role === 'admin',
    isReadOnly: role === 'readonly'
  }
}

