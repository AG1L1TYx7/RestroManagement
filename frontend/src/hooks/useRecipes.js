import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecipes,
  getRecipesByMenuItem,
  getRecipesByIngredient,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  checkMenuItemAvailability,
  getIngredientCost,
} from '../services/recipesService'

export const useRecipes = (params = {}) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => getRecipes(params),
    staleTime: 60 * 1000,
  })
}

export const useRecipesByMenuItem = (itemId) => {
  return useQuery({
    queryKey: ['recipes', 'menuItem', itemId],
    queryFn: () => getRecipesByMenuItem(itemId),
    enabled: !!itemId,
    staleTime: 60 * 1000,
  })
}

export const useRecipesByIngredient = (ingredientId) => {
  return useQuery({
    queryKey: ['recipes', 'ingredient', ingredientId],
    queryFn: () => getRecipesByIngredient(ingredientId),
    enabled: !!ingredientId,
    staleTime: 60 * 1000,
  })
}

export const useMenuItemAvailability = (itemId) => {
  return useQuery({
    queryKey: ['recipes', 'availability', itemId],
    queryFn: () => checkMenuItemAvailability(itemId),
    enabled: !!itemId,
    staleTime: 30 * 1000,
  })
}

export const useIngredientCost = (itemId) => {
  return useQuery({
    queryKey: ['recipes', 'cost', itemId],
    queryFn: () => getIngredientCost(itemId),
    enabled: !!itemId,
    staleTime: 60 * 1000,
  })
}

export const useCreateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export default useRecipes
