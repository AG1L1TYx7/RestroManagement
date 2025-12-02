import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  getCategoryById,
  getCategoryMenuItems,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from '../services/categoriesService'

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
    staleTime: 60 * 1000,
  })
}

export const useCategoryById = (id) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  })
}

export const useCategoryMenuItems = (id, params = {}) => {
  return useQuery({
    queryKey: ['categories', id, 'items', params],
    queryFn: () => getCategoryMenuItems(id, params),
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleCategoryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export default useCategories
