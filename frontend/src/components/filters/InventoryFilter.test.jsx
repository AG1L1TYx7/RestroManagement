import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryFilter from './InventoryFilter'

describe('InventoryFilter', () => {
  let mockOnFilterChange
  const mockBranches = [
    { branch_id: 1, branch_name: 'Downtown' },
    { branch_id: 2, branch_name: 'Uptown' },
    { branch_id: 3, branch_name: 'Midtown' },
  ]

  beforeEach(() => {
    mockOnFilterChange = vi.fn()
  })

  it('renders all filter controls', () => {
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    expect(screen.getByPlaceholderText(/search by ingredient name/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText(/critical/i)).toBeInTheDocument()
    expect(screen.getByText(/low/i)).toBeInTheDocument()
    expect(screen.getByText(/healthy/i)).toBeInTheDocument()
  })

  it('renders branch options correctly', () => {
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const branchSelect = screen.getByRole('combobox')
    expect(branchSelect).toBeInTheDocument()
    
    // Check if branches are rendered
    expect(screen.getByText('Downtown')).toBeInTheDocument()
    expect(screen.getByText('Uptown')).toBeInTheDocument()
    expect(screen.getByText('Midtown')).toBeInTheDocument()
  })

  it('calls onFilterChange with search input after debounce', async () => {
    const user = userEvent.setup()
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const searchInput = screen.getByPlaceholderText(/search by ingredient name/i)
    await user.type(searchInput, 'tomato')

    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ingredientSearch: 'tomato',
        })
      )
    }, { timeout: 500 })
  })

  it('calls onFilterChange when branch is selected', async () => {
    const user = userEvent.setup()
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const branchSelect = screen.getByRole('combobox')
    await user.selectOptions(branchSelect, '1')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: '1',
      })
    )
  })

  it('toggles stock status badge when clicked', async () => {
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const criticalBadge = screen.getByText(/critical/i)
    fireEvent.click(criticalBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stockStatus: ['critical'],
      })
    )

    // Click again to deselect
    fireEvent.click(criticalBadge)
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stockStatus: [],
      })
    )
  })

  it('allows multiple stock statuses to be selected', async () => {
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    const criticalBadge = screen.getByText(/critical/i)
    const lowBadge = screen.getByText(/low/i)

    fireEvent.click(criticalBadge)
    fireEvent.click(lowBadge)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stockStatus: expect.arrayContaining(['critical', 'low']),
      })
    )
  })

  it('shows clear filters button when filters are active', async () => {
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    // Initially no clear button
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()

    // Apply a filter
    const criticalBadge = screen.getByText(/critical/i)
    fireEvent.click(criticalBadge)

    // Clear button should appear
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
  })

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<InventoryFilter onFilterChange={mockOnFilterChange} branches={mockBranches} />)

    // Apply multiple filters
    const searchInput = screen.getByPlaceholderText(/search by ingredient name/i)
    await user.type(searchInput, 'tomato')
    
    const branchSelect = screen.getByRole('combobox')
    await user.selectOptions(branchSelect, '1')

    const criticalBadge = screen.getByText(/critical/i)
    fireEvent.click(criticalBadge)

    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    // Click clear button
    const clearButton = screen.getByText(/clear filters/i)
    await user.click(clearButton)

    // Should call onFilterChange with empty filters
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      stockStatus: [],
      branchId: '',
      ingredientSearch: '',
    })

    // Search input should be cleared
    expect(searchInput.value).toBe('')
  })
})
