import { useQuery } from '@tanstack/react-query'
import {
  getSalesOverview,
  getRevenueTrends,
  getTopSellingItems,
  getCategoryPerformance,
  getFoodCostRatio,
  getProfitAnalysis,
} from '../services/analyticsService'

export const useSalesOverview = (params) => {
  return useQuery({
    queryKey: ['sales-overview', params],
    queryFn: () => getSalesOverview(params),
  })
}

export const useRevenueTrends = (params) => {
  return useQuery({
    queryKey: ['revenue-trends', params],
    queryFn: () => getRevenueTrends(params),
  })
}

export const useTopSellingItems = (params) => {
  return useQuery({
    queryKey: ['top-selling-items', params],
    queryFn: () => getTopSellingItems(params),
  })
}

export const useCategoryPerformance = (params) => {
  return useQuery({
    queryKey: ['category-performance', params],
    queryFn: () => getCategoryPerformance(params),
  })
}

export const useFoodCostRatio = (params) => {
  return useQuery({
    queryKey: ['food-cost-ratio', params],
    queryFn: () => getFoodCostRatio(params),
  })
}

export const useProfitAnalysis = (params) => {
  return useQuery({
    queryKey: ['profit-analysis', params],
    queryFn: () => getProfitAnalysis(params),
  })
}
