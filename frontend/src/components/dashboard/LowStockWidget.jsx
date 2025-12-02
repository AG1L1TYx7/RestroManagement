import PropTypes from 'prop-types'
import { Badge, Card, ListGroup } from 'react-bootstrap'

const statusVariant = {
  critical: 'danger',
  low: 'warning',
  healthy: 'success',
}

const LowStockWidget = ({ items }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Low stock alerts</h5>
            <small className="text-muted">Critical ingredients</small>
          </div>
          <Badge bg="light" text="dark">
            {items.length}
          </Badge>
        </div>
        <ListGroup variant="flush">
          {items.length === 0 && (
            <ListGroup.Item className="text-center text-muted py-4">Inventory looks healthy</ListGroup.Item>
          )}
          {items.map((item) => (
            <ListGroup.Item key={item.ingredient} className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{item.ingredient}</div>
                <small className="text-muted">
                  {item.current_stock} {item.unit}
                </small>
              </div>
              <Badge bg={statusVariant[item.status] || 'secondary'} className="text-capitalize">
                {item.status}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

LowStockWidget.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      ingredient: PropTypes.string.isRequired,
      current_stock: PropTypes.number.isRequired,
      unit: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    }),
  ),
}

LowStockWidget.defaultProps = {
  items: [],
}

export default LowStockWidget
