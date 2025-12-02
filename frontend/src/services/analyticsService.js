import { apiClient } from './apiClient'

export const getAnalyticsRevenue = async (params = {}) => {
  const { data } = await apiClient.get('/analytics/revenue', { params })
  return data?.data
}

export const getAnalyticsSales = async (params = {}) => {
  const { data } = await apiClient.get('/analytics/sales', { params })
  return data?.data
}

export const getAnalyticsInventory = async (params = {}) => {
  const { data } = await apiClient.get('/analytics/inventory', { params })
  return data?.data
}

export const getAnalyticsDashboard = async (params = {}) => {
  const { data } = await apiClient.get('/analytics/dashboard', { params })
  return data?.data
}

// Sales Reports
export const getSalesOverview = async (params = {}) => {
  const { data } = await apiClient.get('/reports/sales-overview', { params })
  return data?.data
}

export const getRevenueTrends = async (params = {}) => {
  const { data } = await apiClient.get('/reports/revenue-trends', { params })
  return data?.data
}

export const getTopSellingItems = async (params = {}) => {
  const { data } = await apiClient.get('/reports/top-selling-items', { params })
  return data?.data
}

export const getCategoryPerformance = async (params = {}) => {
  const { data } = await apiClient.get('/reports/category-performance', { params })
  return data?.data
}

// Cost Analytics
export const getFoodCostRatio = async (params = {}) => {
  const { data } = await apiClient.get('/reports/food-cost-ratio', { params })
  return data?.data
}

export const getProfitAnalysis = async (params = {}) => {
  const { data } = await apiClient.get('/reports/profit-analysis', { params })
  return data?.data
}

export default {
  getAnalyticsRevenue,
  getAnalyticsSales,
  getAnalyticsInventory,
  getAnalyticsDashboard,
  getSalesOverview,
  getRevenueTrends,
  getTopSellingItems,
  getCategoryPerformance,
  getFoodCostRatio,
  getProfitAnalysis,
}
