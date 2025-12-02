import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateOrderModal from '../../../src/components/modals/CreateOrderModal'

const mockBranches = [
  { branch_id: 1, name: 'Downtown Branch', address: '123 Main St' },
  { branch_id: 2, name: 'Uptown Branch', address: '456 Oak Ave' },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('CreateOrderModal', () => {
  it('renders modal when show is true', () => {
    const wrapper = createWrapper()
    render(
      <CreateOrderModal
        show={true}
        onHide={vi.fn()}
        branches={mockBranches}
        onSubmit={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Create New Order')).toBeInTheDocument()
  })

  it('does not render when show is false', () => {
    const wrapper = createWrapper()
    const { container } = render(
      <CreateOrderModal
        show={false}
        onHide={vi.fn()}
        branches={mockBranches}
        onSubmit={vi.fn()}
      />,
      { wrapper }
    )

    expect(container.querySelector('.modal')).not.toBeInTheDocument()
  })

  it('calls onHide when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onHide = vi.fn()
    const wrapper = createWrapper()

    render(
      <CreateOrderModal
        show={true}
        onHide={onHide}
        branches={mockBranches}
        onSubmit={vi.fn()}
      />,
      { wrapper }
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onHide).toHaveBeenCalled()
  })
})
