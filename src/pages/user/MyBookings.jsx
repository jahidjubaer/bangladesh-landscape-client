import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Tent, Users } from 'lucide-react';
import { useMyBookings, useBookingAction } from '../../features/guides/queries';
import { useMyEventBookings, useCancelEventBooking } from '../../features/events/queries';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;
const fmt = (d) => new Date(d).toLocaleDateString(locale());

function ReviewForm({ booking, onDone }) {
  const action = useBookingAction();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await action.mutateAsync({ id: booking._id, action: 'review', body: { rating, comment } });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 border-t border-base-200 pt-3">
      {error && <div className="alert alert-error text-sm py-1">{error}</div>}
      <div className="rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <input
            key={n}
            type="radio"
            name={`rating-${booking._id}`}
            className="mask mask-star-2 bg-warning"
            checked={rating === n}
            onChange={() => setRating(n)}
          />
        ))}
      </div>
      <textarea rows={2} className="textarea textarea-bordered w-full" placeholder={t('booking.reviewComment')} value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={action.isPending}>
        {t('booking.reviewSubmit')}
      </button>
    </form>
  );
}

export default function MyBookings() {
  const { data: bookings, isLoading } = useMyBookings();
  const action = useBookingAction();
  const confirm = useConfirm();
  const [reviewing, setReviewing] = useState(null);

  const canReview = (b) =>
    (b.status === 'confirmed' || b.status === 'completed') && new Date(b.dates.to) < new Date() && !b.review?.rating;

  async function handleCancel(id) {
    if (await confirm(t('booking.cancel') + '?')) action.mutate({ id, action: 'cancel' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold mb-6">{t('booking.myBookings')}</h1>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !bookings?.length ? (
        <EmptyState icon={CalendarCheck} title={t('booking.noBookings')} actionLabel={t('guide.listTitle')} actionTo="/guides" />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    {b.listing ? (
                      <strong>
                        🏨 {lx(b.listing.name)}{' '}
                        <span className="badge badge-outline badge-sm">{t(`listingType.${b.listing.type}`)}</span>
                      </strong>
                    ) : (
                      <strong>🧭 {b.guide?.user?.name}</strong>
                    )}
                    <div className="text-sm text-base-content/60">
                      🗓️ {fmt(b.dates.from)} → {fmt(b.dates.to)} · 👥 {b.members} · {money(b.amount)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${
                      { requested: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info' }[b.status] || 'badge-ghost'
                    }`}>
                      {t(`booking.status.${b.status}`)}
                    </span>
                    {b.status === 'confirmed' && b.listing?.contactPhone && (
                      <a href={`tel:${b.listing.contactPhone}`} className="btn btn-success btn-xs">
                        📞 {b.listing.contactPhone}
                      </a>
                    )}
                    {b.status === 'confirmed' && b.guide?.whatsappNumber && (
                      <a
                        href={`https://wa.me/88${b.guide.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-success btn-xs"
                      >
                        💬 {t('booking.contactWhatsApp')}
                      </a>
                    )}
                    {['requested', 'confirmed'].includes(b.status) && new Date(b.dates.from) > new Date() && (
                      <button
                        className="btn btn-error btn-outline btn-xs"
                        onClick={() => handleCancel(b._id)}
                        disabled={action.isPending}
                      >
                        {t('booking.cancel')}
                      </button>
                    )}
                    {canReview(b) && (
                      <button className="btn btn-warning btn-xs" onClick={() => setReviewing(reviewing === b._id ? null : b._id)}>
                        ⭐ {t('booking.review')}
                      </button>
                    )}
                    {b.review?.rating && <span className="text-warning text-sm">{'★'.repeat(b.review.rating)}</span>}
                  </div>
                </div>
                {reviewing === b._id && <ReviewForm booking={b} onDone={() => setReviewing(null)} />}
              </div>
            </div>
          ))}
        </div>
      )}

      <EventBookingsSection />
    </div>
  );
}

function EventBookingsSection() {
  const { data: bookings } = useMyEventBookings();
  const cancel = useCancelEventBooking();
  const confirm = useConfirm();

  if (!bookings?.length) return null;

  async function handleCancel(id) {
    if (await confirm(t('booking.cancel') + '?')) cancel.mutate(id);
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-extrabold mb-4 flex items-center gap-2">
        <Tent className="w-6 h-6 text-primary" /> {t('events.myBookings')}
      </h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="card bg-base-100 shadow-md">
            <div className="card-body p-5 flex-row items-center justify-between flex-wrap gap-3">
              <div>
                <Link to={`/events/${b.event?.slug}`} className="font-bold link link-hover">
                  {lx(b.event?.title)}
                </Link>
                <div className="text-sm text-base-content/60 flex items-center gap-2 flex-wrap mt-0.5">
                  <span>🗓️ {fmt(b.event?.dates?.start)}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {Number(b.seats).toLocaleString(locale())}</span>
                  <span>{money(b.amountTotal)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  { requested: 'badge-warning', confirmed: 'badge-success' }[b.status] || 'badge-ghost'
                }`}>
                  {t(`booking.status.${b.status}`)}
                </span>
                {['requested', 'confirmed'].includes(b.status) && new Date(b.event?.dates?.start) > new Date() && (
                  <button className="btn btn-error btn-outline btn-xs" onClick={() => handleCancel(b._id)} disabled={cancel.isPending}>
                    {t('booking.cancel')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
