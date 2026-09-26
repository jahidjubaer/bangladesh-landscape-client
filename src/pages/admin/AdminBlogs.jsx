import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

export default function AdminBlogs() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['modBlogs', status],
    queryFn: async () => (await api.get('/moderation/blogs', { params: status ? { status } : {} })).data.data.blogs,
  });

  const { data: detail } = useQuery({
    queryKey: ['modBlog', expanded],
    queryFn: async () => (await api.get(`/moderation/blogs/${expanded}`)).data.data.blog,
    enabled: Boolean(expanded),
  });

  const act = useMutation({
    mutationFn: async ({ id, action, note }) => (await api.patch(`/moderation/blogs/${id}/${action}`, { note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modBlogs'] }),
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  async function rejectWithNote(id) {
    const note = await confirm(t('admin.rejectBtn'), { input: { placeholder: t('admin.reason') } });
    if (note !== null) act.mutate({ id, action: 'reject', note });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('nav.blog')}</h1>
        <select className="select select-bordered select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['pending', 'approved', 'rejected', ''].map((s) => (
            <option key={s} value={s}>{s ? t(`blog.status.${s}`) : 'সব'}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error mb-4 text-sm py-2">{error}</div>}

      {isLoading ? (
        <Loader />
      ) : !blogs?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <strong>{b.title.bn}</strong>
                    <div className="text-sm text-base-content/60">
                      ✍️ {b.author?.name} ({b.author?.roles?.join(', ')})
                      {b.district?.name?.bn && ` · 📍 ${b.district.name.bn}`} ·{' '}
                      {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${{ pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error' }[b.status] || 'badge-ghost'}`}>
                      {t(`blog.status.${b.status}`)}
                    </span>
                    <button className="btn btn-xs btn-outline" onClick={() => setExpanded(expanded === b._id ? null : b._id)}>
                      {expanded === b._id ? '▲' : '👁️ পড়ুন'}
                    </button>
                    {b.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-xs" onClick={() => act.mutate({ id: b._id, action: 'approve' })} disabled={act.isPending}>
                          ✓ {t('admin.approve')}
                        </button>
                        <button className="btn btn-error btn-outline btn-xs" onClick={() => rejectWithNote(b._id)} disabled={act.isPending}>
                          ✗ {t('admin.rejectBtn')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expanded === b._id && detail && (
                  <div className="mt-3 border-t border-base-200 pt-3">
                    {detail.coverImageUrl && <img src={detail.coverImageUrl} alt="" className="h-40 rounded-lg object-cover mb-3" />}
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: detail.content.bn }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
