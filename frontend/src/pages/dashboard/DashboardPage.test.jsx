import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './DashboardPage'

const refetchMock = vi.fn()
const useDashboardDataMock = vi.fn()

vi.mock('../../components/dashboard/SalesTrendChart', () => ({
  __esModule: true,
  default: () => <div data-testid="sales-chart" />,
}))

const sampleData = {
  today: {
    revenue: 1520,
    orders: 42,
    customers: 35,
    average_order_value: 36.19,
  },
  this_week: {
    growth_percentage: 12.5,
  },
  inventory: {
    total_value: 15250.75,
    low_stock_items: 3,
  },
  revenue_trend: [
    { date: 'Mon', revenue: 1200 },
    { date: 'Tue', revenue: 1500 },
  ],
  top_selling_today: [
    { item_name: 'Chicken Curry', quantity: 15, revenue: 225 },
  ],
  recent_orders: [
    { order_id: 1, customer_name: 'John', total_amount: 45.5, status: 'completed', time_ago: 'just now' },
  ],
  low_stock_items: [
    { ingredient: 'Basil', current_stock: 2, unit: 'kg', status: 'critical' },
  ],
}

vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: (...args) => useDashboardDataMock(...args),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    refetchMock.mockReset()
    useDashboardDataMock.mockReturnValue({
      data: sampleData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchMock,
      isFetching: false,
      dataUpdatedAt: Date.now(),
    })
  })

  it('renders KPI cards and sections when data is available', () => {
    render(<DashboardPage />)

    expect(screen.getByText(/Operations dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Today revenue/i)).toBeInTheDocument()
    expect(screen.getByText(/Recent orders/i)).toBeInTheDocument()
    expect(screen.getByText(/Top selling today/i)).toBeInTheDocument()
  })

  it('shows loading spinner while fetching data', () => {
    useDashboardDataMock.mockReturnValueOnce({ isLoading: true })
    render(<DashboardPage />)

    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument()
  })
})
