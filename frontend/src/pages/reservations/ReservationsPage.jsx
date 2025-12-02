import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useReservations, useUpdateReservationStatus, useCancelReservation } from '../../hooks/useReservations'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import CreateReservationModal from '../../components/modals/CreateReservationModal'
import ReservationDetailModal from '../../components/modals/ReservationDetailModal'

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'secondary',
}

const ReservationsPage = () => {
  const [filters] = useState({})
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data: reservations = [], isLoading, isError, error, refetch } = useReservations(filters)
  const updateStatusMutation = useUpdateReservationStatus()
  const cancelReservationMutation = useCancelReservation()

  const handleViewClick = (reservation) => {
    setSelectedReservation(reservation)
    setShowDetailModal(true)
  }

  const handleCancelClick = async (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await cancelReservationMutation.mutateAsync(reservationId)
        toast.success('Reservation cancelled successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to cancel reservation')
      }
    }
  }

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: reservationId, status: newStatus })
      toast.success('Reservation status updated successfully')
    } catch (error) {
      toast.error(error?.message || 'Failed to update status')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading reservations" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load reservations</h6>
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
          <h2 className="fw-semibold mb-1">Reservations</h2>
          <p className="text-muted mb-0">Manage customer reservations and table bookings.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          New Reservation
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {reservations.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No reservations found</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Reservation
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Date & Time</th>
                    <th>Table</th>
                    <th>Party Size</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{reservation.customer_name}</div>
                          <small className="text-muted">{reservation.customer_phone}</small>
                        </div>
                      </td>
                      <td>
                        <div>{formatDate(reservation.reservation_date)}</div>
                        <small className="text-muted">{formatTime(reservation.reservation_time)}</small>
                      </td>
                      <td>{reservation.table_number || '-'}</td>
                      <td>{reservation.party_size} guests</td>
                      <td>
                        <Badge bg={statusVariant[reservation.status]}>
                          {reservation.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleViewClick(reservation)}
                          >
                            View
                          </Button>
                          {reservation.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancelClick(reservation.id)}
                            >
                              Cancel
                            </Button>
                          )}
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

      <CreateReservationModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />

      <ReservationDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        reservation={selectedReservation}
      />
    </div>
  )
}

export default ReservationsPage
