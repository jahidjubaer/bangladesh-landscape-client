import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RotateCcw, Trash2, Server, MonitorSmartphone } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/Loader';
import { t, locale } from '../../i18n';

const when = (d) => new Date(d).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' });
const num = (n) => Number(n || 0).toLocaleString(locale());

function ErrorRow({ e, onToggle, busy }) {
  const [open, setOpen] = useState(false);
  const Icon = e.source === 'server' ? Server : MonitorSmartphone;
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-ghost gap-1"><Icon className="w-3.5 h-3.5" /> {t(`errorLog.${e.source}`)}</span>
          <span className="badge badge-error badge-outline">× {num(e.count)}</span>
          {e.path && <code className="text-xs text-base-content/60">{e.method} {e.path}</code>}
          <button className="btn btn-ghost btn-xs ms-auto gap-1" disabled={busy} onClick={() => onToggle(e._id, !e.resolved)}>
            {e.resolved ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {t(e.resolved ? 'errorLog.reopen' : 'errorLog.resolve')}
          </button>
        </div>
        <button className="text-left font-mono text-sm break-all" onClick={() => setOpen((v) => !v)}>{e.message}</button>
        <p className="text-xs text-base-content/50">
          {t('errorLog.lastSeen')} {when(e.lastSeen)} · {t('errorLog.firstSeen')} {when(e.createdAt)}
        </p>
        {open && (
          <pre className="text-xs bg-base-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
            {e.stack || '—'}
            {e.userAgent ? `\n\n${e.userAgent}` : ''}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function AdminErrors() {
  const qc = useQueryClient();
  const [resolved, setResolved] = useState(false);
  const [source, setSource] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['errorLogs', resolved, source],
    queryFn: async () => (await api.get('/admin/errors', { params: { resolved, source: source || undefined } })).data.data,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['errorLogs'] });
  const toggle = useMutation({
    mutationFn: async ({ id, value }) => api.patch(`/admin/errors/${id}`, { resolved: value }),
    onSuccess: refresh,
  });
  const clear = useMutation({ mutationFn: async () => api.delete('/admin/errors'), onSuccess: refresh });

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-1">{t('errorLog.title')}</h1>
      <p className="text-base-content/60 mb-6">{t('errorLog.subtitle')}</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="join">
          {[false, true].map((r) => (
            <button key={String(r)} className={`btn btn-sm join-item ${resolved === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setResolved(r)}>
              {t(r ? 'errorLog.resolved' : 'errorLog.open')}
            </button>
          ))}
        </div>
        <select className="select select-bordered select-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">{t('errorLog.allSources')} ({num((data?.open?.server || 0) + (data?.open?.client || 0))})</option>
          <option value="server">{t('errorLog.server')} ({num(data?.open?.server)})</option>
          <option value="client">{t('errorLog.client')} ({num(data?.open?.client)})</option>
        </select>
        {resolved && data?.errors?.length > 0 && (
          <button className="btn btn-ghost btn-sm ms-auto gap-1 text-error" disabled={clear.isPending} onClick={() => clear.mutate()}>
            <Trash2 className="w-4 h-4" /> {t('errorLog.clearResolved')}
          </button>
        )}
      </div>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="alert alert-error">{t('common.error')}</div>
      ) : !data.errors.length ? (
        <p className="text-center py-10 text-base-content/60">{t('errorLog.none')}</p>
      ) : (
        <div className="space-y-3">
          {data.errors.map((e) => (
            <ErrorRow key={e._id} e={e} busy={toggle.isPending} onToggle={(id, value) => toggle.mutate({ id, value })} />
          ))}
        </div>
      )}
    </div>
  );
}
