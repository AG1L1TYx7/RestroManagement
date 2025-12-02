import PropTypes from 'prop-types'
import { Card, ListGroup } from 'react-bootstrap'
import { formatCurrency } from '../../utils/formatters'

const TopSellingList = ({ items }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Top selling today</h5>
            <small className="text-muted">Best performing dishes</small>
          </div>
        </div>
        <ListGroup variant="flush">
          {items.length === 0 && (
            <ListGroup.Item className="text-center text-muted py-4">No sales recorded yet</ListGroup.Item>
          )}
          {items.map((item) => (
            <ListGroup.Item key={item.item_name} className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{item.item_name}</div>
                <small className="text-muted">{item.quantity} orders</small>
              </div>
              <div className="fw-semibold">{formatCurrency(item.revenue, { maximumFractionDigits: 2 })}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

TopSellingList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      item_name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      revenue: PropTypes.number.isRequired,
    }),
  ),
}

TopSellingList.defaultProps = {
  items: [],
}

export default TopSellingList
