import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../services/dashboardService'

export const useDashboardData = (filters) => {
  const queryKey = useMemo(() => (filters ? ['dashboard', filters] : ['dashboard']), [filters])

  return useQuery({
    queryKey,
    queryFn: () => getDashboardSummary(filters),
    staleTime: 60 * 1000,
  })
}

export default useDashboardData
