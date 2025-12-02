import { apiClient } from './apiClient'

export const getDashboardSummary = async (params = {}) => {
  const { data } = await apiClient.get('/analytics/dashboard', { params })
  return data?.data
}

export default {
  getDashboardSummary,
}
