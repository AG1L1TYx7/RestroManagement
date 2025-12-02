import { apiClient } from './apiClient'

export const getCategories = async (params = {}) => {
  const { data } = await apiClient.get('/categories', { params })
  return data?.data
}

export const getCategoryById = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}`)
  return data?.data
}

export const getCategoryMenuItems = async (id, params = {}) => {
  const { data } = await apiClient.get(`/categories/${id}/items`, { params })
  return data?.data
}

export const createCategory = async (categoryData) => {
  const { data } = await apiClient.post('/categories', categoryData)
  return data?.data
}

export const updateCategory = async (id, categoryData) => {
  const { data } = await apiClient.put(`/categories/${id}`, categoryData)
  return data?.data
}

export const toggleCategoryStatus = async (id) => {
  const { data } = await apiClient.patch(`/categories/${id}/toggle`)
  return data?.data
}

export const deleteCategory = async (id) => {
  const { data } = await apiClient.delete(`/categories/${id}`)
  return data?.data
}

export default {
  getCategories,
  getCategoryById,
  getCategoryMenuItems,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
}
