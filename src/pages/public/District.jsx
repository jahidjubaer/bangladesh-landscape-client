import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordView } from '../../lib/recent';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Bus, UtensilsCrossed, CalendarDays, Siren, AlertTriangle, MapPin, Info,
  Camera, Sparkles, Phone, Users, BadgeCheck, Hospital, Flame, Hourglass, BedDouble,
} from 'lucide-react';
import api from '../../lib/axios';
import { useDistrict, useDistricts } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import WeatherStrip from '../../components/WeatherStrip';
import Seo, { absUrl } from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import CardCarousel from '../../components/ui/CardCarousel';
import FavoriteButton from '../../components/ui/FavoriteButton';
import StarRating from '../../components/ui/StarRating';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import EmptyState from '../../components/ui/EmptyState';
import NotFound from '../NotFound';
import { t, lx, locale } from '../../i18n';


// Lonely Planet-style guide tabs: sticky, tracks the visible section
function SectionNav({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-16 z-30 bg-base-200/90 backdrop-blur-md border-b border-base-300/60">
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              active === id
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/60 hover:text-base-content'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickFacts({ district, spotCount }) {
  const stayTypes = (district.stayTypesAvailable || []).filter(Boolean);
  const rows = [
    { Icon: MapPin, label: t('district.division'), value: t(`district.divisions.${district.division}`) || district.division },
    { Icon: Camera, label: t('district.spots'), value: Number(spotCount).toLocaleString(locale()) },
    stayTypes.length > 0 && { Icon: BedDouble, label: t('district.stayTypes'), value: stayTypes.join(' · ') },
  ].filter(Boolean);

  return (
    <div className="card bg-base-100 shadow-md p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" /> {t('district.quickFacts')}
      </h3>
      <ul className="space-y-3 text-sm">
        {rows.map(({ Icon, label, value }) => (
          <li key={label} className="flex gap-2.5">
            <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              <span className="text-base-content/55">{label}:</span>{' '}
              <span className="font-medium">{value}</span>
            </span>
          </li>
        ))}
        <li className="pt-1">
          <VerifiedBadge verified={district.isVerified} />
        </li>
      </ul>
    </div>
  );
}

function NearbyDistricts({ division, currentSlug }) {
  const { data: districts } = useDistricts();
  const others = (districts || []).filter((d) => d.division === division && d.slug !== currentSlug).slice(0, 4);
  if (!others.length) return null;

  return (
    <section>
      <Reveal>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.nearby')}</h2>
      </Reveal>
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {others.map((d, i) => (
          <Reveal key={d.slug} delay={i * 0.06}>
            <Link to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
              <figure className="h-32 relative">
                <Img src={d.heroImageUrl} alt={lx(d.name)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 p-3 text-neutral-content pointer-events-none">
                  <h3 className="font-display font-bold leading-tight">{lx(d.name)}</h3>
                </div>
              </figure>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="card bg-base-100 shadow-md h-full">
      <div className="card-body">
        <h2 className="card-title text-lg gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </span>
          {title}
        </h2>
        <div className="text-base-content/75 leading-relaxed whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
}

function SpotCard({ s, delay }) {
  return (
    <Reveal delay={delay}>
      <Link to={`/spots/${s.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
        <figure className="h-44 relative">
          <CardCarousel images={s.images} alt={lx(s.name)} icon={Camera} className="w-full h-full" />
          {s.isHidden && (
            <span className="absolute top-3 left-3 badge badge-secondary badge-sm shadow">💎 {t('district.hiddenGem')}</span>
          )}
          <FavoriteButton kind="spot" itemId={s._id} className="absolute top-3 right-3 z-20" />
        </figure>
        <div className="card-body p-5">
          <h3 className="card-title text-base">{lx(s.name)}</h3>
          {s.ratingCount > 0 && <StarRating value={s.ratingAvg} count={s.ratingCount} size={13} />}
          <div className="flex flex-wrap gap-1">
            <span className="badge badge-outline badge-sm">{t(`spot.category.${s.category}`)}</span>
            {(s.tags || []).map((tag) => (
              <span key={tag} className="badge badge-ghost badge-sm">{t(`spot.tag.${tag}`)}</span>
            ))}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function District() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useDistrict(slug);
  const { data: listings } = useQuery({
    queryKey: ['listings', slug],
    queryFn: async () => (await api.get(`/districts/${slug}/listings`)).data.data.listings,
    enabled: Boolean(slug),
  });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 140]);

  useEffect(() => {
    const d = data?.district;
    if (d) recordView({ kind: 'district', link: `/districts/${d.slug}`, title: d.name, image: d.heroImageUrl });
  }, [data]);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !data) return <NotFound />;

  const { district, spots } = data;

  const sections = [
    { id: 'overview', label: t('district.overviewTitle') },
    spots.length > 0 && { id: 'spots', label: t('district.spots') },
    spots.length > 0 && { id: 'map', label: t('district.mapTitle') },
    { id: 'info', label: t('district.infoTitle') },
    listings?.length > 0 && { id: 'stays', label: t('nav.stays') },
  ].filter(Boolean);

  return (
    <div>
      <Seo
        title={lx(district.name)}
        description={lx(district.overview)}
        image={district.heroImageUrl}
        type="article"
        jsonLd={{
          '@type': 'TouristDestination',
          name: lx(district.name),
          description: lx(district.overview)?.slice(0, 300),
          ...(district.heroImageUrl && { image: absUrl(district.heroImageUrl) }),
          ...(district.mapCenter?.lat != null && {
            geo: { '@type': 'GeoCoordinates', latitude: district.mapCenter.lat, longitude: district.mapCenter.lng },
          }),
          address: { '@type': 'PostalAddress', addressRegion: district.division, addressCountry: 'BD' },
        }}
      />

      {/* Parallax hero */}
      <section className="relative h-[52vh] min-h-80 overflow-hidden flex items-end">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          {district.heroImageUrl ? (
            <Img src={district.heroImageUrl} alt={lx(district.name)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0a2622] via-primary to-secondary" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/85 via-neutral/25 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 pb-10 w-full text-neutral-content">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-accent gap-1">
                <MapPin className="w-3.5 h-3.5" /> {t(`district.divisions.${district.division}`) || district.division}
              </span>
              <VerifiedBadge verified={district.isVerified} />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold">{lx(district.name)}</h1>
          </motion.div>
        </div>
      </section>

      <SectionNav sections={sections} />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Live weather */}
        <WeatherStrip slug={slug} />

        {/* Overview + quick facts + plan CTA */}
        <section id="overview" className="scroll-mt-36">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
              <p className="text-lg leading-relaxed text-base-content/85">{lx(district.overview)}</p>
              <div className="space-y-4">
                <QuickFacts district={district} spotCount={spots.length} />
                <Link
                  to="/plan"
                  className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg card-lift p-6 text-center"
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-bold text-lg">{t('home.ctaPlan')}</span>
                  <span className="text-sm opacity-85">{lx(district.name)} — AI ট্যুর প্ল্যান</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Spots */}
        <section id="spots" className="scroll-mt-36">
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.spots')}</h2>
          </Reveal>
          {spots.length === 0 ? (
            <EmptyState icon={Camera} title={t('district.contentComing')} description={t('district.noSpotsYet')} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((s, i) => (
                <SpotCard key={s.slug} s={s} delay={(i % 3) * 0.08} />
              ))}
            </div>
          )}
        </section>

        {/* Map */}
        {spots.length > 0 && (
          <section id="map" className="scroll-mt-36">
            <Reveal>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.mapTitle')}</h2>
              <SpotMap
                center={district.mapCenter}
                zoom={district.zoom}
                markers={spots.map((s) => ({ lat: s.location?.lat, lng: s.location?.lng, nameBn: lx(s.name), slug: s.slug }))}
              />
            </Reveal>
          </section>
        )}

        {/* Info cards (only those with content) */}
        <section id="info" className="scroll-mt-36 grid gap-6 md:grid-cols-2">
          {lx(district.transportInfo) && (
            <Reveal><InfoCard icon={Bus} title={t('district.transport')}>{lx(district.transportInfo)}</InfoCard></Reveal>
          )}
          {lx(district.foodInfo) && (
            <Reveal delay={0.08}><InfoCard icon={UtensilsCrossed} title={t('district.food')}>{lx(district.foodInfo)}</InfoCard></Reveal>
          )}
          {lx(district.bestSeason) && (
            <Reveal><InfoCard icon={CalendarDays} title={t('district.bestSeason')}>{lx(district.bestSeason)}</InfoCard></Reveal>
          )}
          <Reveal delay={0.08}>
            <div className="card bg-base-100 shadow-md h-full">
              <div className="card-body">
                <h2 className="card-title text-lg gap-3">
                  <span className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                    <Siren className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                  {t('district.emergency')}
                </h2>
                <ul className="text-base-content/75 space-y-2 mt-1">
                  {district.emergency?.police && (
                    <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-error shrink-0" /><strong>{t('district.police')}:</strong> {district.emergency.police}</li>
                  )}
                  {district.emergency?.hospital && (
                    <li className="flex items-center gap-2"><Hospital className="w-4 h-4 text-error shrink-0" /><strong>{t('district.hospital')}:</strong> {district.emergency.hospital}</li>
                  )}
                  {district.emergency?.fireService && (
                    <li className="flex items-center gap-2"><Flame className="w-4 h-4 text-error shrink-0" /><strong>{t('district.fireService')}:</strong> {district.emergency.fireService}</li>
                  )}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Booking coming soon (no feature flags enabled yet) */}
        {!Object.values(district.features || {}).some(Boolean) && (
          <Reveal>
            <div className="alert bg-secondary/10 border-secondary/30">
              <Hourglass className="w-5 h-5 text-secondary" />
              <span>{t('district.bookingComingSoon')}</span>
            </div>
          </Reveal>
        )}

        {/* Verified stay/transport listings */}
        {listings?.length > 0 && (
          <section id="stays" className="scroll-mt-36">
            <Reveal>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.stayTransport')}</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l, i) => (
                <Reveal key={l._id} delay={(i % 3) * 0.08}>
                  <div className="card bg-base-100 shadow-md card-lift h-full">
                    {l.images?.[0] && (
                      <figure className="h-36 img-zoom">
                        <Img src={l.images[0]} alt={lx(l.name)} className="w-full h-full object-cover" />
                      </figure>
                    )}
                    <div className="card-body p-5">
                      <h3 className="card-title text-base">
                        {lx(l.name)}
                        <span className="badge badge-outline badge-sm">{t(`listingType.${l.type}`)}</span>
                      </h3>
                      {lx(l.description) && <p className="text-sm text-base-content/65 line-clamp-2">{lx(l.description)}</p>}
                      <div className="text-sm space-y-1.5 mt-1">
                        {l.priceRange?.max > 0 && (
                          <div className="font-semibold text-primary">
                            ৳{l.priceRange.min.toLocaleString(locale())}–{l.priceRange.max.toLocaleString(locale())}
                          </div>
                        )}
                        {l.capacity > 0 && (
                          <div className="flex items-center gap-1.5 text-base-content/70">
                            <Users className="w-4 h-4" /> {t('district.capacity')}: {l.capacity}
                          </div>
                        )}
                        {l.contactPhone && (
                          <a className="flex items-center gap-1.5 link link-primary" href={`tel:${l.contactPhone}`}>
                            <Phone className="w-4 h-4" /> {l.contactPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Warnings */}
        {district.warnings?.length > 0 && (
          <Reveal>
            <section className="rounded-2xl border border-warning/40 bg-warning/10 p-6 md:p-8">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4 text-warning-content/90">
                <span className="w-10 h-10 rounded-xl bg-warning/25 text-warning flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <span className="text-base-content">{t('district.warnings')}</span>
              </h2>
              <ul className="space-y-2.5">
                {district.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2.5 text-base-content/80 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-1.5" /> {lx(w)}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {/* More from this division */}
        <NearbyDistricts division={district.division} currentSlug={district.slug} />
      </div>
    </div>
  );
}
