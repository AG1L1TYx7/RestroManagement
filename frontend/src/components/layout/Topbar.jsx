import { Button, Dropdown } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'

const Topbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
      <div className="d-flex align-items-center gap-3">
        <Button variant="outline-secondary" size="sm" className="d-lg-none">
          <i className="bi bi-list" aria-hidden="true" />
        </Button>
        <div>
          <h6 className="mb-0">Welcome back</h6>
          <small className="text-muted">Monitor operations in real time</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <Button variant="outline-secondary" className="rounded-pill" size="sm">
          <i className="bi bi-bell" aria-hidden="true" />
        </Button>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 pe-3">
            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <i className="bi bi-person" aria-hidden="true" />
            </div>
            <div className="text-start">
              <div className="fw-semibold small">{user?.full_name || 'Manager'}</div>
              <small className="text-muted text-capitalize">{user?.role || 'manager'}</small>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
            <Dropdown.Item href="/settings">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout} className="text-danger">
              <i className="bi bi-box-arrow-right me-2" aria-hidden="true" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  )
}

export default Topbar
