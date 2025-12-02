import { useQuery } from '@tanstack/react-query'
import { getInventory, getLowStockItems } from '../services/inventoryService'

export const useInventory = (filters = {}) => {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => getInventory(filters),
    staleTime: 60 * 1000,
  })
}

export const useLowStockItems = (filters = {}) => {
  return useQuery({
    queryKey: ['inventory', 'low-stock', filters],
    queryFn: () => getLowStockItems(filters),
    staleTime: 60 * 1000,
  })
}

export default useInventory
