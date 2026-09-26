import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

// ---------- Public ----------

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => (await api.get('/districts')).data.data.districts,
  });
}

export function useDistrict(slug) {
  return useQuery({
    queryKey: ['district', slug],
    queryFn: async () => (await api.get(`/districts/${slug}`)).data.data, // { district, spots }
    enabled: Boolean(slug),
  });
}

export function useSpot(slug) {
  return useQuery({
    queryKey: ['spot', slug],
    queryFn: async () => (await api.get(`/spots/${slug}`)).data.data.spot,
    enabled: Boolean(slug),
  });
}

// ---------- Admin ----------

export function useAdminDistricts() {
  return useQuery({
    queryKey: ['admin', 'districts'],
    queryFn: async () => (await api.get('/admin/districts')).data.data.districts,
  });
}

export function useAdminDistrict(id) {
  return useQuery({
    queryKey: ['admin', 'district', id],
    queryFn: async () => (await api.get(`/admin/districts/${id}`)).data.data.district,
    enabled: Boolean(id),
  });
}

export function useAdminSpots(districtId) {
  return useQuery({
    queryKey: ['admin', 'spots', districtId || 'all'],
    queryFn: async () =>
      (await api.get('/admin/spots', { params: districtId ? { district: districtId } : {} })).data.data.spots,
  });
}

export function useAdminSpot(id) {
  return useQuery({
    queryKey: ['admin', 'spot', id],
    queryFn: async () => (await api.get(`/admin/spots/${id}`)).data.data.spot,
    enabled: Boolean(id),
  });
}

function useInvalidatingMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries(), // content changed — refresh admin + public caches
  });
}

export function useSaveDistrict() {
  return useInvalidatingMutation(async ({ id, payload }) =>
    id ? (await api.patch(`/admin/districts/${id}`, payload)).data : (await api.post('/admin/districts', payload)).data
  );
}

export function useDeleteDistrict() {
  return useInvalidatingMutation(async (id) => (await api.delete(`/admin/districts/${id}`)).data);
}

export function useSaveSpot() {
  return useInvalidatingMutation(async ({ id, payload }) =>
    id ? (await api.patch(`/admin/spots/${id}`, payload)).data : (await api.post('/admin/spots', payload)).data
  );
}

export function useDeleteSpot() {
  return useInvalidatingMutation(async (id) => (await api.delete(`/admin/spots/${id}`)).data);
}
