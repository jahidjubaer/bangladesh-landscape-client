import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m as motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SeasonDial, { useSeasonAccent } from './SeasonDial';
import SeasonSpotCard from './SeasonSpotCard';
import { useSeasonPicks } from '../../features/seasons/queries';
import { seasonFor } from '../../lib/seasons';
import { Skeleton } from '../ui/Skeleton';
import Reveal from '../ui/Reveal';
import { t } from '../../i18n';

// Home: "One country, six different trips". Picking a season re-tints the
// page and swaps the picks, which come from the season-filtered spot API.
export default function SeasonSection() {
  const [season, setSeason] = useState(() => seasonFor().key);
  useSeasonAccent(season);
  const { data, isLoading } = useSeasonPicks(season, 3);
  const picks = data?.spots || [];
  const name = t(`season.name.${season}`);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow">{t('season.ui.label')}</p>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
          <div>
            <h2 className="font-display text-display font-bold max-w-3xl">{t('season.ui.titleHome')}</h2>
            <p className="text-base-content/65 text-lg mt-3 max-w-2xl">{t('season.ui.subHome')}</p>
          </div>
          <Link to={`/seasons/${season}`} className="btn btn-ghost rounded-full gap-1.5 text-season-ink">
            {t('season.ui.seeAll').replace('{x}', name)} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </Reveal>

      <SeasonDial value={season} onChange={setSeason} idPrefix="home-season" className="mt-8 mb-6" />

      <div id="home-season-panel" role="tabpanel" aria-labelledby={`home-season-tab-${season}`}>
        <p className="text-base-content/70 mb-5">
          <span className="font-semibold text-season-ink">{t('season.ui.goNow').replace('{x}', name)}</span>
          {' — '}
          {t(`season.tagline.${season}`)}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={season}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-5"
          >
            {isLoading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="min-h-[22rem] rounded-3xl" />)
              : picks.map((s, i) => <SeasonSpotCard key={s._id} spot={s} size={i === 0 ? 'lg' : 'md'} />)}
          </motion.div>
        </AnimatePresence>
        {!isLoading && picks.length === 0 && <p className="text-base-content/60">{t('season.ui.noSpots')}</p>}
      </div>
    </section>
  );
}
