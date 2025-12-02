import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
      <div className="brand-gradient px-4 py-2 rounded-pill fw-semibold mb-3">404</div>
      <h2 className="fw-semibold mb-2">Page not found</h2>
      <p className="text-muted mb-4" style={{ maxWidth: 420 }}>
        The page you are looking for may have been moved or no longer exists. Please return to the dashboard to continue.
      </p>
      <Button onClick={() => navigate('/dashboard')} size="lg">
        Back to dashboard
      </Button>
    </div>
  )
}

export default NotFoundPage
