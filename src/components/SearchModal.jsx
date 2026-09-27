import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, MapPin, Camera, PenLine, Tent, BedDouble, BadgeCheck, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import { t, lx } from '../i18n';

const GROUP_ICONS = { districts: MapPin, spots: Camera, blogs: PenLine, events: Tent, listings: BedDouble };

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
              />
              <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose} aria-label="close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {debounced.trim().length < 2 ? (
                <p className="text-center text-sm text-base-content/45 py-10">{t('search.hint')}</p>
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
                      {items.map((item, i) => (
                        <button
                          key={`${group}-${i}`}
                          className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors flex items-center gap-3"
                          onClick={() => go(item.link)}
                        >
                          <span className="grow min-w-0">
                            <span className="font-medium truncate flex items-center gap-1.5">
                              {lx(item.title)}
                              {item.verified && <BadgeCheck className="w-3.5 h-3.5 text-success shrink-0" />}
                            </span>
                            {item.sub && <span className="block text-xs text-base-content/50">{lx(item.sub)}</span>}
                          </span>
                          <ArrowRight className="w-4 h-4 text-base-content/30 shrink-0" />
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
