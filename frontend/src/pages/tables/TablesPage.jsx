import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useTables, useTableStatistics, useDeleteTable, useUpdateTableStatus } from '../../hooks/useTables'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import TablesFilter from '../../components/filters/TablesFilter'
import CreateTableModal from '../../components/modals/CreateTableModal'
import EditTableModal from '../../components/modals/EditTableModal'

const statusVariant = {
  available: 'success',
  occupied: 'danger',
  reserved: 'warning',
}

const TablesPage = () => {
  const [filters, setFilters] = useState({})
  const [selectedTable, setSelectedTable] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: tables = [], isLoading, isError, error, refetch } = useTables(filters)
  const { data: statistics } = useTableStatistics()
  const deleteTableMutation = useDeleteTable()
  const updateStatusMutation = useUpdateTableStatus()

  const handleEditClick = (table) => {
    setSelectedTable(table)
    setShowEditModal(true)
  }

  const handleDeleteClick = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTableMutation.mutateAsync(tableId)
        toast.success('Table deleted successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to delete table')
      }
    }
  }

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: tableId, status: newStatus })
      toast.success('Table status updated successfully')
    } catch (error) {
      toast.error(error?.message || 'Failed to update table status')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading tables" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load tables</h6>
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
          <h2 className="fw-semibold mb-1">Tables</h2>
          <p className="text-muted mb-0">Manage restaurant tables and seating arrangements.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add Table
        </Button>
      </div>

      {statistics && (
        <Row className="g-3">
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Total Tables</p>
                    <h3 className="fw-bold mb-0">{statistics.totalTables || 0}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Available</p>
                    <h3 className="fw-bold mb-0 text-success">{statistics.availableTables || 0}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Occupied</p>
                    <h3 className="fw-bold mb-0 text-danger">{statistics.occupiedTables || 0}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Reserved</p>
                    <h3 className="fw-bold mb-0 text-warning">{statistics.reservedTables || 0}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <TablesFilter onFilterChange={setFilters} />

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {tables.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No tables found</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Add First Table
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Table Number</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td className="fw-semibold">{table.table_number}</td>
                      <td>{table.capacity} seats</td>
                      <td>{table.location || '-'}</td>
                      <td>
                        <Badge bg={statusVariant[table.status]}>
                          {table.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(table)}
                          >
                            Edit
                          </Button>
                          {table.status !== 'available' && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleStatusChange(table.id, 'available')}
                            >
                              Set Available
                            </Button>
                          )}
                          {table.status !== 'occupied' && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleStatusChange(table.id, 'occupied')}
                            >
                              Set Occupied
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(table.id)}
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

      <CreateTableModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />

      <EditTableModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        table={selectedTable}
      />
    </div>
  )
}

export default TablesPage
