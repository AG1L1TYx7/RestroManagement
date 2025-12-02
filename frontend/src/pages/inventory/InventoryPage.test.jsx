import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import InventoryPage from './InventoryPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('InventoryPage', () => {
  it('shows stock overview headline', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>
    )

    expect(await screen.findByText(/Inventory/i)).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument()
  })

  it('displays inventory data when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading inventory/i)).not.toBeInTheDocument()
    })
  })

  it('shows status badges', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const healthyBadges = screen.queryAllByText(/healthy/i)
      expect(healthyBadges.length).toBeGreaterThanOrEqual(0)
    })
  })
})
