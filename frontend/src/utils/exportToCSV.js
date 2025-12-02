/**
 * Converts an array of objects to CSV format and triggers download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file (without extension)
 * @param {Array} columns - Optional array of column definitions { key, header }
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // If columns not provided, use all keys from first object
  const headers = columns
    ? columns.map((col) => col.header)
    : Object.keys(data[0])

  const keys = columns
    ? columns.map((col) => col.key)
    : Object.keys(data[0])

  // Create CSV header row
  const csvHeader = headers.join(',')

  // Create CSV data rows
  const csvRows = data.map((row) => {
    return keys
      .map((key) => {
        const value = row[key]
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return ''
        }
        
        // Handle dates
        if (value instanceof Date) {
          return value.toISOString()
        }
        
        // Handle strings with commas, quotes, or newlines
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }
        
        return value
      })
      .join(',')
  })

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Format date for CSV export
 */
export const formatDateForCSV = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

/**
 * Format currency for CSV export (without symbol)
 */
export const formatCurrencyForCSV = (amount) => {
  if (amount === null || amount === undefined) return ''
  return Number(amount).toFixed(2)
}

export default exportToCSV
