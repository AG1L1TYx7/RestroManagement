import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useCategories, useDeleteCategory, useToggleCategoryStatus } from '../../hooks/useCategories'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import CreateCategoryModal from '../../components/modals/CreateCategoryModal'
import EditCategoryModal from '../../components/modals/EditCategoryModal'

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: categories = [], isLoading, isError, error, refetch } = useCategories({ with_count: true })
  const deleteCategoryMutation = useDeleteCategory()
  const toggleStatusMutation = useToggleCategoryStatus()

  const handleEditClick = (category) => {
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId)
        toast.success('Category deleted successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to delete category')
      }
    }
  }

  const handleToggleStatus = async (categoryId) => {
    try {
      await toggleStatusMutation.mutateAsync(categoryId)
      toast.success('Category status updated')
    } catch (error) {
      toast.error(error?.message || 'Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading categories" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load categories</h6>
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
          <h2 className="fw-semibold mb-1">Categories</h2>
          <p className="text-muted mb-0">Organize your menu items into categories.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add Category
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {categories.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No categories found</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Menu Items</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="fw-semibold">{category.category_name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <Badge bg="secondary">{category.item_count || 0} items</Badge>
                      </td>
                      <td>
                        <Badge bg={category.is_active ? 'success' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={category.is_active ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggleStatus(category.id)}
                          >
                            {category.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(category.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <CreateCategoryModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />

      <EditCategoryModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        category={selectedCategory}
      />
    </div>
  )
}

export default CategoriesPage
