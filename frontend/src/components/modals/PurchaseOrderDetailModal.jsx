import { Modal, Table, Badge, Button, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { formatCurrency } from '../../utils/formatters'

const statusVariant = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'info',
  received: 'success',
  cancelled: 'danger',
}

const PurchaseOrderDetailModal = ({ show, onHide, purchaseOrder, onSubmit, onApprove, onReceive, isUpdating }) => {
  if (!purchaseOrder) return null

  const poDate = new Date(purchaseOrder.po_date)
  const expectedDate = new Date(purchaseOrder.expected_delivery_date)

  const formattedPoDate = poDate.toLocaleDateString('en-US', { dateStyle: 'medium' })
  const formattedExpectedDate = expectedDate.toLocaleDateString('en-US', { dateStyle: 'medium' })

  const canSubmit = purchaseOrder.status === 'draft'
  const canApprove = purchaseOrder.status === 'submitted'
  const canReceive = purchaseOrder.status === 'approved'

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Purchase Order #{purchaseOrder.po_id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={6}>
            <h6 className="text-muted mb-2">Supplier Information</h6>
            <p className="mb-1">
              <strong>Name:</strong> {purchaseOrder.supplier_name}
            </p>
            {purchaseOrder.supplier_contact && (
              <p className="mb-1">
                <strong>Contact:</strong> {purchaseOrder.supplier_contact}
              </p>
            )}
            {purchaseOrder.supplier_email && (
              <p className="mb-1">
                <strong>Email:</strong> {purchaseOrder.supplier_email}
              </p>
            )}
          </Col>
          <Col md={6}>
            <h6 className="text-muted mb-2">Order Details</h6>
            <p className="mb-1">
              <strong>Branch:</strong> {purchaseOrder.branch_name}
            </p>
            <p className="mb-1">
              <strong>PO Date:</strong> {formattedPoDate}
            </p>
            <p className="mb-1">
              <strong>Expected Delivery:</strong> {formattedExpectedDate}
            </p>
            <p className="mb-1">
              <strong>Status:</strong>{' '}
              <Badge bg={statusVariant[purchaseOrder.status] || 'secondary'} className="text-capitalize">
                {purchaseOrder.status}
              </Badge>
            </p>
          </Col>
        </Row>

        <h6 className="text-muted mb-3">Line Items</h6>
        <Table bordered hover size="sm" className="mb-3">
          <thead className="table-light">
            <tr>
              <th>Ingredient</th>
              <th className="text-center">Quantity</th>
              <th className="text-end">Unit Price</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
              purchaseOrder.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.ingredient_name}
                    {item.unit && <span className="text-muted small"> ({item.unit})</span>}
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.unit_price)}</td>
                  <td className="text-end">{formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  No line items available
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
                <strong>{formatCurrency(purchaseOrder.total_amount)}</strong>
              </td>
            </tr>
          </tfoot>
        </Table>

        {purchaseOrder.notes && (
          <div className="mt-3">
            <h6 className="text-muted mb-2">Notes</h6>
            <p className="text-muted small">{purchaseOrder.notes}</p>
          </div>
        )}

        {purchaseOrder.status === 'received' && purchaseOrder.received_date && (
          <div className="mt-3">
            <Alert variant="success" className="mb-0">
              <strong>Received:</strong>{' '}
              {new Date(purchaseOrder.received_date).toLocaleDateString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {purchaseOrder.received_by && <span> by {purchaseOrder.received_by}</span>}
            </Alert>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isUpdating}>
          Close
        </Button>
        {canSubmit && (
          <Button 
            variant="primary" 
            onClick={() => onSubmit && onSubmit(purchaseOrder.po_id)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        )}
        {canApprove && (
          <Button 
            variant="info" 
            onClick={() => onApprove && onApprove(purchaseOrder.po_id)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Approving...' : 'Approve PO'}
          </Button>
        )}
        {canReceive && (
          <Button 
            variant="success" 
            onClick={() => onReceive && onReceive(purchaseOrder)}
            disabled={isUpdating}
          >
            Receive Delivery
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

PurchaseOrderDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onApprove: PropTypes.func,
  onReceive: PropTypes.func,
  isUpdating: PropTypes.bool,
  purchaseOrder: PropTypes.shape({
    po_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    po_date: PropTypes.string.isRequired,
    expected_delivery_date: PropTypes.string.isRequired,
    supplier_name: PropTypes.string.isRequired,
    supplier_contact: PropTypes.string,
    supplier_email: PropTypes.string,
    branch_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    total_amount: PropTypes.number.isRequired,
    notes: PropTypes.string,
    received_date: PropTypes.string,
    received_by: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        ingredient_name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unit: PropTypes.string,
        unit_price: PropTypes.number.isRequired,
      })
    ),
  }),
}

export default PurchaseOrderDetailModal
