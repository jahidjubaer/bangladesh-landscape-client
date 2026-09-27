import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import api from '../../lib/axios';
import { useAdminDistricts } from '../../features/districts/queries';
import ImageUploader from '../../components/ImageUploader';
import Loader from '../../components/Loader';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const STATUS = ['draft', 'published', 'completed', 'cancelled'];

const empty = {
  title: { bn: '', en: '' },
  description: { bn: '', en: '' },
  coverImageUrl: '',
  district: '',
  start: '',
  end: '',
  pricePerPerson: 5000,
  capacity: 20,
  itineraryText: '',
  includedText: '',
  meetingPoint: { bn: '' },
  status: 'draft',
};

const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean).map((bn) => ({ bn, en: '' }));

function EventsTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: districts } = useAdminDistricts();
  const [form, setForm] = useState(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => (await api.get('/admin/events')).data.data.events,
  });

  const save = useMutation({
    mutationFn: async (f) => {
      const { itineraryText, includedText, _id, seatsTaken, seatsLeft, start, end, createdAt, updatedAt, __v, ...rest } = f;
      const payload = {
        ...rest,
        district: f.district || null,
        dates: { start, end },
        pricePerPerson: Number(f.pricePerPerson),
        capacity: Number(f.capacity),
        itinerary: lines(itineraryText),
        included: lines(includedText),
      };
      return _id
        ? (await api.patch(`/admin/events/${_id}`, payload)).data
        : (await api.post('/admin/events', payload)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      setForm(null);
      toast('✓', 'success');
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/events/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminEvents'] }),
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  function openEdit(e) {
    setForm({
      ...empty,
      ...e,
      district: e.district?._id || e.district || '',
      start: toInput(e.dates?.start),
      end: toInput(e.dates?.end),
      itineraryText: (e.itinerary || []).map((i) => i.bn).join('\n'),
      includedText: (e.included || []).map((i) => i.bn).join('\n'),
    });
  }

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="btn btn-primary btn-sm" onClick={() => setForm(empty)}>+ নতুন ইভেন্ট</button>
      </div>

      {form && (
        <form className="card bg-base-100 shadow-lg mb-6" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
          <div className="card-body space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text font-semibold mb-1">শিরোনাম (বাংলা) *</span>
                <input required className="input input-bordered input-sm" value={form.title.bn} onChange={(e) => setForm({ ...form, title: { ...form.title, bn: e.target.value } })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">Title (English)</span>
                <input className="input input-bordered input-sm" value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">জেলা</span>
                <select className="select select-bordered select-sm" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                  <option value="">—</option>
                  {(districts || []).map((d) => <option key={d._id} value={d._id}>{d.name.bn}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">স্ট্যাটাস</span>
                <select className="select select-bordered select-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">শুরু *</span>
                <input type="date" required className="input input-bordered input-sm" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">শেষ *</span>
                <input type="date" required className="input input-bordered input-sm" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">জনপ্রতি মূল্য (টাকা) *</span>
                <input type="number" min="0" required className="input input-bordered input-sm" value={form.pricePerPerson} onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1">মোট সিট *</span>
                <input type="number" min="1" required className="input input-bordered input-sm" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </label>
            </div>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">বিবরণ (বাংলা)</span>
              <textarea rows={2} className="textarea textarea-bordered" value={form.description.bn} onChange={(e) => setForm({ ...form, description: { ...form.description, bn: e.target.value } })} />
            </label>
            <div className="form-control">
              <span className="label-text font-semibold mb-1">কভার ছবি</span>
              <div className="flex gap-2 items-center">
                <input className="input input-bordered input-sm flex-1" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
                <ImageUploader onUploaded={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))} />
              </div>
            </div>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">{t('events.itinerary')} (প্রতি লাইনে এক দিন)</span>
              <textarea rows={3} className="textarea textarea-bordered" value={form.itineraryText} onChange={(e) => setForm({ ...form, itineraryText: e.target.value })} />
            </label>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">{t('events.included')} (প্রতি লাইনে একটি)</span>
              <textarea rows={3} className="textarea textarea-bordered" value={form.includedText} onChange={(e) => setForm({ ...form, includedText: e.target.value })} />
            </label>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">{t('events.meetingPoint')}</span>
              <input className="input input-bordered input-sm" value={form.meetingPoint.bn} onChange={(e) => setForm({ ...form, meetingPoint: { bn: e.target.value } })} />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={save.isPending}>{t('admin.save')}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>{t('admin.cancel')}</button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        <table className="table table-zebra">
          <thead>
            <tr><th>ইভেন্ট</th><th>তারিখ</th><th>মূল্য</th><th>সিট</th><th>স্ট্যাটাস</th><th></th></tr>
          </thead>
          <tbody>
            {(events || []).map((e) => (
              <tr key={e._id}>
                <td className="font-semibold">{lx(e.title)}</td>
                <td className="text-xs">{new Date(e.dates.start).toLocaleDateString(locale())} – {new Date(e.dates.end).toLocaleDateString(locale())}</td>
                <td>{money(e.pricePerPerson)}</td>
                <td>
                  <span className="badge badge-ghost badge-sm gap-1">
                    <Users className="w-3 h-3" /> {e.seatsTaken}/{e.capacity}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-sm ${{ published: 'badge-success', draft: 'badge-ghost', completed: 'badge-info', cancelled: 'badge-error' }[e.status]}`}>
                    {e.status}
                  </span>
                </td>
                <td className="text-right whitespace-nowrap space-x-1">
                  <button className="btn btn-xs btn-outline" onClick={() => openEdit(e)}>{t('admin.edit')}</button>
                  <button className="btn btn-xs btn-error btn-outline" onClick={async () => (await confirm(t('admin.confirmDelete'))) && del.mutate(e._id)}>
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [status, setStatus] = useState('requested');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminEventBookings', status],
    queryFn: async () => (await api.get('/admin/event-bookings', { params: status ? { status } : {} })).data.data.bookings,
  });

  const act = useMutation({
    mutationFn: async ({ id, action, note }) => (await api.patch(`/admin/event-bookings/${id}/${action}`, { note })).data,
    onSuccess: (res) => {
      qc.invalidateQueries();
      toast(res.message, 'success');
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  async function decide(id, action) {
    const note = await confirm(action === 'confirm' ? t('admin.approve') : t('admin.rejectBtn'), {
      danger: action !== 'confirm',
      input: { placeholder: t('admin.note') },
    });
    if (note !== null) act.mutate({ id, action, note });
  }

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <select className="select select-bordered select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['requested', 'confirmed', 'rejected', 'cancelled', ''].map((s) => (
            <option key={s} value={s}>{s ? t(`booking.status.${s}`) : 'সব'}</option>
          ))}
        </select>
      </div>
      {!bookings?.length ? (
        <p className="text-center py-10 text-base-content/60">{t('admin.noItems')}</p>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
          <table className="table table-zebra">
            <thead>
              <tr><th>ব্যবহারকারী</th><th>ইভেন্ট</th><th>সিট</th><th>মোট</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.user?.name}
                    <div className="text-xs text-base-content/55">{b.user?.phone}{b.note && ` · 💬 ${b.note}`}</div>
                  </td>
                  <td className="text-sm">{lx(b.event?.title)}</td>
                  <td>{Number(b.seats).toLocaleString(locale())}</td>
                  <td className="font-semibold">{money(b.amountTotal)}</td>
                  <td className="text-right whitespace-nowrap space-x-1">
                    {b.status === 'requested' ? (
                      <>
                        <button className="btn btn-success btn-xs" onClick={() => decide(b._id, 'confirm')} disabled={act.isPending}>✓ {t('admin.approve')}</button>
                        <button className="btn btn-error btn-outline btn-xs" onClick={() => decide(b._id, 'reject')} disabled={act.isPending}>✗</button>
                      </>
                    ) : (
                      <span className="badge badge-sm">{t(`booking.status.${b.status}`)}</span>
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

export default function AdminEvents() {
  const [tab, setTab] = useState('bookings');
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('events.listTitle')}</h1>
      <div role="tablist" className="tabs tabs-boxed mb-6 w-fit">
        <button role="tab" className={`tab ${tab === 'bookings' ? 'tab-active' : ''}`} onClick={() => setTab('bookings')}>বুকিং</button>
        <button role="tab" className={`tab ${tab === 'events' ? 'tab-active' : ''}`} onClick={() => setTab('events')}>ইভেন্টসমূহ</button>
      </div>
      {tab === 'bookings' ? <BookingsTab /> : <EventsTab />}
    </div>
  );
}
