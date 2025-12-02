import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderDetailModal from '../../../src/components/modals/OrderDetailModal'

const mockOrder = {
  order_id: 1,
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '123-456-7890',
  branch_name: 'Downtown Branch',
  status: 'pending',
  total_amount: 25.98,
  order_date: '2024-01-15T10:30:00Z',
  notes: 'Extra napkins please',
  line_items: [
    {
      item_name: 'Margherita Pizza',
      quantity: 1,
      unit_price: 12.99,
      subtotal: 12.99,
    },
    {
      item_name: 'Caesar Salad',
      quantity: 1,
      unit_price: 8.99,
      subtotal: 8.99,
    },
  ],
}

describe('OrderDetailModal', () => {
  it('renders order details when order is provided', () => {
    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={mockOrder}
        onStatusUpdate={vi.fn()}
        isUpdatingStatus={false}
      />
    )

    expect(screen.getByText(/order #1/i)).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Downtown Branch')).toBeInTheDocument()
  })

  it('shows "Mark as Preparing" button for pending orders', () => {
    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={mockOrder}
        onStatusUpdate={vi.fn()}
        isUpdatingStatus={false}
      />
    )

    expect(screen.getByRole('button', { name: /mark as preparing/i })).toBeInTheDocument()
  })

  it('shows "Mark as Completed" button for preparing orders', () => {
    const preparingOrder = { ...mockOrder, status: 'preparing' }
    
    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={preparingOrder}
        onStatusUpdate={vi.fn()}
        isUpdatingStatus={false}
      />
    )

    expect(screen.getByRole('button', { name: /mark as completed/i })).toBeInTheDocument()
  })

  it('calls onStatusUpdate when status button is clicked', async () => {
    const user = userEvent.setup()
    const onStatusUpdate = vi.fn()

    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={mockOrder}
        onStatusUpdate={onStatusUpdate}
        isUpdatingStatus={false}
      />
    )

    const button = screen.getByRole('button', { name: /mark as preparing/i })
    await user.click(button)

    expect(onStatusUpdate).toHaveBeenCalledWith(1, 'preparing')
  })

  it('disables buttons when isUpdatingStatus is true', () => {
    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={mockOrder}
        onStatusUpdate={vi.fn()}
        isUpdatingStatus={true}
      />
    )

    const button = screen.getByRole('button', { name: /updating/i })
    expect(button).toBeDisabled()
  })

  it('shows empty message when no line items', () => {
    const orderWithoutItems = { ...mockOrder, line_items: [] }
    
    render(
      <OrderDetailModal
        show={true}
        onHide={vi.fn()}
        order={orderWithoutItems}
        onStatusUpdate={vi.fn()}
        isUpdatingStatus={false}
      />
    )

    expect(screen.getByText(/no items available/i)).toBeInTheDocument()
  })
})
