import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BedDouble, CalendarCheck, Phone } from 'lucide-react';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;
const fmt = (d) => new Date(d).toLocaleDateString(locale());

function ListingEditor({ listing }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    setForm({
      description: listing.description?.bn || '',
      contactPhone: listing.contactPhone || '',
      min: listing.priceRange?.min || 0,
      max: listing.priceRange?.max || 0,
      capacity: listing.capacity || 0,
      blockedDates: (listing.blockedDates || []).map((d) => new Date(d).toISOString().slice(0, 10)),
    });
  }, [listing]);

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.patch(`/partner/listings/${listing._id}`, {
          description: { bn: form.description },
          contactPhone: form.contactPhone,
          priceRange: { min: Number(form.min), max: Number(form.max) },
          capacity: Number(form.capacity),
          blockedDates: form.blockedDates,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partnerListings'] });
      toast(t('partner.saved'), 'success');
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  if (!form) return null;

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {lx(listing.name)}
            <span className="badge badge-outline badge-sm">{t(`listingType.${listing.type}`)}</span>
          </h3>
          <span className={`badge badge-sm ${listing.bookable ? 'badge-success' : 'badge-ghost'}`}>
            {listing.bookable ? t('partner.bookableOn') : t('partner.bookableOff')}
          </span>
        </div>

        <label className="form-control">
          <span className="label-text font-semibold mb-1">{t('partner.descriptionBn')}</span>
          <textarea rows={2} className="textarea textarea-bordered" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>

        <div className="grid gap-3 sm:grid-cols-4">
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('partner.price')} (min)</span>
            <input type="number" min="0" className="input input-bordered input-sm" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">(max)</span>
            <input type="number" min="0" className="input input-bordered input-sm" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('listing.capacity')}</span>
            <input type="number" min="0" className="input input-bordered input-sm" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('partner.contactPhone')}</span>
            <input className="input input-bordered input-sm" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </label>
        </div>

        <div>
          <span className="label-text font-semibold block mb-2">{t('partner.blockedDates')}</span>
          <div className="flex gap-2 mb-2">
            <input type="date" className="input input-bordered input-sm" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => {
                if (newDate && !form.blockedDates.includes(newDate)) {
                  setForm({ ...form, blockedDates: [...form.blockedDates, newDate].sort() });
                }
                setNewDate('');
              }}
            >
              + {t('guide.addDate')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.blockedDates.map((d) => (
              <span key={d} className="badge badge-lg gap-1">
                {d}
                <button type="button" className="text-error" onClick={() => setForm({ ...form, blockedDates: form.blockedDates.filter((x) => x !== d) })}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-sm rounded-full w-fit" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? t('admin.saving') : t('admin.save')}
        </button>
      </div>
    </div>
  );
}

function ListingsTab() {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['partnerListings'],
    queryFn: async () => (await api.get('/partner/listings')).data.data.listings,
  });

  if (isLoading) return <Loader />;
  if (!listings?.length) return <EmptyState icon={BedDouble} title={t('partner.noListings')} />;

  return (
    <div className="space-y-4">
      {listings.map((l) => (
        <ListingEditor key={l._id} listing={l} />
      ))}
    </div>
  );
}

function BookingsTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['partnerBookings'],
    queryFn: async () => (await api.get('/bookings/partner/incoming')).data.data.bookings,
  });

  const act = useMutation({
    mutationFn: async ({ id, action }) => (await api.patch(`/bookings/${id}/partner-${action}`)).data,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['partnerBookings'] });
      toast(res.message, 'success');
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  if (isLoading) return <Loader />;
  if (!bookings?.length) return <EmptyState icon={CalendarCheck} title={t('booking.noBookings')} />;

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b._id} className="card bg-base-100 shadow-md">
          <div className="card-body p-5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <strong>{b.user?.name}</strong> · {lx(b.listing?.name)}
                <div className="text-sm text-base-content/60">
                  🗓️ {fmt(b.dates.from)} → {fmt(b.dates.to)} · 👥 {b.members} · {t('listing.estimated')}: {money(b.amount)}
                </div>
                {b.note && <div className="text-sm mt-1">💬 {b.note}</div>}
                {b.user?.phone && (b.status === 'confirmed' || b.status === 'completed') && (
                  <a href={`tel:${b.user.phone}`} className="text-sm link link-primary flex items-center gap-1 mt-1 w-fit">
                    <Phone className="w-3.5 h-3.5" /> {b.user.phone}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  { requested: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info' }[b.status] || 'badge-ghost'
                }`}>
                  {t(`booking.status.${b.status}`)}
                </span>
                {b.status === 'requested' && (
                  <>
                    <button className="btn btn-success btn-xs" onClick={() => act.mutate({ id: b._id, action: 'confirm' })} disabled={act.isPending}>
                      ✓ {t('booking.confirm')}
                    </button>
                    <button className="btn btn-error btn-outline btn-xs" onClick={() => act.mutate({ id: b._id, action: 'reject' })} disabled={act.isPending}>
                      ✗ {t('booking.reject')}
                    </button>
                  </>
                )}
              </div>
            </div>
            {b.status === 'requested' && b.expiresAt && (
              <div className="text-xs text-base-content/50">
                {t('booking.expiresIn')}: {new Date(b.expiresAt).toLocaleString(locale())}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerDashboard() {
  const [tab, setTab] = useState('bookings');
  const tabs = [
    ['bookings', t('partner.tabBookings')],
    ['listings', t('partner.tabListings')],
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold mb-6">🏨 {t('partner.dashboard')}</h1>
      <div role="tablist" className="tabs tabs-boxed mb-6 w-fit">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" className={`tab ${tab === key ? 'tab-active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'bookings' ? <BookingsTab /> : <ListingsTab />}
    </div>
  );
}
