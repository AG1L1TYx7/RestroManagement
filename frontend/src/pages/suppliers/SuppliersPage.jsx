import { useState } from 'react'
import { Alert, Button, Card, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useSuppliers, useDeleteSupplier } from '../../hooks/useSuppliers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import CreateSupplierModal from '../../components/modals/CreateSupplierModal'
import EditSupplierModal from '../../components/modals/EditSupplierModal'

const SuppliersPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: suppliers = [], isLoading, isError, error, refetch } = useSuppliers()
  const deleteSupplierMutation = useDeleteSupplier()

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier)
    setShowEditModal(true)
  }

  const handleDeleteClick = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplierMutation.mutateAsync(supplierId)
        toast.success('Supplier deleted successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to delete supplier')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading suppliers" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load suppliers</h6>
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
          <h2 className="fw-semibold mb-1">Suppliers</h2>
          <p className="text-muted mb-0">Manage your vendor relationships and contacts.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add Supplier
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {suppliers.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No suppliers found</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Add First Supplier
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="fw-semibold">{supplier.supplier_name}</td>
                      <td>{supplier.contact_person || '-'}</td>
                      <td>{supplier.phone || '-'}</td>
                      <td>{supplier.email || '-'}</td>
                      <td>{supplier.address || '-'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(supplier)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(supplier.id)}
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

      <CreateSupplierModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />

      <EditSupplierModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        supplier={selectedSupplier}
      />
    </div>
  )
}

export default SuppliersPage
