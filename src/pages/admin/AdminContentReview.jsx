import { useState } from 'react';
import { Link } from '../../lib/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Pencil, CheckCircle2, Wrench, RotateCcw, Plus, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/Loader';
import { t, lx, locale } from '../../i18n';

const FIELDS = ['history', 'fee', 'hours', 'location', 'name', 'facility', 'safety', 'other'];
const DISTRICT_CHECKS = new Set(['noHero', 'notVerified', 'noWarnings']);
const STATUS_BADGE = { open: 'badge-warning', confirmed: 'badge-success', fixed: 'badge-info' };
const num = (n) => Number(n || 0).toLocaleString(locale());
const editLink = (item) => (item.target === 'spot' ? `/admin/spots/${item.itemId || item.id}` : `/admin/districts/${item.itemId || item.id}`);

function FlagRow({ flag, onAct, busy }) {
  const [note, setNote] = useState(flag.resolutionNote || '');
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={flag.publicLink} className="link link-primary font-semibold inline-flex items-center gap-1">
            {lx(flag.itemName)} <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          {flag.districtName && <span className="text-xs text-base-content/50">{lx(flag.districtName)}</span>}
          <span className="badge badge-ghost badge-sm">{t(`contentReview.target.${flag.target}`)}</span>
          <span className="badge badge-outline badge-sm">{t(`contentReview.field.${flag.field}`)}</span>
          <span className={`badge badge-sm ${STATUS_BADGE[flag.status]}`}>{t(`contentReview.status.${flag.status}`)}</span>
          {flag.itemId && (
            <Link to={editLink(flag)} className="btn btn-ghost btn-xs ms-auto gap-1">
              <Pencil className="w-3.5 h-3.5" /> {t('contentReview.edit')}
            </Link>
          )}
        </div>
        <p className="text-sm leading-relaxed">{flag.note}</p>
        {flag.status !== 'open' && flag.resolvedBy && (
          <p className="text-xs text-base-content/50">
            {t('contentReview.resolvedBy')} {flag.resolvedBy.name} · {new Date(flag.resolvedAt).toLocaleDateString(locale())}
          </p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="input input-bordered input-xs grow min-w-48"
            placeholder={t('contentReview.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {flag.status === 'open' ? (
            <>
              <button className="btn btn-success btn-xs gap-1" disabled={busy} onClick={() => onAct(flag._id, 'confirmed', note)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('contentReview.confirm')}
              </button>
              <button className="btn btn-info btn-xs gap-1" disabled={busy} onClick={() => onAct(flag._id, 'fixed', note)}>
                <Wrench className="w-3.5 h-3.5" /> {t('contentReview.markFixed')}
              </button>
            </>
          ) : (
            <button className="btn btn-ghost btn-xs gap-1" disabled={busy} onClick={() => onAct(flag._id, 'open', note)}>
              <RotateCcw className="w-3.5 h-3.5" /> {t('contentReview.reopen')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewFlagForm({ onDone }) {
  const [form, setForm] = useState({ target: 'spot', slug: '', field: 'other', note: '' });
  const [error, setError] = useState('');
  const create = useMutation({
    mutationFn: async () => (await api.post('/admin/content-review/flags', form)).data,
    onSuccess: () => {
      setForm((f) => ({ ...f, slug: '', note: '' }));
      setError('');
      onDone();
    },
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-2">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> {t('contentReview.newFlag')}</h3>
        {error && <div className="alert alert-error text-sm py-1.5">{error}</div>}
        <div className="flex flex-wrap gap-2">
          <select className="select select-bordered select-sm" value={form.target} onChange={set('target')}>
            <option value="spot">{t('contentReview.target.spot')}</option>
            <option value="district">{t('contentReview.target.district')}</option>
          </select>
          <input className="input input-bordered input-sm w-44" placeholder="slug (e.g. tanguar-haor)" value={form.slug} onChange={set('slug')} />
          <select className="select select-bordered select-sm" value={form.field} onChange={set('field')}>
            {FIELDS.map((f) => <option key={f} value={f}>{t(`contentReview.field.${f}`)}</option>)}
          </select>
          <input className="input input-bordered input-sm grow min-w-60" placeholder={t('contentReview.newNote')} value={form.note} onChange={set('note')} />
          <button className="btn btn-primary btn-sm" disabled={create.isPending || !form.slug || form.note.length < 5} onClick={() => create.mutate()}>
            {t('contentReview.add')}
          </button>
        </div>
      </div>
    </div>
  );
}

function FlagsTab() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('open');
  const [field, setField] = useState('');
  const [showNew, setShowNew] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['contentFlags', status, field],
    queryFn: async () => (await api.get('/admin/content-review/flags', { params: { status, field: field || undefined } })).data.data,
  });
  const act = useMutation({
    mutationFn: async ({ id, next, note }) =>
      (await api.patch(`/admin/content-review/flags/${id}`, { status: next, resolutionNote: note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contentFlags'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="join">
          {['open', 'confirmed', 'fixed'].map((s) => (
            <button key={s} className={`btn btn-sm join-item ${status === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatus(s)}>
              {t(`contentReview.status.${s}`)} <span className="badge badge-sm">{num(data?.counts?.[s])}</span>
            </button>
          ))}
        </div>
        <select className="select select-bordered select-sm" value={field} onChange={(e) => setField(e.target.value)}>
          <option value="">{t('contentReview.allFields')}</option>
          {FIELDS.map((f) => <option key={f} value={f}>{t(`contentReview.field.${f}`)}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm ms-auto gap-1" onClick={() => setShowNew((v) => !v)}>
          <Plus className="w-4 h-4" /> {t('contentReview.newFlag')}
        </button>
      </div>
      {showNew && <NewFlagForm onDone={() => qc.invalidateQueries({ queryKey: ['contentFlags'] })} />}
      {isLoading ? (
        <Loader />
      ) : !data?.flags?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="space-y-3">
          {data.flags.map((f) => (
            <FlagRow
              key={`${f._id}-${f.status}`}
              flag={f}
              busy={act.isPending}
              onAct={(id, next, note) => act.mutate({ id, next, note })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GapsTab() {
  const [open, setOpen] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contentGaps'],
    queryFn: async () => (await api.get('/admin/content-review/gaps')).data.data,
  });
  if (isLoading) return <Loader />;
  if (isError || !data) return <div className="alert alert-error">{t('common.error')}</div>;
  return (
    <div className="space-y-3">
      {data.checks.map((c) => {
        const total = DISTRICT_CHECKS.has(c.key) ? data.totals.districts : data.totals.spots;
        return (
          <div key={c.key} className="card bg-base-100 shadow-sm">
            <button className="card-body p-4 flex-row items-center gap-3 text-left" onClick={() => setOpen(open === c.key ? '' : c.key)}>
              <span className={`badge badge-lg font-bold ${c.count ? 'badge-warning' : 'badge-success'}`}>{num(c.count)}</span>
              <div className="grow">
                <div className="font-semibold">{t(`contentReview.gap.${c.key}`)}</div>
                <progress className="progress progress-success w-full" value={total - c.count} max={total} />
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${open === c.key ? 'rotate-180' : ''}`} />
            </button>
            {open === c.key && c.count > 0 && (
              <div className="px-4 pb-4 flex flex-wrap gap-1.5 max-h-72 overflow-y-auto">
                {c.items.map((i) => (
                  <Link key={i.slug} to={editLink(i)} className="badge badge-ghost gap-1 py-3 hover:badge-primary">
                    {lx(i.name)}
                    {i.districtName && <span className="opacity-60">· {lx(i.districtName)}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminContentReview() {
  const [tab, setTab] = useState('flags');
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-1">{t('contentReview.title')}</h1>
      <p className="text-base-content/60 mb-6">{t('contentReview.subtitle')}</p>
      <div role="tablist" className="tabs tabs-boxed w-fit mb-6">
        {['flags', 'gaps'].map((k) => (
          <button key={k} role="tab" className={`tab ${tab === k ? 'tab-active' : ''}`} onClick={() => setTab(k)}>
            {t(`contentReview.tabs.${k}`)}
          </button>
        ))}
      </div>
      {tab === 'flags' ? <FlagsTab /> : <GapsTab />}
    </div>
  );
}
