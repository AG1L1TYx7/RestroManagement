/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
