import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

function useApplications(status) {
  return useQuery({
    queryKey: ['guideApps', status],
    queryFn: async () =>
      (await api.get('/moderation/guide-applications', { params: status ? { status } : {} })).data.data.applications,
  });
}

async function openDoc(filename) {
  // Private docs need the session cookie — fetch as blob, open in new tab
  const res = await api.get(`/moderation/files/${filename}`, { responseType: 'blob' });
  window.open(URL.createObjectURL(res.data), '_blank');
}

export default function AdminGuideApplications() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const { data: apps, isLoading } = useApplications(status);

  const act = useMutation({
    mutationFn: async ({ id, action, body }) =>
      (await api.patch(`/moderation/guide-applications/${id}/${action}`, body || {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guideApps'] }),
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  async function rejectWithReason(id) {
    const reason = await confirm(t('admin.rejectBtn'), { input: { placeholder: t('admin.reason') } });
    if (reason !== null) act.mutate({ id, action: 'reject', body: { reason } });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.guideApps')}</h1>
        <select className="select select-bordered select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">সব</option>
          {['pending', 'screened', 'approved', 'rejected'].map((s) => (
            <option key={s} value={s}>{t(`guide.appStatus.${s}`)}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error mb-4 text-sm py-2">{error}</div>}

      {isLoading ? (
        <Loader />
      ) : !apps?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <strong>{a.user?.name}</strong> · 📞 {a.user?.phone}
                    <div className="text-sm text-base-content/60">
                      📍 {(a.districts || []).map((d) => d.name?.bn).join(', ')} · ৳{a.dailyRate}/দিন ·{' '}
                      {a.experienceYears} বছর অভিজ্ঞতা
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      { pending: 'badge-warning', screened: 'badge-info', approved: 'badge-success', rejected: 'badge-error' }[a.applicationStatus]
                    }`}>
                      {t(`guide.appStatus.${a.applicationStatus}`)}
                    </span>
                    <button className="btn btn-xs btn-outline" onClick={() => setExpanded(expanded === a._id ? null : a._id)}>
                      {expanded === a._id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expanded === a._id && (
                  <div className="mt-3 border-t border-base-200 pt-3 space-y-2 text-sm">
                    <div><strong>NID:</strong> {a.application?.nidNumber}</div>
                    <div><strong>{t('guide.address')}:</strong> {a.application?.address}</div>
                    <div><strong>WhatsApp:</strong> {a.application?.whatsappNumber}</div>
                    {a.application?.facebookUrl && (
                      <div><strong>Facebook:</strong> <a className="link" href={a.application.facebookUrl} target="_blank" rel="noreferrer">{a.application.facebookUrl}</a></div>
                    )}
                    {a.application?.education && <div><strong>{t('guide.education')}:</strong> {a.application.education}</div>}
                    {a.application?.experienceSummary && <div><strong>{t('guide.expSummary')}:</strong> {a.application.experienceSummary}</div>}
                    <div className="flex gap-2 flex-wrap">
                      {a.application?.nidFile && (
                        <button className="btn btn-xs btn-outline" onClick={() => openDoc(a.application.nidFile)}>
                          🪪 NID {t('admin.viewDoc')}
                        </button>
                      )}
                      {a.application?.citizenshipCertFile && (
                        <button className="btn btn-xs btn-outline" onClick={() => openDoc(a.application.citizenshipCertFile)}>
                          📜 সনদ {t('admin.viewDoc')}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      {a.applicationStatus === 'pending' && (
                        <button className="btn btn-info btn-xs" onClick={() => act.mutate({ id: a._id, action: 'screen' })} disabled={act.isPending}>
                          {t('admin.screenBtn')}
                        </button>
                      )}
                      {['pending', 'screened'].includes(a.applicationStatus) && (
                        <>
                          <button className="btn btn-success btn-xs" onClick={() => act.mutate({ id: a._id, action: 'approve' })} disabled={act.isPending}>
                            ✓ {t('admin.approve')}
                          </button>
                          <button className="btn btn-error btn-outline btn-xs" onClick={() => rejectWithReason(a._id)} disabled={act.isPending}>
                            ✗ {t('admin.rejectBtn')}
                          </button>
                        </>
                      )}
                    </div>
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
