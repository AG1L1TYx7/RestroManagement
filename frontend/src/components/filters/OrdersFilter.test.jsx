import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrdersFilter from './OrdersFilter'

describe('OrdersFilter', () => {
  let mockOnFilterChange
  const mockBranches = [
    { branch_id: 1, branch_name: 'Downtown' },
    { branch_id: 2, branch_name: 'Uptown' },
  ]

  beforeEach(() => {
    mockOnFilterChange = vi.fn()
  })

  it('renders all filter controls', () => {
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search customer/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
    expect(screen.getByText(/preparing/i)).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })

  it('updates start date filter', async () => {
    const user = userEvent.setup()
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const startDateInput = screen.getAllByDisplayValue('')[0] // First date input
    await user.type(startDateInput, '2024-01-01')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(String),
      })
    )
  })

  it('updates end date filter', async () => {
    const user = userEvent.setup()
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const endDateInput = screen.getAllByDisplayValue('')[1] // Second date input
    await user.type(endDateInput, '2024-12-31')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: expect.any(String),
      })
    )
  })

  it('updates branch filter', async () => {
    const user = userEvent.setup()
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const branchSelect = screen.getByRole('combobox')
    await user.selectOptions(branchSelect, '1')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: '1',
      })
    )
  })

  it('updates customer search filter', async () => {
    const user = userEvent.setup()
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const customerInput = screen.getByPlaceholderText(/search customer/i)
    await user.type(customerInput, 'John')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        customerSearch: expect.stringContaining('John'),
      })
    )
  })

  it('toggles status badges', () => {
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const completedBadge = screen.getByText(/completed/i)
    fireEvent.click(completedBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['completed'],
      })
    )

    // Toggle off
    fireEvent.click(completedBadge)
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [],
      })
    )
  })

  it('allows multiple status selections', () => {
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const completedBadge = screen.getByText(/completed/i)
    const preparingBadge = screen.getByText(/preparing/i)

    fireEvent.click(completedBadge)
    fireEvent.click(preparingBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.arrayContaining(['completed', 'preparing']),
      })
    )
  })

  it('shows clear button when filters are active', () => {
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()

    const completedBadge = screen.getByText(/completed/i)
    fireEvent.click(completedBadge)

    expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
  })

  it('clears all filters when clear button clicked', async () => {
    const user = userEvent.setup()
    render(<OrdersFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    // Apply filters
    const customerInput = screen.getByPlaceholderText(/search customer/i)
    await user.type(customerInput, 'John')

    const completedBadge = screen.getByText(/completed/i)
    fireEvent.click(completedBadge)

    const clearButton = screen.getByText(/clear filters/i)
    await user.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      startDate: '',
      endDate: '',
      status: [],
      branchId: '',
      customerSearch: '',
    })
  })
})
