import { apiClient } from './apiClient'

export const getTables = async (params = {}) => {
  const { data } = await apiClient.get('/tables', { params })
  return data?.data
}

export const getTableById = async (id) => {
  const { data } = await apiClient.get(`/tables/${id}`)
  return data?.data
}

export const createTable = async (tableData) => {
  const { data } = await apiClient.post('/tables', tableData)
  return data?.data
}

export const updateTable = async (id, tableData) => {
  const { data } = await apiClient.put(`/tables/${id}`, tableData)
  return data?.data
}

export const updateTableStatus = async (id, status) => {
  const { data } = await apiClient.put(`/tables/${id}/status`, { status })
  return data?.data
}

export const deleteTable = async (id) => {
  const { data } = await apiClient.delete(`/tables/${id}`)
  return data?.data
}

export const getAvailableTables = async (params = {}) => {
  const { data } = await apiClient.get('/tables/available', { params })
  return data?.data
}

export const getTableStatistics = async () => {
  const { data } = await apiClient.get('/tables/stats')
  return data?.data
}

export default {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getTableStatistics,
}
