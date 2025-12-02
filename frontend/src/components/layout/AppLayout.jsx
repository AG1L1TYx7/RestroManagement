import { Container } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const AppLayout = () => {
  return (
    <div className="app-shell d-flex">
      <Sidebar />
      <div className="app-content">
        <Topbar />
        <main className="app-main">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
