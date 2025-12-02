import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStatistics,
} from '../services/supplierService'

export const useSuppliers = (params = {}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => getSuppliers(params),
    staleTime: 60 * 1000,
  })
}

export const useSupplierById = (id) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  })
}

export const useSupplierStatistics = () => {
  return useQuery({
    queryKey: ['suppliers', 'statistics'],
    queryFn: getSupplierStatistics,
    staleTime: 60 * 1000,
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export default useSuppliers
