import { useQuery } from '@tanstack/react-query'
import { getBranches } from '../services/branchService'

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    staleTime: 300000, // 5 minutes - branches rarely change
  })
}
