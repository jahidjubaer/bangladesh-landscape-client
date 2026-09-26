import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Bus, UtensilsCrossed, CalendarDays, Siren, AlertTriangle, MapPin,
  Camera, Sparkles, Phone, Users, BadgeCheck, Hospital, Flame,
} from 'lucide-react';
import api from '../../lib/axios';
import { useDistrict } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import NotFound from '../NotFound';
import { t } from '../../i18n';

const LISTING_TYPE_BN = {
  hotel: 'হোটেল', houseboat: 'হাউসবোট', boat: 'বোট', 'chander-gari': 'চান্দের গাড়ি',
  'other-transport': 'অন্য পরিবহন', cottage: 'কটেজ', resort: 'রিসোর্ট',
};

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
          <Img src={s.images?.[0]} alt={s.name.bn} icon={Camera} className="w-full h-full object-cover" />
          {s.isHidden && (
            <span className="absolute top-3 left-3 badge badge-secondary badge-sm shadow">💎 {t('district.hiddenGem')}</span>
          )}
        </figure>
        <div className="card-body p-5">
          <h3 className="card-title text-base">{s.name.bn}</h3>
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

  if (isLoading) return <Loader fullScreen />;
  if (isError || !data) return <NotFound />;

  const { district, spots } = data;

  return (
    <div>
      <Seo title={district.name.bn} description={district.overview?.bn} image={district.heroImageUrl} />

      {/* Parallax hero */}
      <section className="relative h-[52vh] min-h-80 overflow-hidden flex items-end">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          {district.heroImageUrl ? (
            <Img src={district.heroImageUrl} alt={district.name.bn} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0a2622] via-primary to-secondary" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/85 via-neutral/25 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 pb-10 w-full text-neutral-content">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge badge-accent gap-1 mb-3">
              <MapPin className="w-3.5 h-3.5" /> {district.division}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold">{district.name.bn}</h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Overview + plan CTA */}
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
            <p className="text-lg leading-relaxed text-base-content/85">{district.overview?.bn}</p>
            <Link
              to="/plan"
              className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg card-lift p-6 text-center"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-lg">{t('home.ctaPlan')}</span>
              <span className="text-sm opacity-85">{district.name.bn} — AI ট্যুর প্ল্যান</span>
            </Link>
          </div>
        </Reveal>

        {/* Spots */}
        <section>
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.spots')}</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s, i) => (
              <SpotCard key={s.slug} s={s} delay={(i % 3) * 0.08} />
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('district.mapTitle')}</h2>
            <SpotMap
              center={district.mapCenter}
              zoom={district.zoom}
              markers={spots.map((s) => ({ lat: s.location?.lat, lng: s.location?.lng, nameBn: s.name.bn, slug: s.slug }))}
            />
          </Reveal>
        </section>

        {/* Info cards */}
        <section className="grid gap-6 md:grid-cols-2">
          <Reveal><InfoCard icon={Bus} title={t('district.transport')}>{district.transportInfo?.bn}</InfoCard></Reveal>
          <Reveal delay={0.08}><InfoCard icon={UtensilsCrossed} title={t('district.food')}>{district.foodInfo?.bn}</InfoCard></Reveal>
          <Reveal><InfoCard icon={CalendarDays} title={t('district.bestSeason')}>{district.bestSeason?.bn}</InfoCard></Reveal>
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
                        <Img src={l.images[0]} alt={l.name.bn} className="w-full h-full object-cover" />
                      </figure>
                    )}
                    <div className="card-body p-5">
                      <h3 className="card-title text-base">
                        {l.name.bn}
                        <span className="badge badge-outline badge-sm">{LISTING_TYPE_BN[l.type]}</span>
                      </h3>
                      {l.description?.bn && <p className="text-sm text-base-content/65 line-clamp-2">{l.description.bn}</p>}
                      <div className="text-sm space-y-1.5 mt-1">
                        {l.priceRange?.max > 0 && (
                          <div className="font-semibold text-primary">
                            ৳{l.priceRange.min.toLocaleString('bn-BD')}–{l.priceRange.max.toLocaleString('bn-BD')}
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
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-1.5" /> {w.bn}
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
