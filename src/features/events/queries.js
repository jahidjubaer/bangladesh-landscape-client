import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events')).data.data.events,
  });
}

export function useEvent(slug) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => (await api.get(`/events/${slug}`)).data.data.event,
    enabled: Boolean(slug),
  });
}

export function useBookEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/events/book', payload)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useMyEventBookings() {
  return useQuery({
    queryKey: ['myEventBookings'],
    queryFn: async () => (await api.get('/events/me/bookings')).data.data.bookings,
  });
}

export function useCancelEventBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.patch(`/events/bookings/${id}/cancel`)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}
