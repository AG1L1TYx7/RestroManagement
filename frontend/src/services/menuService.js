import { apiClient } from './apiClient'

export const getMenuItems = async (params = {}) => {
  const { data } = await apiClient.get('/menu-items', { params })
  return data?.data
}

export const getMenuItemById = async (id) => {
  const { data } = await apiClient.get(`/menu-items/${id}`)
  return data?.data
}

export const createMenuItem = async (itemData) => {
  const { data } = await apiClient.post('/menu-items', itemData)
  return data?.data
}

export const updateMenuItem = async (id, itemData) => {
  const { data } = await apiClient.put(`/menu-items/${id}`, itemData)
  return data?.data
}

export const deleteMenuItem = async (id) => {
  const { data } = await apiClient.delete(`/menu-items/${id}`)
  return data?.data
}

export const toggleMenuItemStatus = async (id) => {
  const { data } = await apiClient.patch(`/menu-items/${id}/toggle`)
  return data?.data
}

export const getMenuItemsByCategory = async (categoryId, params = {}) => {
  const { data } = await apiClient.get(`/menu-items/category/${categoryId}`, { params })
  return data?.data
}

export const getPopularMenuItems = async (params = {}) => {
  const { data } = await apiClient.get('/menu-items/popular', { params })
  return data?.data
}

export const searchMenuItems = async (params = {}) => {
  const { data } = await apiClient.get('/menu-items/search', { params })
  return data?.data
}

export default {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStatus,
  getMenuItemsByCategory,
  getPopularMenuItems,
  searchMenuItems,
}
