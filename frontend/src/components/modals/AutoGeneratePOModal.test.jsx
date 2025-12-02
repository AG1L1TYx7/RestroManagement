import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutoGeneratePOModal from './AutoGeneratePOModal'

describe('AutoGeneratePOModal', () => {
  let mockOnHide
  let mockOnGenerate
  let originalFetch

  beforeEach(() => {
    mockOnHide = vi.fn()
    mockOnGenerate = vi.fn()
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const mockPreviewData = {
    branch_id: 1,
    suppliers: [
      {
        supplier_id: 10,
        supplier_name: 'Fresh Produce Co.',
        ingredients: [
          {
            ingredient_id: 1,
            ingredient_name: 'Tomatoes',
            branch_name: 'Downtown',
            current_stock: 10,
            reorder_level: 50,
            unit: 'kg',
            unit_price: 2.5,
            suggested_quantity: 50,
          },
          {
            ingredient_id: 2,
            ingredient_name: 'Onions',
            branch_name: 'Downtown',
            current_stock: 5,
            reorder_level: 30,
            unit: 'kg',
            unit_price: 1.8,
            suggested_quantity: 30,
          },
        ],
      },
      {
        supplier_id: 20,
        supplier_name: 'Dairy Delight',
        ingredients: [
          {
            ingredient_id: 3,
            ingredient_name: 'Milk',
            branch_name: 'Downtown',
            current_stock: 15,
            reorder_level: 40,
            unit: 'L',
            unit_price: 3.2,
            suggested_quantity: 40,
          },
        ],
      },
    ],
  }

  it('shows loading state initially', () => {
    globalThis.fetch.mockImplementation(() => new Promise(() => {}))

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    expect(screen.getByText(/analyzing inventory levels/i)).toBeInTheDocument()
  })

  it('fetches and displays preview data', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText(/Fresh Produce Co\./i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Dairy Delight/i)).toBeInTheDocument()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('Onions')).toBeInTheDocument()
    expect(screen.getByText('Milk')).toBeInTheDocument()
  })

  it('displays error when fetch fails', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network error'))

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('displays error when response is not ok', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch preview data/i)).toBeInTheDocument()
    })
  })

  it('shows success message when no low stock items', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          branch_id: 1,
          suppliers: [],
        },
      }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText(/all good/i)).toBeInTheDocument()
      expect(screen.getByText(/no ingredients are currently below reorder level/i)).toBeInTheDocument()
    })
  })

  it('displays ingredient details correctly', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    expect(screen.getByText('10 kg')).toBeInTheDocument()
    expect(screen.getByText('50 kg')).toBeInTheDocument()
    const priceElements = screen.getAllByText('$3')
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it('allows editing quantities', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const quantityInputs = screen.getAllByRole('spinbutton')
    const tomatoInput = quantityInputs[0]

    await user.clear(tomatoInput)
    await user.type(tomatoInput, '75')

    expect(tomatoInput).toHaveValue(75)
  })

  it('calculates subtotals correctly', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const quantityInputs = screen.getAllByRole('spinbutton')
    await user.clear(quantityInputs[0])
    await user.type(quantityInputs[0], '100')

    await waitFor(() => {
      expect(screen.getByText('$250')).toBeInTheDocument()
    })
  })

  it('displays summary with PO and item counts', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText(/2 purchase order\(s\) will be created with 3 total item\(s\)/i)).toBeInTheDocument()
    })
  })

  it('calls onGenerate with correct data', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const generateButton = screen.getByRole('button', { name: /generate 2 po\(s\)/i })
    await user.click(generateButton)

    expect(mockOnGenerate).toHaveBeenCalledWith([
      {
        supplier_id: 10,
        branch_id: 1,
        ingredients: [
          { ingredient_id: 1, quantity: 50 },
          { ingredient_id: 2, quantity: 30 },
        ],
      },
      {
        supplier_id: 20,
        branch_id: 1,
        ingredients: [{ ingredient_id: 3, quantity: 40 }],
      },
    ])
  })

  it('excludes zero quantity items from generation', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const quantityInputs = screen.getAllByRole('spinbutton')
    await user.clear(quantityInputs[0])
    await user.type(quantityInputs[0], '0')

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(mockOnGenerate).toHaveBeenCalledWith([
      {
        supplier_id: 10,
        branch_id: 1,
        ingredients: [{ ingredient_id: 2, quantity: 30 }],
      },
      {
        supplier_id: 20,
        branch_id: 1,
        ingredients: [{ ingredient_id: 3, quantity: 40 }],
      },
    ])
  })

  it('disables generate button when all quantities are zero', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const quantityInputs = screen.getAllByRole('spinbutton')
    for (const input of quantityInputs) {
      await user.clear(input)
      await user.type(input, '0')
    }

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /generate 0 po\(s\)/i })
      expect(generateButton).toBeDisabled()
    })
  })

  it('calls onHide when cancel button clicked', async () => {
    const user = userEvent.setup()
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnHide).toHaveBeenCalled()
  })

  it('disables buttons during generation', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} isGenerating={true} />)

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    })

    const generateButton = screen.getByRole('button', { name: /generating/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    expect(generateButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('shows supplier item count badges', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPreviewData }),
    })

    render(<AutoGeneratePOModal show={true} onHide={mockOnHide} onGenerate={mockOnGenerate} />)

    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument()
      expect(screen.getByText('1 items')).toBeInTheDocument()
    })
  })
})
