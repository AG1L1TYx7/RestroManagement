import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { AuthContext } from './AuthContext.jsx'
import { login as loginRequest, logout as logoutRequest } from '../services/authService'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [error, setError] = useState(null)

  const login = async (identifier, password) => {
    setError(null)
    try {
      const { user: authUser } = await loginRequest(identifier, password)
      setUser(authUser)
      return authUser
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to login'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    logoutRequest()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      error,
      login,
      logout,
      clearError: () => setError(null),
    }),
    [user, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthProvider
