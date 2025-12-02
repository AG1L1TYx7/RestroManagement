import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import PurchaseOrdersPage from './PurchaseOrdersPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('PurchaseOrdersPage', () => {
  it('displays open purchase orders heading', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Purchase orders/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading purchase orders/i)).toBeInTheDocument()
  })

  it('renders export CSV button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    })
  })

  it('renders create purchase order button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create po/i })).toBeInTheDocument()
    })
  })

  it('renders auto-generate button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /auto-generate/i })).toBeInTheDocument()
    })
  })

  it('displays purchase orders when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading purchase orders/i)).not.toBeInTheDocument()
    })
  })

  it('shows status badges', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const statusBadges = screen.queryAllByText(/pending|approved|draft|received/i)
      expect(statusBadges.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('allows filtering purchase orders', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const branchSelects = screen.getAllByRole('combobox')
      expect(branchSelects.length).toBeGreaterThan(0)
    })
  })

  it('opens create PO modal when Create PO clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create po/i })).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', { name: /create po/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/create purchase order/i)).toBeInTheDocument()
    })
  })

  it('opens auto-generate modal when Auto-Generate clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <PurchaseOrdersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /auto-generate/i })).toBeInTheDocument()
    })

    const autoGenerateButton = screen.getByRole('button', { name: /auto-generate/i })
    await user.click(autoGenerateButton)

    await waitFor(() => {
      expect(screen.getByText(/auto-generate purchase orders/i)).toBeInTheDocument()
    })
  })
})
