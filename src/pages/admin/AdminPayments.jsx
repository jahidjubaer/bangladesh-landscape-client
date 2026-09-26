import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString('bn-BD')}`;

export default function AdminPayments() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending-verification');
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['adminPayments', status],
    queryFn: async () => (await api.get('/admin/payments', { params: status ? { status } : {} })).data.data.payments,
  });

  const act = useMutation({
    mutationFn: async ({ id, action, note }) => (await api.patch(`/admin/payments/${id}/${action}`, { note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminPayments'] }),
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  async function withNote(id, action) {
    const note = await confirm(action === 'approve' ? t('admin.approve') : t('admin.rejectBtn'), {
      danger: action !== 'approve',
      input: { placeholder: t('admin.note') },
    });
    if (note !== null) act.mutate({ id, action, note });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.payments')}</h1>
        <select className="select select-bordered select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending-verification">যাচাই বাকি</option>
          <option value="success">সফল</option>
          <option value="failed">ব্যর্থ</option>
          <option value="">সব</option>
        </select>
      </div>

      {error && <div className="alert alert-error mb-4 text-sm py-2">{error}</div>}

      {isLoading ? (
        <Loader />
      ) : !payments?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
          <table className="table">
            <thead>
              <tr>
                <th>ব্যবহারকারী</th>
                <th>গেটওয়ে</th>
                <th>TrxID / প্রেরক</th>
                <th>টাকা</th>
                <th>তারিখ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.user?.name}
                    <div className="text-xs text-base-content/60">{p.user?.phone}</div>
                  </td>
                  <td><span className="badge badge-ghost badge-sm">{p.gateway}</span></td>
                  <td>
                    {p.manual?.trxId ? (
                      <>
                        <code className="text-sm">{p.manual.trxId}</code>
                        <div className="text-xs text-base-content/60">{p.manual.senderNumber}</div>
                      </>
                    ) : (
                      <code className="text-xs">{p.gatewayTranId || p.tranId}</code>
                    )}
                  </td>
                  <td className="font-semibold">{money(p.amount)}</td>
                  <td className="text-xs">{new Date(p.createdAt).toLocaleString('bn-BD')}</td>
                  <td className="text-right whitespace-nowrap space-x-1">
                    {p.status === 'pending-verification' ? (
                      <>
                        <button className="btn btn-success btn-xs" onClick={() => withNote(p._id, 'approve')} disabled={act.isPending}>
                          ✓ {t('admin.approve')}
                        </button>
                        <button className="btn btn-error btn-outline btn-xs" onClick={() => withNote(p._id, 'reject')} disabled={act.isPending}>
                          ✗
                        </button>
                      </>
                    ) : (
                      <span className={`badge badge-sm ${p.status === 'success' ? 'badge-success' : 'badge-error'}`}>{p.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
