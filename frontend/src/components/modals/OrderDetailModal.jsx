import { Modal, Table, Badge, Button, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { formatCurrency } from '../../utils/formatters'

const statusVariant = {
  completed: 'success',
  preparing: 'warning',
  pending: 'info',
  cancelled: 'danger',
}

const OrderDetailModal = ({ show, onHide, order, onStatusUpdate, isUpdatingStatus }) => {
  if (!order) return null

  const orderDate = new Date(order.order_date)
  const formattedDate = orderDate.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Order #{order.order_id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={6}>
            <h6 className="text-muted mb-2">Customer Information</h6>
            <p className="mb-1">
              <strong>Name:</strong> {order.customer_name}
            </p>
            {order.customer_email && (
              <p className="mb-1">
                <strong>Email:</strong> {order.customer_email}
              </p>
            )}
            {order.customer_phone && (
              <p className="mb-1">
                <strong>Phone:</strong> {order.customer_phone}
              </p>
            )}
          </Col>
          <Col md={6}>
            <h6 className="text-muted mb-2">Order Details</h6>
            <p className="mb-1">
              <strong>Branch:</strong> {order.branch_name}
            </p>
            <p className="mb-1">
              <strong>Date:</strong> {formattedDate}
            </p>
            <p className="mb-1">
              <strong>Status:</strong>{' '}
              <Badge bg={statusVariant[order.status] || 'secondary'} className="text-capitalize">
                {order.status}
              </Badge>
            </p>
          </Col>
        </Row>

        <h6 className="text-muted mb-3">Order Items</h6>
        <Table bordered hover size="sm" className="mb-3">
          <thead className="table-light">
            <tr>
              <th>Item</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Price</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.menu_item_name || item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.unit_price)}</td>
                  <td className="text-end">{formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  No items available
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td colSpan="3" className="text-end">
                <strong>Total:</strong>
              </td>
              <td className="text-end">
                <strong>{formatCurrency(order.total_amount)}</strong>
              </td>
            </tr>
          </tfoot>
        </Table>

        {order.notes && (
          <div className="mt-3">
            <h6 className="text-muted mb-2">Notes</h6>
            <p className="text-muted small">{order.notes}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isUpdatingStatus}>
          Close
        </Button>
        {order.status === 'pending' && (
          <Button 
            variant="warning" 
            onClick={() => onStatusUpdate(order.order_id, 'preparing')}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Updating...' : 'Mark as Preparing'}
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button 
            variant="success" 
            onClick={() => onStatusUpdate(order.order_id, 'completed')}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Updating...' : 'Mark as Completed'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

OrderDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
  isUpdatingStatus: PropTypes.bool,
  order: PropTypes.shape({
    order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    order_date: PropTypes.string.isRequired,
    customer_name: PropTypes.string.isRequired,
    customer_email: PropTypes.string,
    customer_phone: PropTypes.string,
    branch_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    total_amount: PropTypes.number.isRequired,
    notes: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        menu_item_name: PropTypes.string,
        name: PropTypes.string,
        quantity: PropTypes.number.isRequired,
        unit_price: PropTypes.number.isRequired,
      })
    ),
  }),
}

export default OrderDetailModal
