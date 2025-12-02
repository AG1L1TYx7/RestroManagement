import { apiClient } from './apiClient'

export const getRecipes = async (params = {}) => {
  const { data } = await apiClient.get('/recipes', { params })
  return data?.data
}

export const getRecipesByMenuItem = async (itemId) => {
  const { data } = await apiClient.get(`/recipes/item/${itemId}`)
  return data?.data
}

export const getRecipesByIngredient = async (ingredientId) => {
  const { data } = await apiClient.get(`/recipes/ingredient/${ingredientId}`)
  return data?.data
}

export const createRecipe = async (recipeData) => {
  const { data } = await apiClient.post('/recipes', recipeData)
  return data?.data
}

export const updateRecipe = async (id, recipeData) => {
  const { data } = await apiClient.put(`/recipes/${id}`, recipeData)
  return data?.data
}

export const deleteRecipe = async (id) => {
  const { data } = await apiClient.delete(`/recipes/${id}`)
  return data?.data
}

export const checkMenuItemAvailability = async (itemId) => {
  const { data } = await apiClient.get(`/recipes/item/${itemId}/availability`)
  return data?.data
}

export const getIngredientCost = async (itemId) => {
  const { data } = await apiClient.get(`/recipes/item/${itemId}/cost`)
  return data?.data
}

export default {
  getRecipes,
  getRecipesByMenuItem,
  getRecipesByIngredient,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  checkMenuItemAvailability,
  getIngredientCost,
}
