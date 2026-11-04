import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Sparkles, ArrowRight, Leaf } from 'lucide-react';
import Scene from '../../components/ui/Scene';
import Reveal from '../../components/ui/Reveal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import Seo from '../../components/Seo';
import SeasonDial, { useSeasonAccent } from '../../components/season/SeasonDial';
import SeasonSpotCard from '../../components/season/SeasonSpotCard';
import { useSeasonSpots } from '../../features/seasons/queries';
import { SEASONS, SEASON_KEYS, seasonFor } from '../../lib/seasons';
import { t, getLang } from '../../i18n';

const fill = (s, x) => s.replace('{x}', x).replace('{n}', x);

export default function Season() {
  const { key } = useParams();
  const valid = SEASON_KEYS.includes(key);
  useSeasonAccent(valid ? key : null);
  const navigate = useNavigate();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useSeasonSpots(valid ? key : null);

  if (!valid) return <Navigate to={`/seasons/${seasonFor().key}`} replace />;

  const season = SEASONS.find((s) => s.key === key);
  const name = t(`season.name.${key}`);
  const isNow = seasonFor().key === key;
  const spots = data?.pages.flatMap((p) => p.spots) || [];
  const total = data?.pages[0]?.total ?? 0;
  // The other name in the other script, as a quiet second line
  const altName = getLang() === 'bn' ? season.en : season.bn;

  return (
    <div>
      <Seo title={fill(t('season.ui.pageTitle'), name)} description={t(`season.intro.${key}`)} />

      {/* Hero */}
      <section className="relative min-h-[70vh] md:min-h-[78vh] flex items-end overflow-hidden text-white -mt-px">
        <Scene type={season.scene} className="absolute inset-0 w-full h-full motion-safe:animate-[bl-drift_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2622]/60 via-transparent to-[#0a2622]/90" />
        <div className="relative max-w-7xl mx-auto w-full px-4 pb-14 md:pb-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-md pl-2 pr-4 py-1 text-sm">
              <span className="rounded-full bg-season px-2.5 py-0.5 font-semibold">
                {isNow ? t('season.ui.now') : t('season.ui.label')}
              </span>
              <CalendarDays className="w-4 h-4" aria-hidden /> {t(`season.dates.${key}`)}
            </span>
            <h1 className="font-display text-hero font-extrabold mt-5">
              {name}
              <span className="block font-display text-[0.4em] font-semibold opacity-85 mt-2">
                {altName} · {t(`season.gloss.${key}`)}
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mt-4 text-white/90">{t(`season.tagline.${key}`)}</p>
          </Reveal>
        </div>
      </section>

      {/* Intro + plan CTA */}
      <section className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-start">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow">{fill(t('season.ui.pageTitle'), name)}</p>
          <p className="text-lg md:text-xl leading-relaxed mt-4 text-base-content/80">{t(`season.intro.${key}`)}</p>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="rounded-3xl bg-season-soft border border-base-300 p-6 md:p-8">
            <Sparkles className="w-8 h-8 text-season-ink" aria-hidden />
            <h2 className="font-display text-title font-bold mt-3">{fill(t('season.ui.planCta'), name)}</h2>
            <p className="text-base-content/70 mt-2">{t('season.ui.planSub')}</p>
            <Link to="/plan" className="btn bg-season text-white border-0 rounded-full mt-5 px-6 hover:brightness-110">
              {fill(t('season.ui.planCta'), name)} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Spots */}
      <section id="season-page-panel" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-display font-bold">{t('season.ui.spotsTitle')}</h2>
          {total > 0 && <span className="text-base-content/60 shrink-0">{fill(t('season.ui.spotsCount'), total)}</span>}
        </div>
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : spots.length === 0 ? (
          <EmptyState icon={Leaf} title={t('season.ui.noSpots')} actionLabel={t('nav2.allDistricts')} actionTo="/districts" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {spots.map((s, i) => (
                <Reveal key={s._id} delay={Math.min(i % 6, 5) * 0.05} className={i === 0 ? 'sm:col-span-2' : ''}>
                  <SeasonSpotCard spot={s} size={i === 0 ? 'lg' : 'md'} />
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

      {/* Other seasons */}
      <section className="bg-base-200 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="eyebrow mb-5">{t('season.ui.other')}</h2>
          <SeasonDial value={key} onChange={(k) => navigate(`/seasons/${k}`)} idPrefix="season-page" />
        </div>
      </section>
    </div>
  );
}
