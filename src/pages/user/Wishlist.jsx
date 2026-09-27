import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Map as MapIcon, Camera, BedDouble, MapPin, Compass } from 'lucide-react';
import api from '../../lib/axios';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import CardCarousel from '../../components/ui/CardCarousel';
import FavoriteButton from '../../components/ui/FavoriteButton';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { t, lx, locale } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;

function Section({ title, icon: Icon, children }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" /> {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </section>
  );
}

export default function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await api.get('/favorites')).data.data,
  });

  const districts = data?.districts || [];
  const spots = data?.spots || [];
  const listings = data?.listings || [];
  const empty = !isLoading && !districts.length && !spots.length && !listings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('wishlist.title')} description={t('wishlist.subtitle')} />

      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" /> {t('wishlist.title')}
        </h1>
        <p className="text-base-content/60 mb-10">{t('wishlist.subtitle')}</p>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={4} cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      ) : empty ? (
        <div className="text-center py-20">
          <Heart className="w-14 h-14 mx-auto mb-4 text-base-content/20" strokeWidth={1.2} />
          <h2 className="font-bold text-lg mb-1">{t('wishlist.empty')}</h2>
          <p className="text-base-content/55 mb-6">{t('wishlist.emptyDesc')}</p>
          <Link to="/explore" className="btn btn-primary rounded-full px-8 gap-2">
            <Compass className="w-4 h-4" /> {t('wishlist.browse')}
          </Link>
        </div>
      ) : (
        <div className="space-y-14">
          {districts.length > 0 && (
            <Section title={t('search.groups.districts')} icon={MapIcon}>
              {districts.map((d) => (
                <Link key={d._id} to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
                  <figure className="h-44 relative">
                    <CardCarousel images={[d.heroImageUrl]} alt={lx(d.name)} icon={MapIcon} className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral/75 via-transparent to-transparent pointer-events-none" />
                    <FavoriteButton kind="district" itemId={d._id} className="absolute top-3 right-3 z-20" />
                    <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
                      <h3 className="font-display text-lg font-bold">{lx(d.name)}</h3>
                      <span className="text-xs opacity-80 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t(`district.divisions.${d.division}`) || d.division}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <VerifiedBadge verified={d.isVerified} />
                    </div>
                  </figure>
                </Link>
              ))}
            </Section>
          )}

          {spots.length > 0 && (
            <Section title={t('search.groups.spots')} icon={Camera}>
              {spots.map((s) => (
                <Link key={s._id} to={`/spots/${s.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
                  <figure className="h-44 relative">
                    <CardCarousel images={s.images} alt={lx(s.name)} icon={Camera} className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral/70 via-transparent to-transparent pointer-events-none" />
                    <FavoriteButton kind="spot" itemId={s._id} className="absolute top-3 right-3 z-20" />
                    <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
                      <h3 className="font-bold leading-snug">{lx(s.name)}</h3>
                      <span className="text-xs opacity-85 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {lx(s.district?.name)}
                      </span>
                    </div>
                  </figure>
                </Link>
              ))}
            </Section>
          )}

          {listings.length > 0 && (
            <Section title={t('search.groups.listings')} icon={BedDouble}>
              {listings.map((l) => (
                <Link key={l._id} to={`/listings/${l._id}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
                  <figure className="h-44 relative">
                    <CardCarousel images={l.images} alt={lx(l.name)} icon={BedDouble} className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral/70 via-transparent to-transparent pointer-events-none" />
                    <FavoriteButton kind="listing" itemId={l._id} className="absolute top-3 right-3 z-20" />
                    <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
                      <h3 className="font-bold leading-snug">{lx(l.name)}</h3>
                      <span className="text-xs opacity-85 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {lx(l.district?.name)} · {t(`listingType.${l.type}`)}
                      </span>
                    </div>
                  </figure>
                  <div className="card-body p-3">
                    <span className="font-display font-extrabold text-primary">
                      {money(l.priceRange?.min)}–{money(l.priceRange?.max)}
                    </span>
                  </div>
                </Link>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
