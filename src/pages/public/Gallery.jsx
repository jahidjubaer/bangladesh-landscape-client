import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, MapPin, ArrowRight, Camera } from 'lucide-react';
import api from '../../lib/axios';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

function Lightbox({ photos, index, onClose, onMove }) {
  const photo = photos[index];

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onMove(-1);
      if (e.key === 'ArrowRight') onMove(1);
    },
    [onClose, onMove]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-neutral/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 btn btn-circle btn-ghost text-neutral-content" aria-label="close" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>

      <button
        className="absolute left-2 md:left-6 btn btn-circle btn-ghost text-neutral-content"
        aria-label="previous"
        onClick={(e) => {
          e.stopPropagation();
          onMove(-1);
        }}
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <div className="max-w-5xl max-h-[85vh] px-14 md:px-20 text-center" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.url}
            src={photo.url}
            alt={lx(photo.title)}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="max-h-[72vh] w-auto mx-auto rounded-xl shadow-2xl object-contain"
          />
        </AnimatePresence>
        <div className="mt-4 text-neutral-content">
          <div className="font-display text-lg font-bold">{lx(photo.title)}</div>
          <div className="flex items-center justify-center gap-3 text-sm opacity-80 mt-1">
            {photo.district && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {lx(photo.district.name)}
              </span>
            )}
            <span>
              {Number(index + 1).toLocaleString(locale())} / {Number(photos.length).toLocaleString(locale())}
            </span>
            {photo.link && (
              <Link to={photo.link} className="link flex items-center gap-1 text-accent" onClick={onClose}>
                {t('gallery.visit')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <button
        className="absolute right-2 md:right-6 btn btn-circle btn-ghost text-neutral-content"
        aria-label="next"
        onClick={(e) => {
          e.stopPropagation();
          onMove(1);
        }}
      >
        <ChevronRight className="w-7 h-7" />
      </button>
    </motion.div>
  );
}

export default function Gallery() {
  const [district, setDistrict] = useState('');
  const [open, setOpen] = useState(null); // index into filtered list

  const { data: photos, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => (await api.get('/gallery')).data.data.photos,
    staleTime: 10 * 60 * 1000,
  });

  const districts = useMemo(() => {
    const map = new Map();
    (photos || []).forEach((p) => p.district && map.set(p.district.slug, p.district));
    return [...map.values()];
  }, [photos]);

  const filtered = useMemo(
    () => (photos || []).filter((p) => !district || p.district?.slug === district),
    [photos, district]
  );

  const move = useCallback(
    (dir) => setOpen((i) => (i === null ? null : (i + dir + filtered.length) % filtered.length)),
    [filtered.length]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('gallery.title')} description={t('gallery.subtitle')} />

      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('gallery.title')}</h1>
        <p className="text-base-content/60 mb-6">{t('gallery.subtitle')}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className={`btn btn-sm rounded-full ${district === '' ? 'btn-primary' : 'btn-outline border-base-300'}`}
            onClick={() => setDistrict('')}
          >
            {t('gallery.all')}
          </button>
          {districts.map((d) => (
            <button
              key={d.slug}
              className={`btn btn-sm rounded-full ${district === d.slug ? 'btn-primary' : 'btn-outline border-base-300'}`}
              onClick={() => setDistrict(d.slug)}
            >
              {lx(d.name)}
            </button>
          ))}
        </div>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : !filtered.length ? (
        <EmptyState icon={Camera} title={t('gallery.empty')} />
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
          {filtered.map((p, i) => (
            <motion.button
              key={p.url}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="relative w-full break-inside-avoid rounded-2xl overflow-hidden img-zoom group shadow-md block"
              onClick={() => setOpen(i)}
            >
              <img src={p.url} alt={lx(p.title)} loading="lazy" className="w-full block" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 inset-x-0 p-3 text-neutral-content text-start opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="font-semibold text-sm leading-snug">{lx(p.title)}</div>
                {p.district && <div className="text-xs opacity-80">📍 {lx(p.district.name)}</div>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open !== null && <Lightbox photos={filtered} index={open} onClose={() => setOpen(null)} onMove={move} />}
      </AnimatePresence>
    </div>
  );
}
