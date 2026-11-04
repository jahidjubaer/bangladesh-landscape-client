import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

// Top picks for a season (home dial, menus)
export function useSeasonPicks(season, limit = 6) {
  return useQuery({
    queryKey: ['season-picks', season, limit],
    queryFn: async () => (await api.get('/spots', { params: { season, limit } })).data.data,
    enabled: Boolean(season),
    staleTime: 5 * 60 * 1000,
  });
}

// Paged list for the /seasons/:key page
export function useSeasonSpots(season) {
  return useInfiniteQuery({
    queryKey: ['season-spots', season],
    queryFn: async ({ pageParam = 1 }) =>
      (await api.get('/spots', { params: { season, page: pageParam, limit: 12 } })).data.data,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: Boolean(season),
  });
}
