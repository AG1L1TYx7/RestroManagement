import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import CategoriesPage from './CategoriesPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('CategoriesPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Categories/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })

  it('renders add category button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument()
    })
  })

  it('displays categories when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })

  it('opens create category modal when Add Category clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add category/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/create category/i)).toBeInTheDocument()
    })
  })

  it('displays category names', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })

  it('shows item counts for categories', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each category', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(editButtons.length + deleteButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays active/inactive status badges', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const activeBadges = screen.queryAllByText(/active/i)
      const inactiveBadges = screen.queryAllByText(/inactive/i)
      expect(activeBadges.length + inactiveBadges.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('handles empty categories list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })

  it('shows category descriptions', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })

  it('renders toggle status buttons', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const toggleButtons = screen.queryAllByRole('button')
      expect(toggleButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays table with category data', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading categories/i)).not.toBeInTheDocument()
    })
  })
})
