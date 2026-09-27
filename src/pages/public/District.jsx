import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordView } from '../../lib/recent';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Bus, UtensilsCrossed, CalendarDays, Siren, AlertTriangle, MapPin,
  Camera, Sparkles, Phone, Users, BadgeCheck, Hospital, Flame, Hourglass,
} from 'lucide-react';
import api from '../../lib/axios';
import { useDistrict } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import WeatherStrip from '../../components/WeatherStrip';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import CardCarousel from '../../components/ui/CardCarousel';
import FavoriteButton from '../../components/ui/FavoriteButton';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import EmptyState from '../../components/ui/EmptyState';
import NotFound from '../NotFound';
import { t, lx, locale } from '../../i18n';


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

  return (
    <div>
      <Seo title={lx(district.name)} description={lx(district.overview)} image={district.heroImageUrl} />

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

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Live weather */}
        <WeatherStrip slug={slug} />

        {/* Overview + plan CTA */}
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
            <p className="text-lg leading-relaxed text-base-content/85">{lx(district.overview)}</p>
            <Link
              to="/plan"
              className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg card-lift p-6 text-center"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-lg">{t('home.ctaPlan')}</span>
              <span className="text-sm opacity-85">{lx(district.name)} — AI ট্যুর প্ল্যান</span>
            </Link>
          </div>
        </Reveal>

        {/* Spots */}
        <section>
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
          <section>
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
        <section className="grid gap-6 md:grid-cols-2">
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
          <section>
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
      </div>
    </div>
  );
}
