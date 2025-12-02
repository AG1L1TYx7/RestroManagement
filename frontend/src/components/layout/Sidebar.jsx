import { NavLink } from 'react-router-dom'
import { Nav } from 'react-bootstrap'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { 
    section: 'Operations',
    items: [
      { to: '/orders', label: 'Orders', icon: 'bi-receipt-cutoff' },
      { to: '/inventory', label: 'Inventory', icon: 'bi-box-seam' },
      { to: '/purchase-orders', label: 'Purchase Orders', icon: 'bi-truck' },
    ]
  },
  {
    section: 'Menu Management',
    items: [
      { to: '/menu-items', label: 'Menu Items', icon: 'bi-card-list' },
      { to: '/categories', label: 'Categories', icon: 'bi-tags' },
      { to: '/recipes', label: 'Recipes', icon: 'bi-journal-text' },
    ]
  },
  {
    section: 'Reservations',
    items: [
      { to: '/tables', label: 'Tables', icon: 'bi-table' },
      { to: '/reservations', label: 'Reservations', icon: 'bi-calendar-check' },
    ]
  },
  { to: '/suppliers', label: 'Suppliers', icon: 'bi-people' },
  { to: '/analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
]

const Sidebar = () => {
  return (
    <aside className="sidebar d-flex flex-column p-4 gap-4">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="brand-gradient px-3 py-2 rounded-pill fw-semibold">DBMS</span>
        </div>
        <small className="text-muted-sm">Restaurant Control Center</small>
      </div>

      <Nav className="flex-column gap-2">
        {navItems.map((item, index) => {
          // Single nav item
          if (item.to) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-3 py-2 ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon} fs-5`} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          }
          
          // Section with multiple items
          if (item.section) {
            return (
              <div key={index} className="mb-2">
                <small className="text-muted-sm px-3 d-block mb-2 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  {item.section}
                </small>
                {item.items.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-3 px-3 py-2 ${isActive ? 'active' : ''}`
                    }
                  >
                    <i className={`bi ${subItem.icon} fs-5`} aria-hidden="true" />
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )
          }
          
          return null
        })}
      </Nav>

      <div className="mt-auto">
        <small className="text-muted-sm d-block">Inventory Status</small>
        <div className="progress" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar bg-success" style={{ width: '62%' }} />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
