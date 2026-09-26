import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAdminDistricts } from '../../features/districts/queries';
import ImageUploader from '../../components/ImageUploader';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t } from '../../i18n';

const TYPES = ['hotel', 'houseboat', 'boat', 'chander-gari', 'other-transport', 'cottage', 'resort'];
const TYPE_BN = {
  hotel: 'হোটেল', houseboat: 'হাউসবোট', boat: 'বোট', 'chander-gari': 'চান্দের গাড়ি',
  'other-transport': 'অন্য পরিবহন', cottage: 'কটেজ', resort: 'রিসোর্ট',
};
const STATUS_BN = { pending: 'অপেক্ষমাণ', approved: 'অনুমোদিত', suspended: 'স্থগিত' };

const empty = {
  type: 'hotel', district: '', name: { bn: '', en: '' }, description: { bn: '' },
  contactPhone: '', priceRange: { min: 0, max: 0 }, capacity: 0, imagesText: '', status: 'approved',
  isBookable: false,
};

export default function AdminListings() {
  const qc = useQueryClient();
  const { data: districts } = useAdminDistricts();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['adminListings'],
    queryFn: async () => (await api.get('/admin/listings')).data.data.listings,
  });

  const save = useMutation({
    mutationFn: async (f) => {
      const { imagesText, _id, owner, ownerPhone, bookable, blockedDates, createdAt, updatedAt, __v, ...rest } = f;
      const payload = { ...rest, images: imagesText.split('\n').map((l) => l.trim()).filter(Boolean) };
      const res = _id
        ? (await api.patch(`/admin/listings/${_id}`, payload)).data
        : (await api.post('/admin/listings', payload)).data;
      // Owner assignment goes through its own endpoint (grants partner role)
      const id = _id || res.data.listing._id;
      const currentOwnerPhone = owner?.phone || '';
      if ((ownerPhone || '') !== currentOwnerPhone) {
        await api.patch(`/admin/listings/${id}/owner`, { phone: ownerPhone || '' });
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      setForm(null);
    },
    onError: (err) => setError(err.response?.data?.message || t('common.error')),
  });

  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/listings/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminListings'] }),
  });

  function openEdit(l) {
    setError('');
    setForm({
      ...empty,
      ...l,
      district: l.district?._id || l.district,
      imagesText: (l.images || []).join('\n'),
      ownerPhone: l.owner?.phone || '',
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('admin.listings')}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setError(''); setForm(empty); }}>
          + {t('admin.addListing')}
        </button>
      </div>

      <div className="alert text-sm py-2 mb-4">
        ℹ️ বুকিং চালু করতে: তালিকায় "অনলাইন বুকিং" টগল + জেলা ফর্মে সংশ্লিষ্ট ফিচার ফ্ল্যাগ (boat/hotel/transport) দুটোই চালু করুন। মালিক সেট করলে সেই ইউজার পার্টনার ড্যাশবোর্ড পাবেন।
      </div>

      {form && (
        <form className="card bg-base-100 shadow-lg mb-6" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
          <div className="card-body space-y-3">
            {error && <div className="alert alert-error text-sm py-2">{error}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text font-semibold mb-1">ধরন</span>
                <select className="select select-bordered select-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((tp) => <option key={tp} value={tp}>{TYPE_BN[tp]}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">জেলা *</span>
                <select required className="select select-bordered select-sm" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                  <option value="">নির্বাচন করুন</option>
                  {(districts || []).map((d) => <option key={d._id} value={d._id}>{d.name.bn}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">নাম (বাংলা) *</span>
                <input required className="input input-bordered input-sm" value={form.name.bn} onChange={(e) => setForm({ ...form, name: { ...form.name, bn: e.target.value } })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">যোগাযোগ নম্বর</span>
                <input className="input input-bordered input-sm" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">ভাড়া (min)</span>
                <input type="number" className="input input-bordered input-sm" value={form.priceRange.min} onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, min: Number(e.target.value) } })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">ভাড়া (max)</span>
                <input type="number" className="input input-bordered input-sm" value={form.priceRange.max} onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, max: Number(e.target.value) } })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">ধারণক্ষমতা</span>
                <input type="number" className="input input-bordered input-sm" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">স্ট্যাটাস</span>
                <select className="select select-bordered select-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS_BN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">মালিকের ফোন (পার্টনার)</span>
                <input className="input input-bordered input-sm" placeholder="01XXXXXXXXX" value={form.ownerPhone || ''} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
              </label>
              <label className="label cursor-pointer justify-start gap-2 sm:col-span-2">
                <input type="checkbox" className="toggle toggle-success toggle-sm" checked={Boolean(form.isBookable)} onChange={(e) => setForm({ ...form, isBookable: e.target.checked })} />
                <span className="label-text font-semibold">অনলাইন বুকিং (জেলার ফিচার ফ্ল্যাগও চালু থাকতে হবে)</span>
              </label>
            </div>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">বিবরণ (বাংলা)</span>
              <textarea rows={2} className="textarea textarea-bordered" value={form.description.bn} onChange={(e) => setForm({ ...form, description: { bn: e.target.value } })} />
            </label>
            <div className="form-control">
              <span className="label-text font-semibold mb-1">ছবি (প্রতি লাইনে একটি URL)</span>
              <textarea rows={2} className="textarea textarea-bordered" value={form.imagesText} onChange={(e) => setForm({ ...form, imagesText: e.target.value })} />
              <div className="mt-2">
                <ImageUploader onUploaded={(url) => setForm((f) => ({ ...f, imagesText: f.imagesText ? `${f.imagesText}\n${url}` : url }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={save.isPending}>{t('admin.save')}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>{t('admin.cancel')}</button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader />
      ) : !listings?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
          <table className="table table-zebra">
            <thead>
              <tr><th>নাম</th><th>ধরন</th><th>জেলা</th><th>ভাড়া</th><th>স্ট্যাটাস</th><th></th></tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id}>
                  <td className="font-semibold">{l.name.bn}</td>
                  <td><span className="badge badge-outline badge-sm">{TYPE_BN[l.type]}</span></td>
                  <td>{l.district?.name?.bn}</td>
                  <td className="text-sm">৳{l.priceRange?.min}–{l.priceRange?.max}</td>
                  <td>
                    <span className={`badge badge-sm ${{ approved: 'badge-success', pending: 'badge-warning', suspended: 'badge-error' }[l.status]}`}>
                      {STATUS_BN[l.status]}
                    </span>
                    {l.isBookable && <span className="badge badge-info badge-sm ms-1">বুকিং</span>}
                    {l.owner && <div className="text-xs text-base-content/50 mt-0.5">👤 {l.owner.name}</div>}
                  </td>
                  <td className="text-right whitespace-nowrap space-x-1">
                    <button className="btn btn-xs btn-outline" onClick={() => openEdit(l)}>{t('admin.edit')}</button>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={async () => (await confirm(t('admin.confirmDelete'))) && del.mutate(l._id)}
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
