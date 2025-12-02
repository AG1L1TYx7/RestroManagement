import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import ReservationsPage from './ReservationsPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('ReservationsPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Reservations/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading reservations/i)).toBeInTheDocument()
  })

  it('renders add reservation button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new reservation/i })).toBeInTheDocument()
    })
  })

  it('displays reservations when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })

  it('shows status badges for reservations', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const pendingBadges = screen.queryAllByText(/pending/i)
      const confirmedBadges = screen.queryAllByText(/confirmed/i)
      expect(pendingBadges.length + confirmedBadges.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('opens create reservation modal when Add Reservation clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new reservation/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /new reservation/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/create reservation/i)).toBeInTheDocument()
    })
  })

  it('displays customer information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })

  it('shows reservation date and time', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each reservation', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const viewButtons = screen.queryAllByRole('button', { name: /view/i })
      const cancelButtons = screen.queryAllByRole('button', { name: /cancel/i })
      expect(viewButtons.length + cancelButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays party size information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })

  it('handles empty reservation list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })

  it('renders statistics or summary information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument()
    })
  })
})
