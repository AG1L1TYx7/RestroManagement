import { apiClient } from './apiClient'

export const getPurchaseOrders = async (params = {}) => {
  const { data } = await apiClient.get('/purchase-orders', { params })
  return data?.data?.purchase_orders || []
}

export const getPurchaseOrderById = async (poId) => {
  const { data } = await apiClient.get(`/purchase-orders/${poId}`)
  return data?.data?.purchase_order || null
}

export const createPurchaseOrder = async (poData) => {
  const { data } = await apiClient.post('/purchase-orders', poData)
  return data?.data
}

export const updatePurchaseOrderStatus = async (poId, status) => {
  const { data } = await apiClient.patch(`/purchase-orders/${poId}/status`, { status })
  return data
}

export const receivePurchaseOrder = async (poId, receivedItems) => {
  const { data } = await apiClient.post(`/purchase-orders/${poId}/receive`, { items: receivedItems })
  return data
}

export const autoGeneratePurchaseOrders = async (posData) => {
  const { data } = await apiClient.post('/purchase-orders/auto-generate', { purchase_orders: posData })
  return data
}

export default {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder,
  autoGeneratePurchaseOrders,
}
