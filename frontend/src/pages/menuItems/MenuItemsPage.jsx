import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useMenuItems, useDeleteMenuItem, useToggleMenuItemStatus } from '../../hooks/useMenuItems'
import { useCategories } from '../../hooks/useCategories'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import CreateMenuItemModal from '../../components/modals/CreateMenuItemModal'
import EditMenuItemModal from '../../components/modals/EditMenuItemModal'
import { formatCurrency } from '../../utils/formatCurrency'

const MenuItemsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: menuItems = [], isLoading, isError, error, refetch } = useMenuItems()
  const { data: categories = [] } = useCategories()
  const deleteItemMutation = useDeleteMenuItem()
  const toggleStatusMutation = useToggleMenuItemStatus()

  const handleEditClick = (item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleDeleteClick = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteItemMutation.mutateAsync(itemId)
        toast.success('Menu item deleted successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to delete menu item')
      }
    }
  }

  const handleToggleStatus = async (itemId) => {
    try {
      await toggleStatusMutation.mutateAsync(itemId)
      toast.success('Menu item status updated')
    } catch (error) {
      toast.error(error?.message || 'Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading menu items" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load menu items</h6>
          <p className="mb-0 small">{error?.message || 'Please check your connection and try again.'}</p>
        </div>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-semibold mb-1">Menu Items</h2>
          <p className="text-muted mb-0">Manage your restaurant menu and pricing.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add Menu Item
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-3">No menu items found</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create First Menu Item
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {menuItems.map((item) => (
            <Col key={item.id} md={6} lg={4}>
              <Card className="border-0 shadow-sm h-100">
                {item.image_url && (
                  <Card.Img
                    variant="top"
                    src={item.image_url}
                    alt={item.item_name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{item.item_name}</h5>
                    <Badge bg={item.is_available ? 'success' : 'secondary'}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <p className="text-muted small mb-2">{item.category_name}</p>
                  {item.description && (
                    <p className="text-muted mb-3">{item.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0 text-primary">{formatCurrency(item.price)}</h4>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleEditClick(item)}
                        className="flex-grow-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={item.is_available ? 'outline-warning' : 'outline-success'}
                        onClick={() => handleToggleStatus(item.id)}
                      >
                        {item.is_available ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <CreateMenuItemModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        categories={categories}
      />

      <EditMenuItemModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        item={selectedItem}
        categories={categories}
      />
    </div>
  )
}

export default MenuItemsPage
