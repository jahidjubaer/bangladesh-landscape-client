import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ArrowRight, Tent } from 'lucide-react';
import { useEvents } from '../../features/events/queries';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;
const fmt = (d) => new Date(d).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
const days = (e) => Math.round((new Date(e.dates.end) - new Date(e.dates.start)) / 86400000) + 1;

export function EventCard({ e }) {
  const left = e.seatsLeft ?? e.capacity;
  return (
    <Link to={`/events/${e.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
      <figure className="h-48 relative">
        <Img src={e.coverImageUrl} alt={lx(e.title)} icon={Tent} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 badge badge-accent gap-1 shadow">
          <CalendarDays className="w-3 h-3" /> {fmt(e.dates.start)} – {fmt(e.dates.end)}
        </span>
        {left <= 0 && <span className="absolute top-3 right-3 badge badge-error shadow">{t('events.soldOut')}</span>}
        <div className="absolute bottom-0 p-4 text-neutral-content">
          <h3 className="font-display text-xl font-bold leading-snug">{lx(e.title)}</h3>
          {e.district && (
            <span className="text-xs opacity-80 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {lx(e.district.name)} · {t('events.duration').replace('{n}', Number(days(e)).toLocaleString(locale()))}
            </span>
          )}
        </div>
      </figure>
      <div className="card-body p-4 flex-row items-center justify-between">
        <div>
          <span className="font-display text-xl font-extrabold text-primary">{money(e.pricePerPerson)}</span>
          <span className="text-xs text-base-content/50"> / {t('events.perPerson')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge badge-sm gap-1 ${left > 0 && left <= 5 ? 'badge-warning' : 'badge-ghost'}`}>
            <Users className="w-3 h-3" />
            {left > 0 ? t('events.seatsLeft').replace('{n}', Number(left).toLocaleString(locale())) : t('events.soldOut')}
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
      </div>
    </Link>
  );
}

export default function Events() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('events.listTitle')} description={t('events.listSubtitle')} />
      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('events.listTitle')}</h1>
        <p className="text-base-content/60 mb-10">{t('events.listSubtitle')}</p>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : !events?.length ? (
        <EmptyState icon={Tent} title={t('events.noEvents')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.slug} delay={(i % 3) * 0.08}>
              <EventCard e={e} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
