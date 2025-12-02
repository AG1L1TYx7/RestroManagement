import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreatePurchaseOrderModal from './CreatePurchaseOrderModal'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('CreatePurchaseOrderModal', () => {
  let mockOnHide
  let mockOnSubmit
  const mockBranches = [
    { branch_id: 1, branch_name: 'Downtown' },
    { branch_id: 2, branch_name: 'Uptown' },
  ]

  beforeEach(() => {
    mockOnHide = vi.fn()
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  })

  it('renders modal with basic form fields', () => {
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/create purchase order/i)).toBeInTheDocument()
    expect(screen.getByText(/branch \*/i)).toBeInTheDocument()
    expect(screen.getByText(/supplier \*/i)).toBeInTheDocument()
    expect(screen.getByText(/expected delivery date \*/i)).toBeInTheDocument()
  })

  it('renders initial line item row', () => {
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByPlaceholderText(/e\.g\. tomatoes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ add item/i })).toBeInTheDocument()
  })

  it('adds new line item when Add Item button clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const addButton = screen.getByRole('button', { name: /\+ add item/i })
    await user.click(addButton)

    const ingredientInputs = screen.getAllByPlaceholderText(/e\.g\. tomatoes/i)
    expect(ingredientInputs).toHaveLength(2)
  })

  it('removes line item when delete button clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const addButton = screen.getByRole('button', { name: /\+ add item/i })
    await user.click(addButton)

    let ingredientInputs = screen.getAllByPlaceholderText(/e\.g\. tomatoes/i)
    expect(ingredientInputs).toHaveLength(2)

    const deleteButtons = screen.getAllByText('✕')
    await user.click(deleteButtons[1])

    ingredientInputs = screen.getAllByPlaceholderText(/e\.g\. tomatoes/i)
    expect(ingredientInputs).toHaveLength(1)
  })

  it('prevents removing last line item', () => {
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const deleteButton = screen.getByText('✕')
    expect(deleteButton.closest('button')).toBeDisabled()
  })

  it('calculates subtotal for line item', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const quantityInput = screen.getByPlaceholderText('0')
    const priceInput = screen.getByPlaceholderText('0.00')

    await user.clear(quantityInput)
    await user.type(quantityInput, '10')
    await user.clear(priceInput)
    await user.type(priceInput, '2.5')

    await waitFor(() => {
      const subtotals = screen.getAllByText(/\$\d/)
      expect(subtotals.some(el => el.textContent === '$25')).toBe(true)
    })
  })

  it('shows validation error for missing branch', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const submitButton = screen.getByRole('button', { name: /create po/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/branch is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for missing supplier', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const submitButton = screen.getByRole('button', { name: /create po/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/supplier is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid quantity', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const ingredientInput = screen.getByPlaceholderText(/e\.g\. tomatoes/i)
    const quantityInput = screen.getByPlaceholderText('0')
    const priceInput = screen.getByPlaceholderText('0.00')

    await user.type(ingredientInput, 'Tomatoes')
    await user.type(quantityInput, '-5')
    await user.type(priceInput, '2.5')

    const submitButton = screen.getByRole('button', { name: /create po/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument()
    })
  })

  it('calls onHide when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnHide).toHaveBeenCalled()
  })

  it('renders total in submit button', async () => {
    const user = userEvent.setup()
    render(
      <CreatePurchaseOrderModal show={true} onHide={mockOnHide} branches={mockBranches} onSubmit={mockOnSubmit} />,
      { wrapper: createWrapper() }
    )

    const quantityInput = screen.getByPlaceholderText('0')
    const priceInput = screen.getByPlaceholderText('0.00')

    await user.clear(quantityInput)
    await user.type(quantityInput, '10')
    await user.clear(priceInput)
    await user.type(priceInput, '5')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create po \(\$50\)/i })).toBeInTheDocument()
    })
  })
})
