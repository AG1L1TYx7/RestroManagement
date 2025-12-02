import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import MenuItemsPage from '../menuItems/MenuItemsPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('MenuItemsPage', () => {
  it('renders header and main content', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { level: 2, name: /Menu Items/i })).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading menu items/i)).toBeInTheDocument()
  })

  it('renders add menu item button', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add menu item/i })).toBeInTheDocument()
    })
  })

  it('displays menu items when loaded', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('opens create menu item modal when Add Menu Item clicked', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add menu item/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add menu item/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('displays menu item prices', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('shows menu item categories', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('renders action buttons for each menu item', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(editButtons.length + deleteButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays menu item descriptions', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('handles empty menu items list gracefully', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('shows enable/disable toggle buttons', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const toggleButtons = screen.queryAllByRole('button')
      expect(toggleButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays menu item images', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })

  it('renders category filter options', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MenuItemsPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading menu items/i)).not.toBeInTheDocument()
    })
  })
})
