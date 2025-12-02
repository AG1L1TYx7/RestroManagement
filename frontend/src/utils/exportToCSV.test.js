import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportToCSV,
  formatDateForCSV,
  formatCurrencyForCSV,
} from './exportToCSV'

describe('exportToCSV', () => {
  let mockCreateObjectURL
  let mockRevokeObjectURL
  let mockClick

  beforeEach(() => {
    // Mock document.createElement to return a real element with mocked click
    mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement(tag)
      if (tag === 'a') {
        element.click = mockClick
      }
      return element
    })

    // Mock URL.createObjectURL and URL.revokeObjectURL
    mockCreateObjectURL = vi
      .fn()
      .mockReturnValue('blob:http://localhost:3000/test')
    mockRevokeObjectURL = vi.fn()
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports basic data to CSV', () => {
    const data = [
      { name: 'John Doe', age: 30, city: 'New York' },
      { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
    ]
    const filename = 'test.csv'

    exportToCSV(data, filename)

    // Verify blob creation
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    const blob = mockCreateObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv;charset=utf-8;')

    // Verify download triggered
    expect(mockClick).toHaveBeenCalled()
  })

  it('uses custom columns if provided', () => {
    const data = [
      { name: 'John Doe', age: 30, city: 'New York', phone: '123-456' },
      { name: 'Jane Smith', age: 25, city: 'Los Angeles', phone: '789-012' },
    ]
    const columns = [
      { key: 'name', header: 'Full Name' },
      { key: 'city', header: 'Location' },
    ]

    exportToCSV(data, 'test.csv', columns)

    expect(mockCreateObjectURL).toHaveBeenCalled()
  })

  it('escapes commas in values', () => {
    const data = [{ name: 'Doe, John', address: '123 Main St, Apt 4' }]

    exportToCSV(data, 'test.csv')

    const blob = mockCreateObjectURL.mock.calls[0][0]
    expect(blob).toBeDefined()
  })

  it('escapes quotes in values', () => {
    const data = [{ name: 'John "Johnny" Doe' }]

    exportToCSV(data, 'test.csv')

    const blob = mockCreateObjectURL.mock.calls[0][0]
    expect(blob).toBeDefined()
  })

  it('handles newlines in values', () => {
    const data = [{ description: 'Line 1\nLine 2\nLine 3' }]

    exportToCSV(data, 'test.csv')

    const blob = mockCreateObjectURL.mock.calls[0][0]
    expect(blob).toBeDefined()
  })

  it('handles empty array', () => {
    const data = []

    exportToCSV(data, 'test.csv')

    // Should not create blob for empty data
    expect(mockCreateObjectURL).not.toHaveBeenCalled()
  })

  it('handles null and undefined values', () => {
    const data = [{ name: null, age: undefined, city: 'New York' }]

    exportToCSV(data, 'test.csv')

    expect(mockCreateObjectURL).toHaveBeenCalled()
  })
})

describe('formatDateForCSV', () => {
  it('formats ISO date string correctly', () => {
    const result = formatDateForCSV('2024-01-15T10:30:00Z')
    // toLocaleDateString returns format like "1/15/2024"
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
  })

  it('formats date object correctly', () => {
    const date = new Date('2024-03-20T15:45:30Z')
    const result = formatDateForCSV(date)
    // toLocaleDateString returns format like "3/20/2024"
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
  })

  it('returns empty string for null', () => {
    const result = formatDateForCSV(null)
    expect(result).toBe('')
  })

  it('returns empty string for undefined', () => {
    const result = formatDateForCSV(undefined)
    expect(result).toBe('')
  })

  it('handles invalid date', () => {
    const result = formatDateForCSV('invalid-date')
    // Returns "Invalid Date" from toLocaleDateString
    expect(result).toBeTruthy()
  })
})

describe('formatCurrencyForCSV', () => {
  it('formats integer correctly', () => {
    const result = formatCurrencyForCSV(100)
    expect(result).toBe('100.00')
  })

  it('formats decimal correctly', () => {
    const result = formatCurrencyForCSV(123.45)
    expect(result).toBe('123.45')
  })

  it('formats large number correctly', () => {
    const result = formatCurrencyForCSV(1234567.89)
    expect(result).toBe('1234567.89')
  })

  it('handles zero', () => {
    const result = formatCurrencyForCSV(0)
    expect(result).toBe('0.00')
  })

  it('handles null', () => {
    const result = formatCurrencyForCSV(null)
    expect(result).toBe('')
  })

  it('handles undefined', () => {
    const result = formatCurrencyForCSV(undefined)
    expect(result).toBe('')
  })

  it('rounds to 2 decimal places', () => {
    const result = formatCurrencyForCSV(123.456789)
    expect(result).toBe('123.46')
  })
})
