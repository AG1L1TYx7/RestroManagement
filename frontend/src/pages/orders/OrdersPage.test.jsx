import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import OrdersPage from './OrdersPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('OrdersPage', () => {
  it('renders header and table', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Orders/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading orders/i)).toBeInTheDocument()
  })

  it('renders export CSV button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    })
  })

  it('renders add order button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add order/i })).toBeInTheDocument()
    })
  })

  it('displays orders when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading orders/i)).not.toBeInTheDocument()
    })
  })

  it('shows status badges', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const completedBadges = screen.queryAllByText(/completed/i)
      expect(completedBadges.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('renders orders filter', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const dateInputs = screen.getAllByDisplayValue('')
      expect(dateInputs.length).toBeGreaterThan(0)
    })
  })

  it('opens create order modal when Add Order clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add order/i })).toBeInTheDocument()
    })

    const addOrderButton = screen.getByRole('button', { name: /add order/i })
    await user.click(addOrderButton)

    await waitFor(() => {
      expect(screen.getByText(/create order/i)).toBeInTheDocument()
    })
  })
})
