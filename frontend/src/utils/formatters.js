const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export const formatCurrency = (value, options = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--'
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: options.currency || 'USD',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  })
  return formatter.format(value)
}

export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--'
  }
  const formatter = options.formatter || numberFormatter
  return formatter.format(value)
}

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--'
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export default {
  formatCurrency,
  formatNumber,
  formatPercent,
}
