import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Search, MapPin, CalendarDays, Users } from 'lucide-react';
import Scene from '../ui/Scene';
import { SEASONS, seasonFor } from '../../lib/seasons';
import { t, lx, getLang } from '../../i18n';

const SLIDE_MS = 6000;
const WHO = [
  { key: 'whoFriends', members: 4 },
  { key: 'whoCouple', members: 2 },
  { key: 'whoFamily', members: 5 },
  { key: 'whoSolo', members: 1 },
  { key: 'whoGroup', members: 10 },
];
const DAYS = [1, 2, 3, 4, 5, 7];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Crossfading photos with a slow zoom; one image loads eagerly, the rest after
function Montage({ images }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reducedMotion() || images.length < 2) return undefined;
    images.slice(1).forEach((src) => {
      const im = new window.Image();
      im.src = src;
    });
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [images]);

  return (
    <AnimatePresence>
      <motion.img
        key={images[idx]}
        src={images[idx]}
        alt=""
        fetchPriority={idx === 0 ? 'high' : undefined}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: reducedMotion() ? 1.04 : 1.14 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 1.4 }, scale: { duration: (SLIDE_MS + 1500) / 1000, ease: 'linear' } }}
      />
    </AnimatePresence>
  );
}

// Where · How long · Who → straight into the plan wizard, pre-filled
function IntentSearch({ districts }) {
  const navigate = useNavigate();
  const [where, setWhere] = useState('');
  const [days, setDays] = useState(2);
  const [who, setWho] = useState(0);

  function submit(e) {
    e.preventDefault();
    const q = new URLSearchParams({ days: String(days), members: String(WHO[who].members) });
    if (where) q.set('district', where);
    navigate(`/plan?${q}`);
  }

  const field = 'flex-1 min-w-0 px-5 py-2 sm:border-r border-base-300 last-of-type:border-0';
  const label = 'flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-base-content/70';
  const select = 'w-full bg-transparent outline-none text-[0.95rem] text-base-content py-0.5 cursor-pointer truncate';

  return (
    <form
      onSubmit={submit}
      className="mt-8 w-full max-w-3xl bg-base-100 text-base-content rounded-[1.75rem] sm:rounded-full p-2 shadow-2xl shadow-black/30 flex flex-col sm:flex-row sm:items-center gap-1"
    >
      <div className={field}>
        <label htmlFor="hero-where" className={label}>
          <MapPin className="w-3.5 h-3.5" aria-hidden /> {t('home2.where')}
        </label>
        <select id="hero-where" className={select} value={where} onChange={(e) => setWhere(e.target.value)}>
          <option value="">{t('home2.anywhere')}</option>
          {(districts || []).map((d) => (
            <option key={d.slug} value={d.slug}>
              {lx(d.name)}
            </option>
          ))}
        </select>
      </div>
      <div className={field}>
        <label htmlFor="hero-days" className={label}>
          <CalendarDays className="w-3.5 h-3.5" aria-hidden /> {t('home2.when')}
        </label>
        <select id="hero-days" className={select} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {DAYS.map((n) => (
            <option key={n} value={n}>
              {n === 1 ? t('home2.dayTrip') : t('home2.daysN').replace('{n}', n.toLocaleString(getLang() === 'bn' ? 'bn-BD' : 'en-GB'))}
            </option>
          ))}
        </select>
      </div>
      <div className={field}>
        <label htmlFor="hero-who" className={label}>
          <Users className="w-3.5 h-3.5" aria-hidden /> {t('home2.who')}
        </label>
        <select id="hero-who" className={select} value={who} onChange={(e) => setWho(Number(e.target.value))}>
          {WHO.map((w, i) => (
            <option key={w.key} value={i}>
              {t(`home2.${w.key}`)}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn bg-season hover:brightness-110 text-white border-0 rounded-full h-14 px-7 text-base gap-2 shadow-lg">
        {t('home2.planIt')} <ArrowRight className="w-5 h-5" aria-hidden />
      </button>
    </form>
  );
}

// Full-bleed editorial hero. Sits under the transparent navbar on the home page.
export default function HomeHero({ districts, images = [] }) {
  const season = seasonFor();
  const meta = SEASONS.find((s) => s.key === season.key);
  const words = t('home2.heroTitle').split(' ');
  const hasPhotos = images.length > 0;

  return (
    <section className="relative -mt-16 min-h-[92svh] md:min-h-[100svh] max-h-[1000px] flex items-end overflow-hidden text-white bg-[#0a2622]">
      <div className="absolute inset-0" aria-hidden>
        {hasPhotos ? (
          <Montage images={images} />
        ) : (
          <Scene type={meta.scene} className="absolute inset-0 w-full h-full motion-safe:animate-[bl-drift_24s_ease-in-out_infinite_alternate]" />
        )}
        {/* Scrim: readable nav on top, readable headline at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2622]/75 via-[#0a2622]/10 to-[#0a2622]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2622]/55 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-32 pb-16 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link
            to={`/seasons/${season.key}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-md pl-1.5 pr-4 py-1 text-sm hover:bg-white/25 transition-colors"
          >
            <span className="rounded-full bg-season px-3 py-0.5 font-semibold">{t(`season.name.${season.key}`)}</span>
            <span className="truncate max-w-[16rem] sm:max-w-none">{t(`season.tagline.${season.key}`)}</span>
          </Link>
        </motion.div>

        <h1 className="font-display text-hero font-bold mt-6 max-w-[14ch] [text-wrap:balance]">
          {/* Real spaces between the animated words keep the heading readable to screen readers */}
          {words.map((w, i) => (
            <span key={i}>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: '0.4em' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.1, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {w}
              </motion.span>{' '}
            </span>
          ))}
          <motion.span
            className="block font-display text-[0.38em] font-medium opacity-85 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            lang={getLang() === 'bn' ? 'en' : 'bn'}
          >
            {t('home2.heroAlt')}
          </motion.span>
        </h1>

        <motion.p
          className="text-lg md:text-xl text-white/90 max-w-2xl mt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          {t('home2.heroSub')}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.5 }}>
          <IntentSearch districts={districts} />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bl:open-search'))}
            className="mt-4 ml-2 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white underline-offset-4 hover:underline"
          >
            <Search className="w-4 h-4" aria-hidden /> {t('home2.searchInstead')}
            <kbd className="hidden md:inline text-[0.7rem] border border-white/40 rounded px-1.5">Ctrl K</kbd>
          </button>
        </motion.div>
      </div>

      {hasPhotos ? (
        <Link
          to="/credits"
          className="absolute right-4 bottom-4 z-10 text-[0.7rem] rounded-full bg-black/40 backdrop-blur px-3 py-1 text-white/85 hover:text-white"
        >
          {t('home2.photoCredits')}
        </Link>
      ) : (
        <span className="absolute right-4 bottom-4 z-10 text-[0.7rem] rounded-full bg-black/40 backdrop-blur px-3 py-1 text-white/80">
          {t('home2.illustration')}
        </span>
      )}
    </section>
  );
}
