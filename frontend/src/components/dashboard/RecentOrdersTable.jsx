import PropTypes from 'prop-types'
import { Badge, Card, Table } from 'react-bootstrap'
import { formatCurrency } from '../../utils/formatters'

const statusVariantMap = {
  completed: 'success',
  preparing: 'warning',
  cancelled: 'danger',
  pending: 'info',
}

const RecentOrdersTable = ({ orders }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Recent orders</h5>
            <small className="text-muted">Latest activity</small>
          </div>
        </div>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  No recent orders
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const variant = statusVariantMap[order.status] || 'secondary'
              return (
                <tr key={order.order_id}>
                  <td className="fw-semibold">#{order.order_id}</td>
                  <td>
                    <div>{order.customer_name}</div>
                    <small className="text-muted">{order.time_ago}</small>
                  </td>
                  <td>
                    <Badge bg={variant} className="text-capitalize">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="text-end">{formatCurrency(order.total_amount, { maximumFractionDigits: 2 })}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

RecentOrdersTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      customer_name: PropTypes.string.isRequired,
      total_amount: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      time_ago: PropTypes.string,
    }),
  ),
}

RecentOrdersTable.defaultProps = {
  orders: [],
}

export default RecentOrdersTable
