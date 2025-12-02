import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getTableStatistics,
} from '../services/tablesService'

export const useTables = (filters = {}) => {
  return useQuery({
    queryKey: ['tables', filters],
    queryFn: () => getTables(filters),
    staleTime: 30 * 1000,
  })
}

export const useTableById = (id) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => getTableById(id),
    enabled: !!id,
  })
}

export const useAvailableTables = (params = {}) => {
  return useQuery({
    queryKey: ['tables', 'available', params],
    queryFn: () => getAvailableTables(params),
    staleTime: 10 * 1000,
  })
}

export const useTableStatistics = () => {
  return useQuery({
    queryKey: ['tables', 'statistics'],
    queryFn: getTableStatistics,
    staleTime: 60 * 1000,
  })
}

export const useCreateTable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateTable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useDeleteTable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export default useTables
