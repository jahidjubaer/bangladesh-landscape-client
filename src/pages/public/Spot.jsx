import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recordView } from '../../lib/recent';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
  ArrowLeft, Bus, AlertTriangle, Construction, Ticket, Clock3, CalendarDays, Camera, Sparkles,
} from 'lucide-react';
import { useSpot } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import NotFound from '../NotFound';
import { t, lx, locale } from '../../i18n';

function AlertList({ icon: Icon, title, items, tone }) {
  if (!items?.length) return null;
  return (
    <Reveal>
      <div className={`rounded-2xl border p-6 ${tone === 'warning' ? 'border-warning/40 bg-warning/10' : 'border-base-300 bg-base-100'}`}>
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 ${tone === 'warning' ? 'text-warning' : 'text-base-content/60'}`} /> {title}
        </h3>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-base-content/80 leading-relaxed">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${tone === 'warning' ? 'bg-warning' : 'bg-base-content/40'}`} />
              {lx(item)}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Spot() {
  const { slug } = useParams();
  const { data: spot, isLoading, isError } = useSpot(slug);

  useEffect(() => {
    if (spot) recordView({ kind: 'spot', link: `/spots/${spot.slug}`, title: spot.name, image: spot.images?.[0] });
  }, [spot]);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !spot) return <NotFound />;

  const cost =
    !spot.entryCost || (spot.entryCost.min === 0 && spot.entryCost.max === 0)
      ? t('spot.free')
      : `${spot.entryCost.min}–${spot.entryCost.max} ${t('spot.taka')}`;

  const facts = [
    { Icon: Ticket, label: t('spot.entryCost'), value: cost },
    { Icon: Clock3, label: t('spot.timeNeeded'), value: `${spot.timeNeededHours} ${t('spot.hours')}` },
    { Icon: CalendarDays, label: t('spot.bestTime'), value: lx(spot.bestTime) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Seo title={lx(spot.name)} description={lx(spot.description)} image={spot.images?.[0]} />

      {/* Breadcrumb + title */}
      <Reveal>
        <Link to={`/districts/${spot.district.slug}`} className="inline-flex items-center gap-1.5 text-sm link link-primary mb-3">
          <ArrowLeft className="w-4 h-4" /> {lx(spot.district.name)} — {t('spot.backToDistrict')}
        </Link>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold flex items-center gap-3 flex-wrap mb-3">
          {lx(spot.name)}
          {spot.isHidden && <span className="badge badge-secondary">💎 {t('district.hiddenGem')}</span>}
        </h1>
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="badge badge-primary badge-outline">{t(`spot.category.${spot.category}`)}</span>
          {(spot.tags || []).map((tag) => (
            <span key={tag} className="badge badge-ghost">{t(`spot.tag.${tag}`)}</span>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        <div className="space-y-8 min-w-0">
          {/* Gallery */}
          <Reveal>
            {spot.images?.length > 0 ? (
              <Swiper
                modules={[Pagination, Navigation]}
                pagination={{ clickable: true }}
                navigation
                spaceBetween={12}
                className="rounded-2xl overflow-hidden shadow-lg [--swiper-theme-color:var(--color-primary)]"
              >
                {spot.images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <Img src={img} alt={`${lx(spot.name)} ${i + 1}`} className="w-full h-72 md:h-[26rem] object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Img alt={lx(spot.name)} icon={Camera} className="w-full h-72 rounded-2xl" />
            )}
          </Reveal>

          <Reveal>
            <p className="text-lg leading-relaxed text-base-content/85">{lx(spot.description)}</p>
          </Reveal>

          {/* How to go */}
          <Reveal>
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Bus className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                  {t('spot.howToGo')}
                </h2>
                <p className="leading-relaxed text-base-content/75 whitespace-pre-line">{lx(spot.howToGo)}</p>
              </div>
            </div>
          </Reveal>

          <AlertList icon={AlertTriangle} title={t('district.warnings')} items={spot.warnings} tone="warning" />
          <AlertList icon={Construction} title={t('spot.obstacles')} items={spot.obstacles} />

          {/* Map */}
          {spot.location?.lat != null && (
            <Reveal>
              <SpotMap center={spot.location} zoom={13} markers={[{ ...spot.location, nameBn: lx(spot.name) }]} height="320px" />
            </Reveal>
          )}
        </div>

        {/* Sticky quick facts */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Reveal delay={0.1}>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-6 gap-4">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <div>
                      <div className="text-xs text-base-content/50">{label}</div>
                      <div className="font-semibold leading-snug">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <Link
              to="/plan"
              className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg card-lift p-5 text-center block"
            >
              <Sparkles className="w-6 h-6 mx-auto mb-1.5" />
              <span className="font-bold">{t('home.ctaPlan')}</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
