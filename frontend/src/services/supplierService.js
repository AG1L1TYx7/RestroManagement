import { apiClient } from './apiClient'

export const getSuppliers = async (params = {}) => {
  const { data } = await apiClient.get('/suppliers', { params })
  return data?.data
}

export const getSupplierById = async (id) => {
  const { data } = await apiClient.get(`/suppliers/${id}`)
  return data?.data
}

export const createSupplier = async (supplierData) => {
  const { data } = await apiClient.post('/suppliers', supplierData)
  return data?.data
}

export const updateSupplier = async (id, supplierData) => {
  const { data} = await apiClient.put(`/suppliers/${id}`, supplierData)
  return data?.data
}

export const deleteSupplier = async (id) => {
  const { data } = await apiClient.delete(`/suppliers/${id}`)
  return data?.data
}

export const getSupplierStatistics = async () => {
  const { data } = await apiClient.get('/suppliers/statistics')
  return data?.data
}

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStatistics,
}
