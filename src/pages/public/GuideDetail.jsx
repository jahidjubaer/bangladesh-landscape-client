import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, MapPin, MessageSquareText, Compass, CalendarDays, Users } from 'lucide-react';
import { useGuide, useCreateBooking } from '../../features/guides/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import StarRating from '../../components/ui/StarRating';
import Reveal from '../../components/ui/Reveal';
import Seo from '../../components/Seo';
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
      <Seo title={guide.user?.name} description={guide.bio?.bn} image={guide.photoUrl} />
      <div className="space-y-6 min-w-0">
        {/* Profile header */}
        <Reveal>
          <div className="card bg-base-100 shadow-md overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-secondary to-primary/70" />
            <div className="card-body pt-0">
              <div className="flex items-end gap-4 -mt-10">
                <div className="avatar placeholder">
                  {guide.photoUrl ? (
                    <div className="w-24 rounded-2xl ring-4 ring-base-100 shadow-lg"><img src={guide.photoUrl} alt={guide.user?.name} /></div>
                  ) : (
                    <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl w-24 text-4xl ring-4 ring-base-100 shadow-lg">
                      <span>{guide.user?.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                    {guide.user?.name} <BadgeCheck className="w-6 h-6 text-primary" />
                  </h1>
                  <StarRating value={guide.ratingAvg} count={guide.ratingCount} size={18} />
                </div>
              </div>
              <div className="text-sm text-base-content/65 mt-2">
                {t('guide.experience')}: {Number(guide.experienceYears).toLocaleString('bn-BD')} {t('guide.years')} ·{' '}
                {(guide.languages || []).map((l) => t(`guide.lang.${l}`)).join(', ')}
              </div>
              {guide.bio?.bn && <p className="mt-2 leading-relaxed text-base-content/80">{guide.bio.bn}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(guide.districts || []).map((d) => (
                  <Link key={d.slug} to={`/districts/${d.slug}`} className="badge badge-primary badge-outline gap-1">
                    <MapPin className="w-3 h-3" /> {d.name?.bn}
                  </Link>
                ))}
              </div>
              {guide.knownSpots?.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold">{t('guide.knownSpots')}: </span>
                  <span className="text-base-content/65">{guide.knownSpots.map((s) => s.name?.bn).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Reviews */}
        <Reveal>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title gap-2">
                <MessageSquareText className="w-5 h-5 text-primary" /> {t('guide.reviews')}
              </h2>
              {!reviews?.length ? (
                <p className="text-base-content/55">{t('guide.noReviews')}</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r._id} className="rounded-2xl bg-base-200 p-4">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                            {r.user?.name?.charAt(0)}
                          </span>
                          {r.user?.name}
                        </strong>
                        <StarRating value={r.review.rating} size={14} />
                      </div>
                      {r.review.comment && <p className="text-sm text-base-content/75 leading-relaxed">{r.review.comment}</p>}
                      <span className="text-xs text-base-content/45">{new Date(r.review.at).toLocaleDateString('bn-BD')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Booking box */}
      <div className="card bg-base-100 shadow-xl border border-primary/30 h-fit lg:sticky lg:top-24">
        <div className="card-body">
          <h2 className="card-title gap-2">
            <Compass className="w-5 h-5 text-primary" /> {t('booking.bookGuide')}
          </h2>
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
