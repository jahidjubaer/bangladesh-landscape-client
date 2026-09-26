import { useState, useEffect } from 'react';
import {
  useMyGuideProfile,
  useUpdateGuideProfile,
  useUpdateAvailability,
  useGuideIncoming,
  useBookingAction,
} from '../../features/guides/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString('bn-BD')}`;
const fmt = (d) => new Date(d).toLocaleDateString('bn-BD');

function BookingsTab() {
  const { data: bookings, isLoading } = useGuideIncoming();
  const action = useBookingAction();
  const [error, setError] = useState('');

  if (isLoading) return <Loader />;
  if (!bookings?.length) return <p className="text-center py-10 text-base-content/60">{t('booking.noBookings')}</p>;

  async function act(id, actionName) {
    setError('');
    try {
      await action.mutateAsync({ id, action: actionName });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="alert alert-error text-sm py-2">{error}</div>}
      {bookings.map((b) => (
        <div key={b._id} className="card bg-base-100 shadow-md">
          <div className="card-body p-5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <strong>{b.user?.name}</strong> · 👥 {b.members} জন
                <div className="text-sm text-base-content/60">
                  🗓️ {fmt(b.dates.from)} → {fmt(b.dates.to)} · {money(b.amount)}
                </div>
                {b.note && <div className="text-sm mt-1">💬 {b.note}</div>}
                {b.user?.phone && (b.status === 'confirmed' || b.status === 'completed') && (
                  <div className="text-sm mt-1">📞 {b.user.phone}</div>
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
                    <button className="btn btn-success btn-xs" onClick={() => act(b._id, 'confirm')} disabled={action.isPending}>
                      ✓ {t('booking.confirm')}
                    </button>
                    <button className="btn btn-error btn-outline btn-xs" onClick={() => act(b._id, 'reject')} disabled={action.isPending}>
                      ✗ {t('booking.reject')}
                    </button>
                  </>
                )}
              </div>
            </div>
            {b.status === 'requested' && b.expiresAt && (
              <div className="text-xs text-base-content/50">
                {t('booking.expiresIn')}: {new Date(b.expiresAt).toLocaleString('bn-BD')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AvailabilityTab({ guide }) {
  const update = useUpdateAvailability();
  const updateProfile = useUpdateGuideProfile();
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDates((guide.blockedDates || []).map((d) => new Date(d).toISOString().slice(0, 10)));
  }, [guide]);

  async function save() {
    setSaved(false);
    await update.mutateAsync(dates);
    setSaved(true);
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body space-y-4">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={guide.availabilityStatus === 'active'}
            onChange={(e) => updateProfile.mutate({ availabilityStatus: e.target.checked ? 'active' : 'on-leave' })}
          />
          <span className="font-semibold">
            {guide.availabilityStatus === 'active' ? `🟢 ${t('guide.statusActive')}` : `🔴 ${t('guide.statusLeave')}`}
          </span>
        </label>

        <div>
          <span className="font-semibold block mb-2">{t('guide.blockedDates')}</span>
          <div className="flex gap-2 mb-3">
            <input type="date" className="input input-bordered input-sm" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                if (newDate && !dates.includes(newDate)) setDates([...dates, newDate].sort());
                setNewDate('');
              }}
            >
              + {t('guide.addDate')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {dates.map((d) => (
              <span key={d} className="badge badge-lg gap-1">
                {d}
                <button className="text-error" onClick={() => setDates(dates.filter((x) => x !== d))}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-primary btn-sm" onClick={save} disabled={update.isPending}>
            {t('guide.saveDates')}
          </button>
          {saved && <span className="text-success text-sm">✓</span>}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ guide }) {
  const update = useUpdateGuideProfile();
  const [form, setForm] = useState({ bio: '', dailyRate: 0, experienceYears: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ bio: guide.bio?.bn || '', dailyRate: guide.dailyRate, experienceYears: guide.experienceYears });
  }, [guide]);

  async function save(e) {
    e.preventDefault();
    setSaved(false);
    await update.mutateAsync({ bio: { bn: form.bio }, dailyRate: form.dailyRate, experienceYears: form.experienceYears });
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="card bg-base-100 shadow-md">
      <div className="card-body space-y-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{t('guide.reviews')}</div>
            <div className="stat-value text-lg text-warning">★ {guide.ratingAvg} ({guide.ratingCount})</div>
          </div>
          <div className="stat">
            <div className="stat-title">স্ট্যাটাস</div>
            <div className="stat-value text-lg">{t(`guide.appStatus.${guide.applicationStatus}`)}</div>
          </div>
        </div>
        <label className="form-control">
          <span className="label-text font-semibold mb-1">{t('guide.bio')}</span>
          <textarea rows={3} className="textarea textarea-bordered" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('guide.dailyRate')}</span>
            <input type="number" min="0" className="input input-bordered" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('guide.expYears')}</span>
            <input type="number" min="0" className="input input-bordered" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary btn-sm" disabled={update.isPending}>
            {update.isPending ? t('admin.saving') : t('admin.save')}
          </button>
          {saved && <span className="text-success text-sm">✓</span>}
        </div>
      </div>
    </form>
  );
}

export default function GuideDashboard() {
  const [tab, setTab] = useState('bookings');
  const { data: guide, isLoading } = useMyGuideProfile(true);

  if (isLoading) return <Loader fullScreen />;
  if (!guide) return <p className="text-center py-16">{t('common.error')}</p>;

  const tabs = [
    ['bookings', t('guide.tabBookings')],
    ['availability', t('guide.tabAvailability')],
    ['profile', t('guide.tabProfile')],
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🧭 {t('guide.dashboard')}</h1>

      {guide.applicationStatus !== 'approved' ? (
        <div className="alert alert-warning">
          {t(`guide.appStatus.${guide.applicationStatus}`)}
          {guide.rejectionReason && ` — ${guide.rejectionReason}`}
        </div>
      ) : (
        <>
          <div role="tablist" className="tabs tabs-boxed mb-6 w-fit">
            {tabs.map(([key, label]) => (
              <button key={key} role="tab" className={`tab ${tab === key ? 'tab-active' : ''}`} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'availability' && <AvailabilityTab guide={guide} />}
          {tab === 'profile' && <ProfileTab guide={guide} />}
        </>
      )}
    </div>
  );
}
