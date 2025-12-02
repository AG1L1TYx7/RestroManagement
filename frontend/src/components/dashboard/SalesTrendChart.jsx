import PropTypes from 'prop-types'
import { Card } from 'react-bootstrap'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const SalesTrendChart = ({ data }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Revenue trend</h5>
            <small className="text-muted">Last 7 days</small>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                cursor={{ stroke: '#0d6efd', strokeWidth: 1 }}
                formatter={(value) => [formatCurrency(value, { maximumFractionDigits: 0 }), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  )
}

SalesTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
    }),
  ),
}

SalesTrendChart.defaultProps = {
  data: [],
}

export default SalesTrendChart
