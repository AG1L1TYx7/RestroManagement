import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReceiveDeliveryModal from './ReceiveDeliveryModal'

describe('ReceiveDeliveryModal', () => {
  let mockOnHide
  let mockOnSubmit
  const mockPurchaseOrder = {
    po_id: 123,
    supplier_name: 'Fresh Produce Co.',
    expected_delivery_date: '2024-01-15',
    line_items: [
      {
        po_line_id: 1,
        ingredient_name: 'Tomatoes',
        unit: 'kg',
        quantity: 50,
        unit_price: 2.5,
      },
      {
        po_line_id: 2,
        ingredient_name: 'Onions',
        unit: 'kg',
        quantity: 30,
        unit_price: 1.8,
      },
    ],
  }

  beforeEach(() => {
    mockOnHide = vi.fn()
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  })

  it('renders nothing when purchaseOrder is null', () => {
    const { container } = render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={null} onSubmit={mockOnSubmit} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders purchase order details', () => {
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    expect(screen.getByText(/Receive Delivery - PO-123/i)).toBeInTheDocument()
    expect(screen.getByText(/Fresh Produce Co\./i)).toBeInTheDocument()
    expect(screen.getByText(/1\/14\/2024/i)).toBeInTheDocument()
  })

  it('renders all line items with default quantities', () => {
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('50 kg')).toBeInTheDocument()
    expect(screen.getByText('$3')).toBeInTheDocument()

    expect(screen.getByText('Onions')).toBeInTheDocument()
    expect(screen.getByText('30 kg')).toBeInTheDocument()
    expect(screen.getByText('$2')).toBeInTheDocument()
  })

  it('allows updating received quantities', async () => {
    const user = userEvent.setup()
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(2)

    await user.clear(inputs[0])
    await user.type(inputs[0], '45')

    await waitFor(() => {
      expect(inputs[0]).toHaveValue(45)
    })
  })

  it('shows validation error for negative quantity', async () => {
    const user = userEvent.setup()
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '-5')

    const submitButton = screen.getByRole('button', { name: /confirm receipt/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/quantity cannot be negative/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for non-numeric quantity', async () => {
    const user = userEvent.setup()
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], 'abc')

    const submitButton = screen.getByRole('button', { name: /confirm receipt/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/quantity must be a number/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with updated quantities', async () => {
    const user = userEvent.setup()
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '45')
    await user.clear(inputs[1])
    await user.type(inputs[1], '28')

    const submitButton = screen.getByRole('button', { name: /confirm receipt/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        po_id: 123,
        line_items: [
          { po_line_id: 1, quantity_received: 45 },
          { po_line_id: 2, quantity_received: 28 },
        ],
      })
    })
  })

  it('calls onHide when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnHide).toHaveBeenCalled()
  })

  it('disables buttons during submission', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    const submitButton = screen.getByRole('button', { name: /confirm receipt/i })
    await user.click(submitButton)

    expect(screen.getByText(/receiving\.\.\./i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('displays info alert about inventory adjustment', () => {
    render(
      <ReceiveDeliveryModal show={true} onHide={mockOnHide} purchaseOrder={mockPurchaseOrder} onSubmit={mockOnSubmit} />
    )

    expect(
      screen.getByText(/Received quantities will be added to inventory/i)
    ).toBeInTheDocument()
  })
})
