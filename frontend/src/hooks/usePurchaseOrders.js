import { useQuery } from '@tanstack/react-query'
import { getPurchaseOrders } from '../services/purchaseOrdersService'

export const usePurchaseOrders = (filters = {}) => {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => getPurchaseOrders(filters),
    staleTime: 60 * 1000,
  })
}

export default usePurchaseOrders
