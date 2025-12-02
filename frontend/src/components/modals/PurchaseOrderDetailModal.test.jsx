import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PurchaseOrderDetailModal from '../../../src/components/modals/PurchaseOrderDetailModal'

const mockPO = {
  po_id: 123,
  branch_name: 'Downtown Branch',
  supplier_name: 'Fresh Foods Inc',
  status: 'draft',
  order_date: '2024-01-15T10:30:00Z',
  expected_delivery_date: '2024-01-20T10:00:00Z',
  total_amount: 450.50,
  notes: 'Urgent delivery needed',
  line_items: [
    {
      ingredient_name: 'Tomato',
      quantity: 50,
      unit: 'kg',
      unit_price: 3.50,
      subtotal: 175.00,
    },
    {
      ingredient_name: 'Mozzarella',
      quantity: 25,
      unit: 'kg',
      unit_price: 11.02,
      subtotal: 275.50,
    },
  ],
}

describe('PurchaseOrderDetailModal', () => {
  it('renders PO details when purchaseOrder is provided', () => {
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={mockPO}
      />
    )

    expect(screen.getByText(/purchase order #/i)).toBeInTheDocument()
    expect(screen.getByText('Downtown Branch')).toBeInTheDocument()
    expect(screen.getByText('Fresh Foods Inc')).toBeInTheDocument()
  })

  it('shows "Submit for Approval" button for draft POs', () => {
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={mockPO}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /submit for approval/i })).toBeInTheDocument()
  })

  it('shows "Approve PO" button for submitted POs', () => {
    const submittedPO = { ...mockPO, status: 'submitted' }
    
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={submittedPO}
        onApprove={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /approve po/i })).toBeInTheDocument()
  })

  it('shows "Receive Delivery" button for approved POs', () => {
    const approvedPO = { ...mockPO, status: 'approved' }
    
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={approvedPO}
        onReceive={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /receive delivery/i })).toBeInTheDocument()
  })

  it('calls onSubmit when Submit button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={mockPO}
        onSubmit={onSubmit}
      />
    )

    const button = screen.getByRole('button', { name: /submit for approval/i })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(123)
  })

  it('calls onApprove when Approve button is clicked', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    const submittedPO = { ...mockPO, status: 'submitted' }

    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={submittedPO}
        onApprove={onApprove}
      />
    )

    const button = screen.getByRole('button', { name: /approve po/i })
    await user.click(button)

    expect(onApprove).toHaveBeenCalledWith(123)
  })

  it('disables buttons when isUpdating is true', () => {
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={mockPO}
        onSubmit={vi.fn()}
        isUpdating={true}
      />
    )

    const button = screen.getByRole('button', { name: /submitting/i })
    expect(button).toBeDisabled()
  })

  it('shows empty message when no line items', () => {
    const poWithoutItems = { ...mockPO, line_items: [] }
    
    render(
      <PurchaseOrderDetailModal
        show={true}
        onHide={vi.fn()}
        purchaseOrder={poWithoutItems}
      />
    )

    expect(screen.getByText(/no line items available/i)).toBeInTheDocument()
  })
})
