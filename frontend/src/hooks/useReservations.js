import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getUpcomingReservations,
  getReservationStatistics,
} from '../services/reservationsService'

export const useReservations = (filters = {}) => {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => getReservations(filters),
    staleTime: 30 * 1000,
  })
}

export const useReservationById = (id) => {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => getReservationById(id),
    enabled: !!id,
  })
}

export const useUpcomingReservations = (params = {}) => {
  return useQuery({
    queryKey: ['reservations', 'upcoming', params],
    queryFn: () => getUpcomingReservations(params),
    staleTime: 60 * 1000,
  })
}

export const useReservationStatistics = () => {
  return useQuery({
    queryKey: ['reservations', 'statistics'],
    queryFn: getReservationStatistics,
    staleTime: 60 * 1000,
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateReservation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export default useReservations
