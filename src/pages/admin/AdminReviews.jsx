import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import StarRating from '../../components/ui/StarRating';
import { t, lx, locale } from '../../i18n';

const STATUS_BADGE = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error' };

export default function AdminReviews() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['modReviews', status],
    queryFn: async () => (await api.get('/reviews/moderation', { params: { status } })).data.data.reviews,
  });

  const act = useMutation({
    mutationFn: async ({ id, next }) => (await api.patch(`/reviews/${id}/status`, { status: next })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modReviews'] }),
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('admin.reviews')}</h1>
        <select className="select select-bordered select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['pending', 'approved', 'rejected'].map((s) => (
            <option key={s} value={s}>{t(`blog.status.${s}`)}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error mb-4 text-sm py-2">{error}</div>}

      {isLoading ? (
        <Loader />
      ) : !reviews?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <StarRating value={r.rating} size={15} />
                      <Link to={r.itemLink} className="link link-primary font-semibold inline-flex items-center gap-1">
                        {lx(r.itemName) || '—'} <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <span className="badge badge-ghost badge-sm">{t(`search.groups.${r.kind}s`)}</span>
                    </div>
                    {r.text && <p className="text-sm text-base-content/75 leading-relaxed">{r.text}</p>}
                    <div className="text-xs text-base-content/50 mt-1">
                      👤 {r.user?.name} ({r.user?.phone}) · {new Date(r.updatedAt).toLocaleDateString(locale())}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${STATUS_BADGE[r.status] || 'badge-ghost'}`}>{t(`blog.status.${r.status}`)}</span>
                    {r.status !== 'approved' && (
                      <button className="btn btn-success btn-xs" onClick={() => act.mutate({ id: r._id, next: 'approved' })} disabled={act.isPending}>
                        ✓ {t('admin.approve')}
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button className="btn btn-error btn-outline btn-xs" onClick={() => act.mutate({ id: r._id, next: 'rejected' })} disabled={act.isPending}>
                        ✗ {t('admin.rejectBtn')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
