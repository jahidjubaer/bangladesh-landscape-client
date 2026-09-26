import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import ImageUploader from '../../components/ImageUploader';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

const SLOTS = ['hero-top', 'hero-bottom', 'sidebar', 'blog-inline'];
const empty = { slot: 'hero-top', sponsorName: '', imageUrl: '', targetUrl: '', startsAt: '', endsAt: '', isActive: true };

export default function AdminAds() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null); // null = closed, {} = editing/creating
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const { data: ads, isLoading } = useQuery({
    queryKey: ['adminAds'],
    queryFn: async () => (await api.get('/admin/ads')).data.data.ads,
  });

  const save = useMutation({
    mutationFn: async (payload) =>
      payload._id
        ? (await api.patch(`/admin/ads/${payload._id}`, payload)).data
        : (await api.post('/admin/ads', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminAds'] });
      qc.invalidateQueries({ queryKey: ['ads'] });
      setForm(null);
    },
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/ads/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminAds'] }),
  });

  function openEdit(ad) {
    setError('');
    setForm({
      ...ad,
      startsAt: ad.startsAt ? new Date(ad.startsAt).toISOString().slice(0, 10) : '',
      endsAt: ad.endsAt ? new Date(ad.endsAt).toISOString().slice(0, 10) : '',
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.ads')}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setError(''); setForm(empty); }}>
          + {t('admin.addAd')}
        </button>
      </div>

      {form && (
        <form
          className="card bg-base-100 shadow-lg mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
        >
          <div className="card-body space-y-3">
            {error && <div className="alert alert-error text-sm py-2">{error}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text font-semibold mb-1">স্লট</span>
                <select className="select select-bordered select-sm" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">স্পনসরের নাম *</span>
                <input required className="input input-bordered input-sm" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
              </label>
              <label className="form-control sm:col-span-2">
                <span className="label-text font-semibold mb-1">ব্যানার ইমেজ *</span>
                <div className="flex gap-2 items-center">
                  <input required className="input input-bordered input-sm flex-1" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                  <ImageUploader onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
                </div>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 max-h-20 rounded" />}
              </label>
              <label className="form-control sm:col-span-2">
                <span className="label-text font-semibold mb-1">টার্গেট লিংক *</span>
                <input required type="url" className="input input-bordered input-sm" placeholder="https://sponsor.com" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">শুরু</span>
                <input type="date" className="input input-bordered input-sm" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">শেষ *</span>
                <input required type="date" className="input input-bordered input-sm" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              </label>
            </div>
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="toggle toggle-success toggle-sm" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span className="label-text font-semibold">{t('admin.active')}</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={save.isPending}>{t('admin.save')}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>{t('admin.cancel')}</button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader />
      ) : !ads?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
          <table className="table">
            <thead>
              <tr><th>স্পনসর</th><th>স্লট</th><th>মেয়াদ</th><th>ইমপ্রেশন / ক্লিক</th><th></th></tr>
            </thead>
            <tbody>
              {ads.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img src={a.imageUrl} alt="" className="h-8 w-16 object-cover rounded" />
                      <div>
                        {a.sponsorName}
                        {!a.isActive && <span className="badge badge-ghost badge-xs ms-1">{t('admin.inactive')}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-outline badge-sm">{a.slot}</span></td>
                  <td className="text-xs">
                    {new Date(a.startsAt).toLocaleDateString('bn-BD')} → {new Date(a.endsAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="text-sm">{a.impressions} / {a.clicks}</td>
                  <td className="text-right whitespace-nowrap space-x-1">
                    <button className="btn btn-xs btn-outline" onClick={() => openEdit(a)}>{t('admin.edit')}</button>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={async () => (await confirm(t('admin.confirmDelete'))) && del.mutate(a._id)}
                    >
                      {t('admin.delete')}
                    </button>
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
