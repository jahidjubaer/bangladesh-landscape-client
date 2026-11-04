import { Link } from '../../lib/router';
import { SEASONS, SEASON_COLORS, seasonFor } from '../../lib/seasons';
import Reveal from '../ui/Reveal';
import { t, tn } from '../../i18n';

// District "when to go": per season, how many of the district's spots are at
// their best (spots carry resolved `seasons` from the API). Hidden when no
// spot has season data.
export default function WhenToGo({ spots = [] }) {
  const counts = Object.fromEntries(SEASONS.map((s) => [s.key, 0]));
  spots.forEach((sp) => (sp.seasons || []).forEach((k) => (counts[k] = (counts[k] || 0) + 1)));
  const max = Math.max(...Object.values(counts));
  if (!max) return null;
  const now = seasonFor().key;

  const level = (n) => (n >= max * 0.7 ? 'best' : n >= max * 0.35 ? 'good' : 'quiet');

  return (
    <section id="when" className="scroll-mt-36">
      <Reveal>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold">{t('season.ui.whenToGo')}</h2>
        <p className="text-base-content/60 mt-1 mb-6">{t('season.ui.whenSub')}</p>
        <ol className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {SEASONS.map((s) => {
            const n = counts[s.key];
            const lv = level(n);
            return (
              <li key={s.key}>
                <Link
                  to={`/seasons/${s.key}`}
                  style={{ '--c': SEASON_COLORS[s.key] }}
                  className={`group flex flex-col h-full rounded-2xl border p-3.5 transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:shadow-md ${
                    s.key === now ? 'border-[var(--c)] ring-1 ring-[var(--c)]' : 'border-base-300'
                  } bg-base-100`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold leading-tight">{t(`season.name.${s.key}`)}</span>
                    {s.key === now && (
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 bg-[var(--c)] text-white">
                        {t('season.ui.now')}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-base-content/50">{t(`season.dates.${s.key}`)}</span>
                  {/* Meter: share of the district's picks in this season */}
                  <span className="mt-3 h-1.5 rounded-full bg-base-200 overflow-hidden" aria-hidden>
                    <span
                      className="block h-full rounded-full bg-[var(--c)] transition-[width] duration-700 ease-brand"
                      style={{ width: `${Math.max(6, (n / max) * 100)}%`, opacity: lv === 'quiet' ? 0.45 : 1 }}
                    />
                  </span>
                  <span className="mt-2 flex items-center justify-between text-xs">
                    <span className={lv === 'best' ? 'font-semibold text-base-content' : 'text-base-content/60'}>
                      {t(`season.ui.${lv}`)}
                    </span>
                    <span className="text-base-content/50">{tn('season.ui.placesN', n)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </section>
  );
}
