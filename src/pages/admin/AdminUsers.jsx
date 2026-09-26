import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, BadgeCheck, Ban, CircleCheck, Lock } from 'lucide-react';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

const ROLE_BADGE = { admin: 'badge-error', moderator: 'badge-info', guide: 'badge-success', partner: 'badge-warning', user: 'badge-ghost' };

export default function AdminUsers() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', q, role, page],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { q: q || undefined, role: role || undefined, page } })).data.data,
  });

  const act = useMutation({
    mutationFn: async ({ id, path, body }) => (await api.patch(`/admin/users/${id}/${path}`, body)).data,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      toast(res.message || '✓', 'success');
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  async function toggleSuspend(u) {
    const suspending = u.status === 'active';
    if (suspending && !(await confirm(`${t('adminUsers.suspend')}? (${u.name})`))) return;
    act.mutate({ id: u.id, path: 'status', body: { status: suspending ? 'suspended' : 'active' } });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('adminUsers.title')}</h1>
        <div className="flex gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQ(search);
            }}
            className="join"
          >
            <input
              className="input input-bordered input-sm join-item"
              placeholder={t('adminUsers.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="search" className="btn btn-sm btn-primary join-item">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <select className="select select-bordered select-sm" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">{t('adminUsers.allRoles')}</option>
            {['user', 'guide', 'moderator', 'partner', 'admin'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>ব্যবহারকারী</th>
                  <th>ভূমিকা</th>
                  <th className="text-center">{t('adminUsers.moderator')}</th>
                  <th className="text-center">{t('adminUsers.verifiedAuthor')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(data?.users || []).map((u) => {
                  const isAdmin = u.roles.includes('admin');
                  return (
                    <tr key={u.id} className={u.status === 'suspended' ? 'opacity-50' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            {u.avatarUrl ? (
                              <div className="w-9 rounded-full"><img src={u.avatarUrl} alt={u.name} /></div>
                            ) : (
                              <div className="bg-primary/15 text-primary rounded-full w-9 text-sm font-bold"><span>{u.name.charAt(0)}</span></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {u.name}
                              {u.status === 'suspended' && <span className="badge badge-error badge-xs">{t('adminUsers.suspended')}</span>}
                            </div>
                            <div className="text-xs text-base-content/55">
                              {u.phone} · {t('adminUsers.joined')} {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map((r) => (
                            <span key={r} className={`badge badge-sm ${ROLE_BADGE[r]}`}>{r}</span>
                          ))}
                        </div>
                      </td>
                      {isAdmin ? (
                        <td colSpan={3} className="text-center text-xs text-base-content/40">
                          <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> {t('adminUsers.protected')}</span>
                        </td>
                      ) : (
                        <>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="toggle toggle-info toggle-sm"
                              checked={u.roles.includes('moderator')}
                              onChange={(e) => act.mutate({ id: u.id, path: 'moderator', body: { enabled: e.target.checked } })}
                              disabled={act.isPending}
                              aria-label={t('adminUsers.moderator')}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="toggle toggle-primary toggle-sm"
                              checked={Boolean(u.verifiedAuthor)}
                              onChange={(e) => act.mutate({ id: u.id, path: 'verified-author', body: { enabled: e.target.checked } })}
                              disabled={act.isPending}
                              aria-label={t('adminUsers.verifiedAuthor')}
                            />
                          </td>
                          <td className="text-right">
                            <button
                              className={`btn btn-xs gap-1 ${u.status === 'active' ? 'btn-error btn-outline' : 'btn-success'}`}
                              onClick={() => toggleSuspend(u)}
                              disabled={act.isPending}
                            >
                              {u.status === 'active' ? (
                                <><Ban className="w-3 h-3" /> {t('adminUsers.suspend')}</>
                              ) : (
                                <><CircleCheck className="w-3 h-3" /> {t('adminUsers.activate')}</>
                              )}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data?.pages > 1 && (
            <div className="join flex justify-center mt-6">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-primary' : ''}`} onClick={() => setPage(p)}>
                  {Number(p).toLocaleString('bn-BD')}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
