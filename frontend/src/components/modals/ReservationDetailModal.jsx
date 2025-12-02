import { Modal, Button, Badge } from 'react-bootstrap'
import PropTypes from 'prop-types'

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'secondary',
}

const ReservationDetailModal = ({ show, onHide, reservation }) => {
  if (!reservation) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Reservation Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="mb-1">{reservation.customer_name}</h5>
            <p className="text-muted mb-0">Reservation #{reservation.id}</p>
          </div>
          <Badge bg={statusVariant[reservation.status]} className="px-3 py-2">
            {reservation.status?.toUpperCase()}
          </Badge>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="border-start border-primary border-4 ps-3">
              <p className="text-muted mb-1 small">Date & Time</p>
              <h6 className="mb-0">{formatDate(reservation.reservation_date)}</h6>
              <p className="mb-0">{formatTime(reservation.reservation_time)}</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border-start border-primary border-4 ps-3">
              <p className="text-muted mb-1 small">Party Size</p>
              <h6 className="mb-0">{reservation.party_size} Guests</h6>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border-start border-primary border-4 ps-3">
              <p className="text-muted mb-1 small">Table</p>
              <h6 className="mb-0">{reservation.table_number || 'Not assigned'}</h6>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border-start border-primary border-4 ps-3">
              <p className="text-muted mb-1 small">Contact</p>
              <h6 className="mb-1">{reservation.customer_phone}</h6>
              {reservation.customer_email && (
                <p className="mb-0 small text-muted">{reservation.customer_email}</p>
              )}
            </div>
          </div>

          {reservation.special_requests && (
            <div className="col-12">
              <div className="bg-light p-3 rounded">
                <p className="text-muted mb-1 small">Special Requests</p>
                <p className="mb-0">{reservation.special_requests}</p>
              </div>
            </div>
          )}

          {reservation.notes && (
            <div className="col-12">
              <div className="bg-light p-3 rounded">
                <p className="text-muted mb-1 small">Internal Notes</p>
                <p className="mb-0">{reservation.notes}</p>
              </div>
            </div>
          )}

          <div className="col-12">
            <div className="border-top pt-3">
              <div className="row text-muted small">
                <div className="col-md-6">
                  <p className="mb-1">Created: {new Date(reservation.created_at).toLocaleString()}</p>
                </div>
                {reservation.updated_at && (
                  <div className="col-md-6">
                    <p className="mb-1">Updated: {new Date(reservation.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

ReservationDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  reservation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    customer_name: PropTypes.string.isRequired,
    customer_phone: PropTypes.string.isRequired,
    customer_email: PropTypes.string,
    reservation_date: PropTypes.string.isRequired,
    reservation_time: PropTypes.string.isRequired,
    party_size: PropTypes.number.isRequired,
    table_number: PropTypes.string,
    status: PropTypes.string.isRequired,
    special_requests: PropTypes.string,
    notes: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),
}

export default ReservationDetailModal
