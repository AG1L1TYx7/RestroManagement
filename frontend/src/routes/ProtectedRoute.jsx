import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <LoadingSpinner label="Loading workspace" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ProtectedRoute
