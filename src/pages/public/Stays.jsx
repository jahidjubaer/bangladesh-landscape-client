import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Users, Phone, MapPin, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';
import { useDistricts } from '../../features/districts/queries';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import CardCarousel from '../../components/ui/CardCarousel';
import FavoriteButton from '../../components/ui/FavoriteButton';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

const TYPES = ['hotel', 'houseboat', 'boat', 'chander-gari', 'other-transport', 'cottage', 'resort'];
const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;

export default function Stays() {
  const [searchParams] = useSearchParams();
  const { data: districts } = useDistricts();
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [type, setType] = useState('');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['staysBrowse', district, type],
    queryFn: async () =>
      (await api.get('/listings', { params: { district: district || undefined, type: type || undefined } })).data.data
        .listings,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('stays.listTitle')} description={t('stays.listSubtitle')} />

      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('stays.listTitle')}</h1>
            <p className="text-base-content/60">{t('stays.listSubtitle')}</p>
          </div>
          <select className="select select-bordered select-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">{t('blog.allDistricts')}</option>
            {(districts || []).map((d) => (
              <option key={d.slug} value={d.slug}>{d.name.bn}</option>
            ))}
          </select>
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className={`btn btn-sm rounded-full ${type === '' ? 'btn-primary' : 'btn-outline border-base-300'}`} onClick={() => setType('')}>
            {t('stays.allTypes')}
          </button>
          {TYPES.map((tp) => (
            <button
              key={tp}
              className={`btn btn-sm rounded-full ${type === tp ? 'btn-primary' : 'btn-outline border-base-300'}`}
              onClick={() => setType(tp)}
            >
              {t(`listingType.${tp}`)}
            </button>
          ))}
        </div>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : !listings?.length ? (
        <EmptyState icon={BedDouble} title={t('stays.noListings')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l, i) => (
            <Reveal key={l._id} delay={(i % 3) * 0.07}>
              <Link to={`/listings/${l._id}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
                <figure className="h-44 relative">
                  <CardCarousel images={l.images} alt={lx(l.name)} icon={BedDouble} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral/70 via-transparent to-transparent pointer-events-none" />
                  <FavoriteButton kind="listing" itemId={l._id} className="absolute top-3 right-3 z-20" />
                  <span className={`absolute top-3 left-3 badge badge-sm shadow gap-1 ${l.bookable ? 'badge-success' : 'badge-ghost'}`}>
                    {l.bookable ? t('stays.bookable') : (
                      <>
                        <Phone className="w-3 h-3" /> {t('stays.callOnly')}
                      </>
                    )}
                  </span>
                  <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
                    <h3 className="font-display text-lg font-bold leading-snug">{lx(l.name)}</h3>
                    <span className="text-xs opacity-80 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {lx(l.district?.name)} · {t(`listingType.${l.type}`)}
                    </span>
                  </div>
                </figure>
                <div className="card-body p-4 flex-row items-center justify-between">
                  <div>
                    <span className="font-display text-lg font-extrabold text-primary">
                      {money(l.priceRange?.min)}–{money(l.priceRange?.max)}
                    </span>
                    {l.capacity > 0 && (
                      <span className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" /> {t('district.capacity')}: {Number(l.capacity).toLocaleString(locale())}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
