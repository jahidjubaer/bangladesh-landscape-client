import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

// ---------- Public ----------

export function useDistrictGuides(slug) {
  return useQuery({
    queryKey: ['guides', slug],
    queryFn: async () => (await api.get(`/guides/districts/${slug}`)).data.data.guides,
    enabled: Boolean(slug),
  });
}

export function useGuide(id) {
  return useQuery({
    queryKey: ['guide', id],
    queryFn: async () => (await api.get(`/guides/${id}`)).data.data, // { guide, reviews }
    enabled: Boolean(id),
  });
}

export function useApplyGuide() {
  return useMutation({
    mutationFn: async (formData) => (await api.post('/guides/apply', formData)).data,
  });
}

// ---------- Guide self ----------

export function useMyGuideProfile(enabled) {
  return useQuery({
    queryKey: ['myGuideProfile'],
    queryFn: async () => (await api.get('/guides/me/profile')).data.data.guide,
    enabled,
  });
}

export function useUpdateGuideProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.patch('/guides/me/profile', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myGuideProfile'] }),
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blockedDates) => (await api.put('/guides/me/availability', { blockedDates })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myGuideProfile'] }),
  });
}

// ---------- Bookings ----------

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (payload) => (await api.post('/bookings/guide', payload)).data.data.booking,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => (await api.get('/bookings/me')).data.data.bookings,
  });
}

export function useGuideIncoming() {
  return useQuery({
    queryKey: ['guideIncoming'],
    queryFn: async () => (await api.get('/bookings/guide/incoming')).data.data.bookings,
  });
}

export function useBookingAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, body }) =>
      action === 'review'
        ? (await api.post(`/bookings/${id}/review`, body)).data
        : (await api.patch(`/bookings/${id}/${action}`, body || {})).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ---------- Manual bKash ----------

export function useSubmitManualBkash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/payments/manual-bkash', payload)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}
