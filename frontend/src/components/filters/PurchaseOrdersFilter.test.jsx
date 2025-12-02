import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PurchaseOrdersFilter from './PurchaseOrdersFilter'

describe('PurchaseOrdersFilter', () => {
  let mockOnFilterChange
  const mockBranches = [
    { branch_id: 1, branch_name: 'Downtown' },
    { branch_id: 2, branch_name: 'Uptown' },
  ]
  const mockSuppliers = [
    { supplier_id: 10, supplier_name: 'Fresh Produce Co.' },
    { supplier_id: 20, supplier_name: 'Dairy Delight' },
  ]

  beforeEach(() => {
    mockOnFilterChange = vi.fn()
  })

  it('renders all filter controls', () => {
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    expect(screen.getByText(/expected delivery start/i)).toBeInTheDocument()
    expect(screen.getByText(/expected delivery end/i)).toBeInTheDocument()
    expect(screen.getByText(/draft/i)).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
    expect(screen.getByText(/approved/i)).toBeInTheDocument()
    expect(screen.getByText(/received/i)).toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })

  it('renders branch and supplier selects', () => {
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    expect(screen.getByText('Downtown')).toBeInTheDocument()
    expect(screen.getByText('Uptown')).toBeInTheDocument()
    expect(screen.getByText('Fresh Produce Co.')).toBeInTheDocument()
    expect(screen.getByText('Dairy Delight')).toBeInTheDocument()
  })

  it('updates start date filter', async () => {
    const user = userEvent.setup()
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const startDateInput = screen.getAllByDisplayValue('')[0]
    await user.type(startDateInput, '2024-01-01')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(String),
      })
    )
  })

  it('updates end date filter', async () => {
    const user = userEvent.setup()
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const endDateInput = screen.getAllByDisplayValue('')[1]
    await user.type(endDateInput, '2024-12-31')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: expect.any(String),
      })
    )
  })

  it('updates branch filter', async () => {
    const user = userEvent.setup()
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const branchSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(branchSelect, '1')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: '1',
      })
    )
  })

  it('updates supplier filter', async () => {
    const user = userEvent.setup()
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const supplierSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(supplierSelect, '10')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        supplierId: '10',
      })
    )
  })

  it('toggles status badges', () => {
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const draftBadge = screen.getByText(/^draft$/i)
    fireEvent.click(draftBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['draft'],
      })
    )

    fireEvent.click(draftBadge)
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [],
      })
    )
  })

  it('allows multiple status selections', () => {
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const draftBadge = screen.getByText(/^draft$/i)
    const approvedBadge = screen.getByText(/approved/i)

    fireEvent.click(draftBadge)
    fireEvent.click(approvedBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.arrayContaining(['draft', 'approved']),
      })
    )
  })

  it('shows clear button when filters are active', () => {
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()

    const draftBadge = screen.getByText(/^draft$/i)
    fireEvent.click(draftBadge)

    expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
  })

  it('clears all filters when clear button clicked', async () => {
    const user = userEvent.setup()
    render(
      <PurchaseOrdersFilter
        onFilterChange={mockOnFilterChange}
        branches={mockBranches}
        suppliers={mockSuppliers}
      />
    )

    const draftBadge = screen.getByText(/^draft$/i)
    fireEvent.click(draftBadge)

    const branchSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(branchSelect, '1')

    const clearButton = screen.getByText(/clear filters/i)
    await user.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      startDate: '',
      endDate: '',
      status: [],
      branchId: '',
      supplierId: '',
    })
  })
})
