import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export function usePlan(publicId) {
  return useQuery({
    queryKey: ['plan', publicId],
    queryFn: async () => (await api.get(`/plans/${publicId}`)).data.data,
    enabled: Boolean(publicId),
  });
}

export function useMyPlans() {
  return useQuery({
    queryKey: ['myPlans'],
    queryFn: async () => (await api.get('/plans/me')).data.data.plans,
  });
}

export function useGeneratePlan() {
  return useMutation({
    mutationFn: async (payload) => (await api.post('/plans', payload)).data.data, // { publicId }
  });
}

export function useUnlockPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicId) => (await api.post(`/plans/${publicId}/unlock`)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useInitPayment() {
  return useMutation({
    mutationFn: async (planPublicId) => (await api.post('/payments/init', { planPublicId })).data.data, // { gatewayUrl }
  });
}
