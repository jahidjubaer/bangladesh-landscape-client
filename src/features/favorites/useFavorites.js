import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { t } from '../../i18n';

// Heart state for cards: one light /favorites/ids fetch shared app-wide,
// optimistic toggling so hearts respond instantly.
export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['favIds'],
    queryFn: async () => (await api.get('/favorites/ids')).data.data.favorites,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });
  const ids = data || [];

  const isSaved = (kind, itemId) => ids.some((f) => f.kind === kind && f.item === itemId);

  const { mutate } = useMutation({
    mutationFn: async ({ kind, itemId }) =>
      (await api.post('/favorites/toggle', { kind, itemId })).data.data,
    onMutate: async ({ kind, itemId }) => {
      await qc.cancelQueries({ queryKey: ['favIds'] });
      const prev = qc.getQueryData(['favIds']);
      qc.setQueryData(['favIds'], (old = []) =>
        old.some((f) => f.kind === kind && f.item === itemId)
          ? old.filter((f) => !(f.kind === kind && f.item === itemId))
          : [...old, { kind, item: itemId }]
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(['favIds'], ctx?.prev);
      toast(t('common.error'), 'error');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['favIds'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  function toggle(kind, itemId) {
    if (!user) {
      toast(t('wishlist.loginPrompt'), 'info');
      navigate('/login');
      return;
    }
    mutate({ kind, itemId });
  }

  return { isSaved, toggle };
}
