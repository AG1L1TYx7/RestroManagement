import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStatus,
  getMenuItemsByCategory,
  getPopularMenuItems,
  searchMenuItems,
} from '../services/menuService'

export const useMenuItems = (params = {}) => {
  return useQuery({
    queryKey: ['menuItems', params],
    queryFn: () => getMenuItems(params),
    staleTime: 60 * 1000,
  })
}

export const useMenuItemById = (id) => {
  return useQuery({
    queryKey: ['menuItems', id],
    queryFn: () => getMenuItemById(id),
    enabled: !!id,
  })
}

export const useMenuItemsByCategory = (categoryId, params = {}) => {
  return useQuery({
    queryKey: ['menuItems', 'category', categoryId, params],
    queryFn: () => getMenuItemsByCategory(categoryId, params),
    enabled: !!categoryId,
  })
}

export const usePopularMenuItems = (params = {}) => {
  return useQuery({
    queryKey: ['menuItems', 'popular', params],
    queryFn: () => getPopularMenuItems(params),
  })
}

export const useSearchMenuItems = (searchParams) => {
  return useQuery({
    queryKey: ['menuItems', 'search', searchParams],
    queryFn: () => searchMenuItems(searchParams),
    enabled: !!searchParams.query,
  })
}

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })
}

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })
}

export const useToggleMenuItemStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleMenuItemStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })
}

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })
}

export default useMenuItems
