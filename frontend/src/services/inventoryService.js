import { apiClient } from './apiClient'

export const getInventory = async (params = {}) => {
  const { data } = await apiClient.get('/inventory', { params })
  return data?.data
}

export const getLowStockItems = async (params = {}) => {
  const { data } = await apiClient.get('/inventory/low-stock', { params })
  return data?.data
}

export const adjustStock = async (adjustmentData) => {
  const { data } = await apiClient.post('/inventory/adjust', adjustmentData)
  return data?.data
}

export const getInventoryValuation = async (params = {}) => {
  const { data } = await apiClient.get('/inventory/valuation', { params })
  return data?.data
}

export default {
  getInventory,
  getLowStockItems,
  adjustStock,
  getInventoryValuation,
}
