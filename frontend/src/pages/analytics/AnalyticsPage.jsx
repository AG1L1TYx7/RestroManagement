import { Card, Col, Row, Alert } from 'react-bootstrap'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSalesOverview, useRevenueTrends, useTopSellingItems, useCategoryPerformance, useFoodCostRatio } from '../../hooks/useAnalytics'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

const AnalyticsPage = () => {
  const { data: salesOverview, isLoading: loadingSales } = useSalesOverview()
  const { data: revenueTrends, isLoading: loadingTrends } = useRevenueTrends()
  const { data: topItems, isLoading: loadingTopItems } = useTopSellingItems()
  const { data: categoryPerf, isLoading: loadingCategory } = useCategoryPerformance()
  const { data: foodCost, isLoading: loadingFoodCost } = useFoodCostRatio()

  const isLoading = loadingSales || loadingTrends || loadingTopItems || loadingCategory || loadingFoodCost

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading analytics" />
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-semibold mb-1">Analytics</h2>
        <p className="text-muted mb-0">Dive deeper into cost, sales, and operational KPIs.</p>
      </div>

      {/* Key Metrics */}
      <Row className="g-3">
        <Col xs={12} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <small className="text-uppercase text-muted fw-semibold">Total Revenue</small>
              <h3 className="fw-semibold my-2">{formatCurrency(salesOverview?.total_revenue || 0)}</h3>
              <small className="text-success">
                +{salesOverview?.revenue_growth || 0}% vs last month
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <small className="text-uppercase text-muted fw-semibold">Total Orders</small>
              <h3 className="fw-semibold my-2">{salesOverview?.total_orders || 0}</h3>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <small className="text-uppercase text-muted fw-semibold">Avg Order Value</small>
              <h3 className="fw-semibold my-2">{formatCurrency(salesOverview?.average_order_value || 0)}</h3>
              <small className="text-muted">Per order</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <small className="text-uppercase text-muted fw-semibold">Food Cost Ratio</small>
              <h3 className="fw-semibold my-2">{foodCost?.current_ratio || 0}%</h3>
              <small className={foodCost?.current_ratio > foodCost?.target_ratio ? 'text-warning' : 'text-success'}>
                Goal: {foodCost?.target_ratio || 0}%
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Trends Chart */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Revenue Trends (Last 7 Days)</h5>
          {revenueTrends && revenueTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Alert variant="info">No revenue trend data available</Alert>
          )}
        </Card.Body>
      </Card>

      {/* Category Performance and Top Selling Items */}
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Category Performance</h5>
              {categoryPerf && categoryPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerf}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0d6efd" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Alert variant="info">No category data available</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Top Selling Items</h5>
              {topItems && topItems.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-end">Qty Sold</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item_name}</td>
                          <td className="text-end">{item.quantity_sold}</td>
                          <td className="text-end">{formatCurrency(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert variant="info">No top selling items data available</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsPage
