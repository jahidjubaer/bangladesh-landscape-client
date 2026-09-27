import { lazy, Suspense, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Camera, MapPin, Compass, List, Map as MapIcon } from 'lucide-react';
import api from '../../lib/axios';
import { CATEGORIES } from '../../lib/categories';
import Loader from '../../components/Loader';

// Leaflet is heavy — pull the map chunk only when someone switches views
const ExploreMap = lazy(() => import('../../components/ExploreMap'));
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import CardCarousel from '../../components/ui/CardCarousel';
import FavoriteButton from '../../components/ui/FavoriteButton';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { t, lx, locale } from '../../i18n';

function SpotCard({ s }) {
  return (
    <Link to={`/spots/${s.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
      <figure className="h-44 relative">
        <CardCarousel images={s.images} alt={lx(s.name)} icon={Camera} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/70 via-transparent to-transparent pointer-events-none" />
        {s.isHidden && (
          <span className="absolute top-3 left-3 badge badge-secondary badge-sm shadow">💎 {t('district.hiddenGem')}</span>
        )}
        <FavoriteButton kind="spot" itemId={s._id} className="absolute top-3 right-3 z-20" />
        <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
          <h2 className="font-bold text-lg leading-snug">{lx(s.name)}</h2>
          <span className="text-xs opacity-85 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {lx(s.district?.name)}
          </span>
        </div>
      </figure>
      <div className="card-body p-3 flex-row items-center justify-between">
        <span className="badge badge-outline badge-sm">{t(`spot.category.${s.category}`)}</span>
        {(s.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} className="badge badge-ghost badge-sm">{t(`spot.tag.${tag}`)}</span>
        ))}
      </div>
    </Link>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || '';
  const [view, setView] = useState('list');

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['explore', cat],
    queryFn: async ({ pageParam = 1 }) =>
      (await api.get('/spots', { params: { category: cat || undefined, page: pageParam } })).data.data,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    enabled: view === 'list',
  });

  // Map view wants every matching spot at once
  const { data: mapSpots, isLoading: mapLoading } = useQuery({
    queryKey: ['exploreMap', cat],
    queryFn: async () =>
      (await api.get('/spots', { params: { category: cat || undefined, all: 1 } })).data.data.spots,
    staleTime: 5 * 60 * 1000,
    enabled: view === 'map',
  });

  const spots = (data?.pages || []).flatMap((p) => p.spots);

  function pick(key) {
    setParams(key ? { cat: key } : {}, { preventScrollReset: true });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Seo title={t('explore.title')} description={t('explore.subtitle')} />

      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('explore.title')}</h1>
        <p className="text-base-content/60 mb-6">{t('explore.subtitle')}</p>
      </Reveal>

      {/* Category chip bar + view toggle — sticky under the navbar */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-base-200/90 backdrop-blur-md mb-8">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 grow">
            <button
              onClick={() => pick('')}
              className={`btn btn-sm rounded-full gap-1.5 shrink-0 ${!cat ? 'btn-primary' : 'btn-ghost bg-base-100 shadow-sm'}`}
            >
              <Compass className="w-4 h-4" /> {t('explore.all')}
            </button>
            {CATEGORIES.map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => pick(key)}
                className={`btn btn-sm rounded-full gap-1.5 shrink-0 ${cat === key ? 'btn-primary' : 'btn-ghost bg-base-100 shadow-sm'}`}
              >
                <Icon className="w-4 h-4" /> {t(`spot.category.${key}`)}
              </button>
            ))}
          </div>

          {/* list ↔ map */}
          <div className="join shrink-0 shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`btn btn-sm join-item gap-1.5 ${view === 'list' ? 'btn-primary' : 'bg-base-100'}`}
              aria-pressed={view === 'list'}
            >
              <List className="w-4 h-4" /> <span className="hidden sm:inline">{t('explore.viewList')}</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`btn btn-sm join-item gap-1.5 ${view === 'map' ? 'btn-primary' : 'bg-base-100'}`}
              aria-pressed={view === 'map'}
            >
              <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t('explore.viewMap')}</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        mapLoading ? (
          <Loader />
        ) : (
          <Suspense fallback={<Loader />}>
            <ExploreMap spots={mapSpots} />
          </Suspense>
        )
      ) : isLoading ? (
        <SkeletonGrid count={8} cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      ) : !spots.length ? (
        <EmptyState icon={Camera} title={t('explore.empty')} />
      ) : (
        <>
          <p className="text-sm text-base-content/50 mb-4">
            {t('explore.count').replace('{n}', Number(spots.length).toLocaleString(locale()))}
            {hasNextPage ? '+' : ''}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {spots.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 0.05}>
                <SpotCard s={s} />
              </Reveal>
            ))}
          </div>
          {hasNextPage && (
            <div className="text-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn btn-outline btn-primary rounded-full px-10"
              >
                {isFetchingNextPage && <span className="loading loading-spinner loading-sm" />}
                {t('explore.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
