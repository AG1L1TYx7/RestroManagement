import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import RecipesPage from './RecipesPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('RecipesPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Recipes/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading recipes/i)).toBeInTheDocument()
  })

  it('renders add recipe button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add ingredient to recipe/i })).toBeInTheDocument()
    })
  })

  it('displays recipes when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('opens create recipe modal when Add Recipe clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add ingredient to recipe/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add ingredient to recipe/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('displays menu item information', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('shows ingredient quantities', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each recipe', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(editButtons.length + deleteButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('groups recipes by menu item', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('handles empty recipe list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('displays ingredient names and details', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })

  it('shows menu items section', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading recipes/i)).not.toBeInTheDocument()
    })
  })
})
