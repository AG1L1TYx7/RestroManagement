import { Alert, Button, Col, Row } from 'react-bootstrap'
import { useMemo } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import KPICard from '../../components/dashboard/KPICard'
import SalesTrendChart from '../../components/dashboard/SalesTrendChart'
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable'
import LowStockWidget from '../../components/dashboard/LowStockWidget'
import TopSellingList from '../../components/dashboard/TopSellingList'
import { useDashboardData } from '../../hooks/useDashboardData'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters'

const DashboardPage = () => {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useDashboardData()

  const preparedKpis = useMemo(() => {
    const today = data?.today || {}
    const inventory = data?.inventory || {}
    const weekly = data?.this_week || {}
    const growth = typeof weekly.growth_percentage === 'number' ? weekly.growth_percentage : null

    return [
      {
        title: 'Today revenue',
        value: formatCurrency(today.revenue, { maximumFractionDigits: 0 }),
        subValue: `${formatNumber(today.orders)} orders`,
        icon: 'bi-cash-stack',
        trend: growth !== null ? { value: growth, label: 'vs last week' } : null,
      },
      {
        title: 'Customers served',
        value: formatNumber(today.customers),
        subValue: 'Unique diners today',
        icon: 'bi-people',
      },
      {
        title: 'Inventory value',
        value: formatCurrency(inventory.total_value, { maximumFractionDigits: 0 }),
        subValue: `${formatNumber(inventory.low_stock_items)} low stock`,
        icon: 'bi-box-seam',
      },
      {
        title: 'Average order value',
        value: formatCurrency(today.average_order_value, { maximumFractionDigits: 2 }),
        subValue: `vs last week ${formatPercent(growth)}`,
        icon: 'bi-graph-up-arrow',
      },
    ]
  }, [data])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading dashboard" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load dashboard</h6>
          <p className="mb-0 small">{error?.message || 'Please check your connection and try again.'}</p>
        </div>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  const orders = data?.recent_orders || []
  const lowStock = data?.low_stock_items || []
  const topSelling = data?.top_selling_today || []
  const trend = data?.revenue_trend || []
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h2 className="fw-semibold mb-1">Operations dashboard</h2>
          <p className="text-muted mb-0">Realtime visibility into sales and stock health</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {lastUpdated && <small className="text-muted">Updated {lastUpdated}</small>}
          <Button variant="outline-primary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh data'}
          </Button>
        </div>
      </div>

      <Row className="g-3">
        {preparedKpis.map((kpi) => (
          <Col key={kpi.title} xs={12} md={6} xl={3}>
            <KPICard {...kpi} />
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col xl={8}>
          <SalesTrendChart data={trend} />
        </Col>
        <Col xl={4}>
          <LowStockWidget items={lowStock} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col xl={8}>
          <RecentOrdersTable orders={orders} />
        </Col>
        <Col xl={4}>
          <TopSellingList items={topSelling} />
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
