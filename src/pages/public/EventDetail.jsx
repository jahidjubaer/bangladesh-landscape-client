import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, MapPin, Users, Tent, ListChecks, PackageCheck, Flag, Minus, Plus,
} from 'lucide-react';
import { useEvent, useBookEvent } from '../../features/events/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo, { absUrl } from '../../components/Seo';
import NotFound from '../NotFound';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;
const fmt = (d) => new Date(d).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' });

function ListSection({ icon: Icon, title, items }) {
  if (!items?.length) return null;
  return (
    <Reveal>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </span>
            {title}
          </h2>
          <ul className="space-y-2 mt-1">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-base-content/80 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {lx(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: event, isLoading, isError } = useEvent(slug);
  const book = useBookEvent();
  const [seats, setSeats] = useState(2);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !event) return <NotFound />;

  const left = event.seatsLeft ?? 0;
  const open = event.status === 'published' && new Date(event.dates.start) > new Date() && left > 0;

  async function handleBook(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await book.mutateAsync({ slug, seats: Number(seats), note });
      setMessage({ type: 'success', text: t('events.requested') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Seo
        title={lx(event.title)}
        description={lx(event.description)}
        image={event.coverImageUrl}
        type="article"
        jsonLd={{
          '@type': 'Event',
          name: lx(event.title),
          description: lx(event.description)?.slice(0, 300),
          ...(event.coverImageUrl && { image: absUrl(event.coverImageUrl) }),
          startDate: event.dates?.start,
          endDate: event.dates?.end,
          eventStatus:
            event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: lx(event.district?.name) || 'Bangladesh',
            address: { '@type': 'PostalAddress', addressCountry: 'BD' },
          },
          organizer: { '@type': 'Organization', name: 'বাংলাদেশ ল্যান্ডস্কেপ', url: window.location.origin },
          offers: {
            '@type': 'Offer',
            price: event.pricePerPerson,
            priceCurrency: 'BDT',
            availability: open ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: window.location.origin + `/events/${event.slug}`,
          },
        }}
      />

      <Reveal>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm link link-primary mb-3">
          <ArrowLeft className="w-4 h-4" /> {t('events.listTitle')}
        </Link>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-4">{lx(event.title)}</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="badge badge-accent gap-1.5 py-3">
            <CalendarDays className="w-3.5 h-3.5" /> {fmt(event.dates.start)} – {fmt(event.dates.end)}
          </span>
          {event.district && (
            <Link to={`/districts/${event.district.slug}`} className="badge badge-primary badge-outline gap-1.5 py-3">
              <MapPin className="w-3.5 h-3.5" /> {lx(event.district.name)}
            </Link>
          )}
          <span className={`badge gap-1.5 py-3 ${left > 0 ? 'badge-ghost' : 'badge-error'}`}>
            <Users className="w-3.5 h-3.5" />
            {left > 0 ? t('events.seatsLeft').replace('{n}', Number(left).toLocaleString(locale())) : t('events.soldOut')}
          </span>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        <div className="space-y-8 min-w-0">
          <Reveal>
            <Img src={event.coverImageUrl} alt={lx(event.title)} icon={Tent} className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg" />
          </Reveal>
          {lx(event.description) && (
            <Reveal>
              <p className="text-lg leading-relaxed text-base-content/85">{lx(event.description)}</p>
            </Reveal>
          )}
          <ListSection icon={ListChecks} title={t('events.itinerary')} items={event.itinerary} />
          <ListSection icon={PackageCheck} title={t('events.included')} items={event.included} />
          {lx(event.meetingPoint) && (
            <Reveal>
              <div className="alert bg-info/10 border-info/30">
                <Flag className="w-5 h-5 text-info" />
                <span><strong>{t('events.meetingPoint')}:</strong> {lx(event.meetingPoint)}</span>
              </div>
            </Reveal>
          )}
        </div>

        {/* Booking box */}
        <div className="lg:sticky lg:top-24">
          <Reveal delay={0.1}>
            <div className="card bg-base-100 shadow-xl border border-primary/30">
              <div className="card-body">
                <div>
                  <span className="font-display text-3xl font-extrabold text-primary">{money(event.pricePerPerson)}</span>
                  <span className="text-sm text-base-content/50"> / {t('events.perPerson')}</span>
                </div>

                {message && <div className={`alert alert-${message.type} text-sm py-2`}>{message.text}</div>}

                {!open ? (
                  <div className="alert alert-warning text-sm py-2 mt-2">
                    {left <= 0 ? t('events.soldOut') : t('events.bookingClosed')}
                  </div>
                ) : !user ? (
                  <Link to="/login" state={{ from: `/events/${slug}` }} className="btn btn-primary rounded-full mt-2">
                    {t('booking.loginToBook')}
                  </Link>
                ) : message?.type === 'success' ? null : (
                  <form onSubmit={handleBook} className="space-y-4 mt-2">
                    <div>
                      <span className="label-text font-semibold block mb-2">{t('events.seats')}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" className="btn btn-circle btn-sm btn-outline" onClick={() => setSeats(Math.max(1, seats - 1))}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-display text-2xl font-extrabold w-10 text-center">{Number(seats).toLocaleString(locale())}</span>
                        <button type="button" className="btn btn-circle btn-sm btn-outline" onClick={() => setSeats(Math.min(Math.min(20, left), seats + 1))}>
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <label className="form-control">
                      <span className="label-text mb-1">{t('events.note')}</span>
                      <textarea rows={2} className="textarea textarea-bordered textarea-sm" value={note} onChange={(e) => setNote(e.target.value)} />
                    </label>
                    <div className="flex justify-between items-center py-2 border-t border-base-200">
                      <span className="text-base-content/60">{t('events.total')}</span>
                      <span className="font-display text-xl font-extrabold">{money(event.pricePerPerson * seats)}</span>
                    </div>
                    <button type="submit" className="btn btn-primary w-full rounded-full shadow-lg shadow-primary/25" disabled={book.isPending}>
                      {book.isPending ? t('events.booking') : t('events.bookBtn')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
