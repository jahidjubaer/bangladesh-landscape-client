import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, MapPin, Camera, PenLine, Tent, BedDouble, BadgeCheck, ArrowRight, History } from 'lucide-react';
import api from '../lib/axios';
import { CATEGORIES } from '../lib/categories';
import { getRecent } from '../lib/recent';
import { t, lx } from '../i18n';

const GROUP_ICONS = { districts: MapPin, spots: Camera, blogs: PenLine, events: Tent, listings: BedDouble };
const KIND_ICONS = { district: MapPin, spot: Camera, listing: BedDouble };

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 300);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: async () => (await api.get('/search', { params: { q: debounced } })).data.data.results,
    enabled: open && debounced.trim().length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (open) {
      setQ('');
      setRecent(getRecent().slice(0, 5));
      setTimeout(() => inputRef.current?.focus(), 60);
      const onKey = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  function go(link) {
    onClose();
    navigate(link);
  }

  const groups = Object.entries(data || {}).filter(([, items]) => items?.length);
  const total = groups.reduce((n, [, items]) => n + items.length, 0);
  const typing = debounced.trim().length >= 2;

  // One flat list in display order, so arrow keys walk recent items or results
  const flat = typing ? groups.flatMap(([, items]) => items) : recent;
  useEffect(() => setActive(0), [debounced, open]);
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function onInputKey(e) {
    if (!flat.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[active].link);
    }
  }
  let row = -1; // running index while rendering result rows
  const rowCls = (i) =>
    `w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${i === active ? 'bg-season-soft' : 'hover:bg-base-200'}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[92] bg-neutral/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('search.title')}
            className="w-full max-w-xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200">
              <Search className={`w-5 h-5 shrink-0 ${isFetching ? 'text-primary animate-pulse' : 'text-base-content/40'}`} />
              <input
                ref={inputRef}
                className="grow bg-transparent focus:outline-none text-lg"
                placeholder={t('search.placeholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                role="combobox"
                aria-expanded={flat.length > 0}
                aria-controls="search-results"
                aria-activedescendant={flat.length ? `sr-${active}` : undefined}
                aria-label={t('search.title')}
              />
              <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose} aria-label="close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto" ref={listRef} id="search-results" role="listbox">
              {!typing ? (
                <div className="py-6 px-4">
                  {recent.length > 0 && (
                    <div className="-mx-4 mb-6">
                      <div className="px-4 py-1 text-xs font-bold uppercase tracking-wide text-base-content/40 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> {t('search2.recent')}
                      </div>
                      {recent.map((r, i) => {
                        const Icon = KIND_ICONS[r.kind] || MapPin;
                        return (
                          <button
                            key={r.link}
                            id={`sr-${i}`}
                            role="option"
                            aria-selected={i === active}
                            data-active={i === active}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => go(r.link)}
                            className={rowCls(i)}
                          >
                            <Icon className="w-4 h-4 text-base-content/40 shrink-0" aria-hidden />
                            <span className="grow truncate font-medium">{lx(r.title)}</span>
                            <ArrowRight className="w-4 h-4 text-base-content/30 shrink-0" aria-hidden />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-center text-sm text-base-content/45 mb-5">{t('search.hint')}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-base-content/40 text-center mb-3">
                    {t('home.popularNow')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORIES.slice(0, 6).map(({ key, Icon }) => (
                      <button
                        key={key}
                        onClick={() => go(`/explore?cat=${key}`)}
                        className="btn btn-sm btn-ghost bg-base-200 rounded-full gap-1.5"
                      >
                        <Icon className="w-4 h-4 text-primary" /> {t(`spot.category.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : total === 0 && !isFetching ? (
                <p className="text-center text-sm text-base-content/45 py-10">{t('search.empty')}</p>
              ) : (
                groups.map(([group, items]) => {
                  const Icon = GROUP_ICONS[group] || Search;
                  return (
                    <div key={group} className="py-2">
                      <div className="px-4 py-1 text-xs font-bold uppercase tracking-wide text-base-content/40 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" /> {t(`search.groups.${group}`)}
                      </div>
                      {items.map((item, i) => {
                        row += 1;
                        const idx = row;
                        return (
                        <button
                          key={`${group}-${i}`}
                          id={`sr-${idx}`}
                          role="option"
                          aria-selected={idx === active}
                          data-active={idx === active}
                          onMouseEnter={() => setActive(idx)}
                          className={rowCls(idx)}
                          onClick={() => go(item.link)}
                        >
                          <span className="grow min-w-0">
                            <span className="font-medium truncate flex items-center gap-1.5">
                              {lx(item.title)}
                              {item.verified && <BadgeCheck className="w-3.5 h-3.5 text-success shrink-0" />}
                            </span>
                            {item.sub && (
                              <span className="block text-xs text-base-content/50">
                                {group === 'districts' ? t(`district.divisions.${item.sub}`) : lx(item.sub)}
                              </span>
                            )}
                          </span>
                          <ArrowRight className="w-4 h-4 text-base-content/30 shrink-0" />
                        </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
            <div className="hidden sm:flex gap-4 px-4 py-2 border-t border-base-200 text-xs text-base-content/45">
              <span><kbd className="font-sans">↑↓</kbd> {t('search2.navigate')}</span>
              <span><kbd className="font-sans">↵</kbd> {t('search2.open')}</span>
              <span><kbd className="font-sans">esc</kbd> {t('search2.close')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
