import { apiClient } from './apiClient'

export const getOrders = async (params = {}) => {
  const { data } = await apiClient.get('/orders', { params })
  return data?.data
}

export const getOrderById = async (orderId) => {
  const { data } = await apiClient.get(`/orders/${orderId}`)
  return data?.data
}

export const createOrder = async (orderData) => {
  const { data } = await apiClient.post('/orders', orderData)
  return data?.data
}

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/status`, { status })
  return data
}

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
}
