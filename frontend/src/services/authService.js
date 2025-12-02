import { apiClient, setAuthToken } from './apiClient'

export const login = async (identifier, password) => {
  console.log('[Auth] Login attempt:', { identifier: identifier?.substring(0, 3) + '***' })
  const { data } = await apiClient.post('/auth/login', { identifier, password })
  console.log('[Auth] Login response:', { 
    status: data?.status, 
    hasUser: !!data?.data?.user,
    hasToken: !!data?.data?.tokens?.accessToken 
  })
  
  const accessToken = data?.data?.tokens?.accessToken
  const user = data?.data?.user

  if (accessToken) {
    setAuthToken(accessToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  return { user, token: accessToken }
}

export const logout = () => {
  setAuthToken(null)
  localStorage.removeItem('user')
}
