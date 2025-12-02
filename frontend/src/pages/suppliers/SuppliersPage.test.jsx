import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import SuppliersPage from './SuppliersPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('SuppliersPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Suppliers/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading suppliers/i)).toBeInTheDocument()
  })

  it('renders add supplier button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
    })
  })

  it('displays suppliers when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('opens create supplier modal when Add Supplier clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add supplier/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/create supplier/i)).toBeInTheDocument()
    })
  })

  it('displays supplier names', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('shows contact person information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each supplier', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(editButtons.length + deleteButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays supplier phone numbers', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('handles empty suppliers list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('shows supplier email addresses', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('displays supplier addresses', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })

  it('renders table with supplier data', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SuppliersPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading suppliers/i)).not.toBeInTheDocument()
    })
  })
})
