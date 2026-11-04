import { useEffect, useRef } from 'react';
import { SEASONS, SEASON_COLORS, seasonFor, applySeason } from '../../lib/seasons';
import { t } from '../../i18n';

// While mounted, the page wears `key`'s accent; leaving restores today's season
export function useSeasonAccent(key) {
  useEffect(() => {
    if (key) applySeason(key);
  }, [key]);
  useEffect(() => () => applySeason(seasonFor().key), []);
}

// Six-season switcher (tablist). Arrow keys move between seasons.
export default function SeasonDial({ value, onChange, idPrefix = 'season', className = '' }) {
  const now = seasonFor().key;
  const refs = useRef({});

  function onKey(e, i) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === 'Home' || e.key === 'End' || step) {
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? SEASONS.length - 1 : (i + step + SEASONS.length) % SEASONS.length;
      onChange(SEASONS[next].key);
      refs.current[SEASONS[next].key]?.focus();
    }
  }

  return (
    <div role="tablist" aria-label={t('season.ui.pick')} className={`grid grid-cols-3 md:grid-cols-6 gap-2.5 ${className}`}>
      {SEASONS.map((s, i) => {
        const on = s.key === value;
        return (
          <button
            key={s.key}
            ref={(el) => {
              refs.current[s.key] = el;
            }}
            role="tab"
            id={`${idPrefix}-tab-${s.key}`}
            aria-selected={on}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(s.key)}
            onKeyDown={(e) => onKey(e, i)}
            style={{ '--c': SEASON_COLORS[s.key] }}
            className={`relative overflow-hidden text-left rounded-2xl p-4 border transition-all duration-300 ease-brand
              before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[var(--c)]
              ${
                on
                  ? 'bg-[var(--c)] text-white border-transparent shadow-lg shadow-[var(--c)]/30 -translate-y-0.5'
                  : 'bg-base-100 border-base-300 hover:-translate-y-0.5 hover:shadow-md'
              }`}
          >
            {s.key === now && (
              <span
                className={`absolute right-2.5 top-3 text-[0.625rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                  on ? 'bg-white text-base-content' : 'bg-[var(--c)] text-white'
                }`}
              >
                {t('season.ui.now')}
              </span>
            )}
            <span className="font-display text-lg font-bold block leading-tight">{t(`season.name.${s.key}`)}</span>
            <span className={`block text-sm ${on ? 'text-white/85' : 'text-base-content/60'}`}>{t(`season.gloss.${s.key}`)}</span>
            <span className={`block text-xs mt-1.5 ${on ? 'text-white/75' : 'text-base-content/50'}`}>{t(`season.dates.${s.key}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
