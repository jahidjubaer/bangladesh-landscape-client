import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';
import api from '../../lib/axios';
import { CATEGORIES } from '../../lib/categories';
import { CATEGORY_SCENE } from '../../lib/scenes';
import { SEASONS, SEASON_KEYS, SEASON_COLORS } from '../../lib/seasons';
import Scene from '../../components/ui/Scene';
import Reveal from '../../components/ui/Reveal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import Seo from '../../components/Seo';
import SeasonSpotCard from '../../components/season/SeasonSpotCard';
import { t, tn } from '../../i18n';

const KEYS = CATEGORIES.map((c) => c.key);

// /things-to-do/:type — editorial landing per kind of place, filterable by season
export default function Experience() {
  const { type } = useParams();
  const [params, setParams] = useSearchParams();
  const season = SEASON_KEYS.includes(params.get('season')) ? params.get('season') : '';
  const valid = KEYS.includes(type);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['experience', type, season],
    queryFn: async ({ pageParam = 1 }) =>
      (await api.get('/spots', { params: { category: type, season: season || undefined, page: pageParam, limit: 12 } })).data.data,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: valid,
  });

  if (!valid) return <Navigate to="/explore" replace />;

  const Icon = CATEGORIES.find((c) => c.key === type).Icon;
  const title = t(`exp.title.${type}`);
  const spots = data?.pages.flatMap((p) => p.spots) || [];
  const total = data?.pages[0]?.total;
  const setSeason = (k) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (k) n.set('season', k);
      else n.delete('season');
      return n;
    }, { replace: true });

  const chip = (on) =>
    `shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
      on ? 'bg-base-content text-base-100 border-base-content' : 'border-base-300 hover:border-base-content/50'
    }`;

  return (
    <div>
      <Seo title={title} description={t(`exp.intro.${type}`)} />

      <section className="relative min-h-[58vh] flex items-end overflow-hidden text-white">
        <Scene type={CATEGORY_SCENE[type]} className="absolute inset-0 w-full h-full motion-safe:animate-[bl-drift_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2622]/90 via-[#0a2622]/30 to-[#0a2622]/40" />
        <div className="relative max-w-7xl mx-auto w-full px-4 pb-12 md:pb-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-md px-3 py-1 text-sm">
              <Icon className="w-4 h-4" aria-hidden /> {t('exp.eyebrow')}
            </span>
            <h1 className="font-display text-hero font-bold mt-4 max-w-[16ch]">{title}</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mt-4">{t(`exp.intro.${type}`)}</p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div role="group" aria-label={t('exp.bestIn')} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button aria-pressed={!season} onClick={() => setSeason('')} className={chip(!season)}>
              {t('exp.anySeason')}
            </button>
            {SEASONS.map((s) => (
              <button key={s.key} aria-pressed={season === s.key} onClick={() => setSeason(s.key)} className={chip(season === s.key)}>
                <span className="w-2 h-2 rounded-full" style={{ background: SEASON_COLORS[s.key] }} aria-hidden />
                {t(`season.name.${s.key}`)}
              </button>
            ))}
          </div>
          {total != null && <span className="text-base-content/60">{tn('exp.count', total)}</span>}
        </div>

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : spots.length === 0 ? (
          <EmptyState icon={Leaf} title={t('exp.empty')} actionLabel={t('exp.anySeason')} onAction={() => setSeason('')} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {spots.map((s, i) => (
                <Reveal key={s._id} delay={Math.min(i % 6, 5) * 0.04}>
                  <SeasonSpotCard spot={s} />
                </Reveal>
              ))}
            </div>
            {hasNextPage && (
              <div className="text-center mt-10">
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn btn-outline rounded-full px-8">
                  {isFetchingNextPage ? <span className="loading loading-spinner loading-sm" /> : t('home.exploreAll')}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="bg-base-200 py-14">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <h2 className="eyebrow mb-4">{t('exp.others')}</h2>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.key !== type).map(({ key, Icon: I }) => (
                <li key={key}>
                  <Link to={`/things-to-do/${key}`} className="inline-flex items-center gap-2 rounded-full bg-base-100 border border-base-300 px-4 py-2 text-sm hover:border-season hover:text-season-ink transition-colors">
                    <I className="w-4 h-4" aria-hidden /> {t(`exp.title.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/plan" className="btn bg-season hover:brightness-110 text-white border-0 rounded-full px-7 gap-2">
            <Sparkles className="w-4 h-4" aria-hidden /> {t('exp.planCta')} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
