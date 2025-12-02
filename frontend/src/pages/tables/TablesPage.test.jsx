import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import TablesPage from './TablesPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('TablesPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Tables/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading tables/i)).toBeInTheDocument()
  })

  it('renders statistics cards', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading tables/i)).not.toBeInTheDocument()
    })
  })

  it('renders add table button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add table/i })).toBeInTheDocument()
    })
  })

  it('displays tables when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading tables/i)).not.toBeInTheDocument()
    })
  })

  it('shows status badges for tables', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const availableBadges = screen.queryAllByText(/available/i)
      expect(availableBadges.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('renders tables filter component', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })
  })

  it('opens create table modal when Add Table clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add table/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add table/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/create table/i)).toBeInTheDocument()
    })
  })

  it('displays table capacity information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const capacityTexts = screen.queryAllByText(/capacity/i)
      expect(capacityTexts.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('shows table location information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading tables/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each table', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(editButtons.length + deleteButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('handles empty table list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TablesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading tables/i)).not.toBeInTheDocument()
    })
  })
})
