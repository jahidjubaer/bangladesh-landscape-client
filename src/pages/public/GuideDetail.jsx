import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGuide, useCreateBooking } from '../../features/guides/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import NotFound from '../NotFound';
import { t } from '../../i18n';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function GuideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, isError } = useGuide(id);
  const createBooking = useCreateBooking();
  const [form, setForm] = useState({ from: '', to: '', members: 2, note: '' });
  const [message, setMessage] = useState(null); // { type, text }

  if (isLoading) return <Loader fullScreen />;
  if (isError || !data) return <NotFound />;

  const { guide, reviews } = data;

  const days =
    form.from && form.to && new Date(form.to) >= new Date(form.from)
      ? Math.round((new Date(form.to) - new Date(form.from)) / DAY_MS) + 1
      : 0;
  const estimate = days * (guide.dailyRate || 0);

  async function handleBook(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await createBooking.mutateAsync({ guideId: guide.id, ...form, members: Number(form.members) });
      setMessage({ type: 'success', text: t('booking.requested') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Profile header */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="avatar placeholder">
                {guide.photoUrl ? (
                  <div className="w-20 rounded-full"><img src={guide.photoUrl} alt={guide.user?.name} /></div>
                ) : (
                  <div className="bg-primary text-primary-content rounded-full w-20 text-3xl"><span>{guide.user?.name?.charAt(0)}</span></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {guide.user?.name} <span className="badge badge-success badge-sm">✓ ভেরিফাইড</span>
                </h1>
                <div className="text-warning">
                  {'★'.repeat(Math.round(guide.ratingAvg))}{'☆'.repeat(5 - Math.round(guide.ratingAvg))}{' '}
                  <span className="text-base-content/60 text-sm">({guide.ratingCount} {t('guide.reviews')})</span>
                </div>
                <div className="text-sm text-base-content/70">
                  {t('guide.experience')}: {guide.experienceYears} {t('guide.years')} ·{' '}
                  {(guide.languages || []).map((l) => t(`guide.lang.${l}`)).join(', ')}
                </div>
              </div>
            </div>
            {guide.bio?.bn && <p className="mt-3 leading-relaxed text-base-content/85">{guide.bio.bn}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {(guide.districts || []).map((d) => (
                <Link key={d.slug} to={`/districts/${d.slug}`} className="badge badge-primary badge-outline">📍 {d.name?.bn}</Link>
              ))}
            </div>
            {guide.knownSpots?.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-semibold">{t('guide.knownSpots')}: </span>
                {guide.knownSpots.map((s, i) => (
                  <span key={s.slug} className="text-sm text-base-content/70">
                    {i > 0 && ', '}{s.name?.bn}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">⭐ {t('guide.reviews')}</h2>
            {!reviews?.length ? (
              <p className="text-base-content/60">{t('guide.noReviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-base-200 pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <strong>{r.user?.name}</strong>
                      <span className="text-warning">{'★'.repeat(r.review.rating)}</span>
                    </div>
                    {r.review.comment && <p className="text-sm text-base-content/75">{r.review.comment}</p>}
                    <span className="text-xs text-base-content/50">{new Date(r.review.at).toLocaleDateString('bn-BD')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking box */}
      <div className="card bg-base-100 shadow-lg border-2 border-primary h-fit sticky top-20">
        <div className="card-body">
          <h2 className="card-title">🧭 {t('booking.bookGuide')}</h2>
          <div className="text-2xl font-bold text-primary">
            ৳{guide.dailyRate?.toLocaleString('bn-BD')} <span className="text-sm font-normal text-base-content/60">/ {t('guide.perDay')}</span>
          </div>

          {message && <div className={`alert alert-${message.type} text-sm py-2`}>{message.text}</div>}

          {!user ? (
            <Link to="/login" state={{ from: `/guides/${id}` }} className="btn btn-primary">
              {t('booking.loginToBook')}
            </Link>
          ) : (
            <form onSubmit={handleBook} className="space-y-3">
              <label className="form-control">
                <span className="label-text mb-1">{t('booking.from')}</span>
                <input type="date" required className="input input-bordered input-sm" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text mb-1">{t('booking.to')}</span>
                <input type="date" required className="input input-bordered input-sm" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text mb-1">{t('booking.members')}</span>
                <input type="number" min="1" className="input input-bordered input-sm" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} />
              </label>
              <label className="form-control">
                <span className="label-text mb-1">{t('booking.note')}</span>
                <textarea rows={2} className="textarea textarea-bordered textarea-sm" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </label>
              {days > 0 && (
                <div className="alert py-2 text-sm">
                  {t('booking.estimated')}: <strong>৳{estimate.toLocaleString('bn-BD')}</strong> ({days} দিন)
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={createBooking.isPending}>
                {createBooking.isPending ? t('booking.requesting') : t('booking.request')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
