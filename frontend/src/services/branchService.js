import { apiClient } from './apiClient'

export const getBranches = async () => {
  const { data } = await apiClient.get('/branches')
  return data?.data
}
