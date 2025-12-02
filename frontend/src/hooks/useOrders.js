import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../services/ordersService'

export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrders(filters),
    staleTime: 30 * 1000,
  })
}

export default useOrders
