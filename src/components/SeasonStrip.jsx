import { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { seasonFor } from '../lib/seasons';
import { t, getLang } from '../i18n';

const KEY = 'bl-alert-dismissed';

// Thin "travel update" bar above the navbar: what the current season means
// for travellers, plus the national emergency number. Dismissed per season.
export default function SeasonStrip() {
  const season = seasonFor();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === season.key;
    } catch {
      return false;
    }
  });
  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, season.key);
    } catch {
      /* private mode */
    }
    setHidden(true);
  }

  return (
    <div role="region" aria-label={t('alert.label')} className="bg-[#0a2622] text-[#d8ece6] text-[0.8125rem]">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-3">
        <span className="relative flex w-2 h-2 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-season-bright opacity-60 motion-safe:animate-ping" />
          <span className="relative w-2 h-2 rounded-full bg-season-bright" />
        </span>
        <p className="truncate grow min-w-0">
          <span className="sr-only">{getLang() === 'bn' ? season.bn : season.en}: </span>
          {t(`alert.${season.key}`)}
        </p>
        <a href="tel:999" className="hidden sm:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 shrink-0">
          <Phone className="w-3.5 h-3.5" aria-hidden /> {t('alert.emergency')}
        </a>
        <button
          onClick={dismiss}
          className="shrink-0 -mr-1 w-7 h-7 grid place-items-center rounded-full hover:bg-white/10"
          aria-label={t('alert.dismiss')}
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
