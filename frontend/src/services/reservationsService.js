import { apiClient } from './apiClient'

export const getReservations = async (params = {}) => {
  const { data } = await apiClient.get('/reservations', { params })
  return data?.data
}

export const getReservationById = async (id) => {
  const { data } = await apiClient.get(`/reservations/${id}`)
  return data?.data
}

export const createReservation = async (reservationData) => {
  const { data } = await apiClient.post('/reservations', reservationData)
  return data?.data
}

export const updateReservation = async (id, reservationData) => {
  const { data } = await apiClient.put(`/reservations/${id}`, reservationData)
  return data?.data
}

export const updateReservationStatus = async (id, status) => {
  const { data } = await apiClient.put(`/reservations/${id}/status`, { status })
  return data?.data
}

export const cancelReservation = async (id) => {
  const { data } = await apiClient.delete(`/reservations/${id}/cancel`)
  return data?.data
}

export const deleteReservation = async (id) => {
  const { data } = await apiClient.delete(`/reservations/${id}`)
  return data?.data
}

export const getUpcomingReservations = async (params = {}) => {
  const { data } = await apiClient.get('/reservations/upcoming', { params })
  return data?.data
}

export const getReservationStatistics = async () => {
  const { data } = await apiClient.get('/reservations/stats')
  return data?.data
}

export default {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getUpcomingReservations,
  getReservationStatistics,
}
