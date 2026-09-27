import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  MapPin, Sparkles, Compass, ShieldCheck, ChevronDown, ArrowRight, Search, History,
  ListChecks, SlidersHorizontal, FileDown, Map as MapIcon, Camera, PenLine,
} from 'lucide-react';
import { CATEGORIES } from '../../lib/categories';
import { getRecent } from '../../lib/recent';
import api from '../../lib/axios';
import { useDistricts, useDistrict } from '../../features/districts/queries';
import { useBlogs } from '../../features/blogs/queries';
import AdBanner from '../../components/AdBanner';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import CountUp from '../../components/ui/CountUp';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import FavoriteButton from '../../components/ui/FavoriteButton';
import { t, lx, locale } from '../../i18n';

/* ---------------- Hero ---------------- */

const headlineWords = t('home.heroTitle').split(' ');
const SLIDE_MS = 5200;

// Video-like Ken Burns montage: crossfading photos with a slow zoom drift
function HeroMontage({ images }) {
  const [idx, setIdx] = useState(0);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preload so crossfades never flash
  useEffect(() => {
    images.forEach((src) => {
      const im = new window.Image();
      im.src = src;
    });
  }, [images]);

  useEffect(() => {
    if (reduced || images.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [images, reduced]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0" aria-hidden>
      <AnimatePresence>
        <motion.img
          key={`${idx}-${images[idx]}`}
          src={images[idx]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: reduced ? 1.06 : 1.18 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.4, ease: 'easeInOut' },
            scale: { duration: (SLIDE_MS + 1600) / 1000, ease: 'linear' },
          }}
        />
      </AnimatePresence>
      {/* Scrim keeps the headline and search card readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2622]/85 via-[#0d3a32]/55 to-[#0a2622]/90" />
    </div>
  );
}

function Hero({ districts, images }) {
  const openSearch = () => window.dispatchEvent(new CustomEvent('bl:open-search'));

  // Popular quick-links under the search pill: two flagship districts + three categories
  const quickChips = [
    ...['sunamganj', 'coxs-bazar']
      .map((slug) => (districts || []).find((d) => d.slug === slug))
      .filter(Boolean)
      .map((d) => ({ label: lx(d.name), to: `/districts/${d.slug}` })),
    ...CATEGORIES.slice(0, 3).map(({ key }) => ({ label: t(`spot.category.${key}`), to: `/explore?cat=${key}` })),
  ];

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden bg-neutral text-neutral-content">
      {/* Layered background: photo montage over gradient, plus slow floating glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2622] via-[#0d3a32] to-[#0a2622]" />
      <HeroMontage images={images} />
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-primary/25 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -32, 0], y: [0, -20, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-accent/15 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-24">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="badge badge-accent badge-lg gap-1.5 mb-6 font-semibold shadow-lg shadow-accent/30"
        >
          <MapPin className="w-3.5 h-3.5" /> {t('home.launchDistrict')}
        </motion.span>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] mb-6">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block me-[0.35em]"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-lg md:text-xl opacity-85 max-w-2xl mx-auto mb-10"
        >
          {t('home.heroSubtitle')}
        </motion.p>

        {/* Airbnb-style search pill: one tap opens the global search overlay */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <button
            onClick={openSearch}
            className="w-full max-w-xl mx-auto flex items-center gap-3 bg-base-100/95 backdrop-blur rounded-full shadow-2xl pl-6 pr-2 py-2 text-base-content hover:shadow-primary/25 hover:scale-[1.015] transition-all cursor-pointer"
          >
            <Search className="w-5 h-5 text-primary shrink-0" />
            <span className="grow text-start text-base-content/55 truncate py-2">{t('home.searchPill')}</span>
            <span className="btn btn-primary btn-circle shadow-lg shadow-primary/30">
              <Search className="w-5 h-5" />
            </span>
          </button>

          {/* Popular quick-links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-sm">
            <span className="opacity-70">{t('home.popularNow')}:</span>
            {quickChips.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-1.5 rounded-full bg-neutral-content/10 border border-neutral-content/20 backdrop-blur-sm hover:bg-primary hover:border-primary hover:text-primary-content transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 z-10 flex flex-col items-center gap-1 opacity-70 text-sm"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {t('home.scrollHint')}
        <ChevronDown className="w-5 h-5" />
      </motion.div>

      {/* Wave divider into the page background */}
      <svg className="absolute bottom-0 left-0 right-0 w-full text-base-200" viewBox="0 0 1440 70" fill="currentColor" preserveAspectRatio="none" aria-hidden>
        <path d="M0,40 C240,70 480,10 720,30 C960,50 1200,20 1440,45 L1440,70 L0,70 Z" />
      </svg>
    </section>
  );
}

/* ---------------- Stats ---------------- */

function StatsStrip() {
  const { data } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => (await api.get('/stats')).data.data.stats,
    staleTime: 5 * 60 * 1000,
  });

  const items = [
    { key: 'districts', value: data?.districts ?? 0, Icon: MapIcon },
    { key: 'spots', value: data?.spots ?? 0, Icon: Camera },
    { key: 'guides', value: data?.guides ?? 0, Icon: ShieldCheck },
    { key: 'plans', value: data?.plans ?? 0, Icon: FileDown },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 -mt-2 relative z-10">
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-base-300 rounded-2xl overflow-hidden shadow-lg">
          {items.map(({ key, value, Icon }) => (
            <div key={key} className="bg-base-100 p-6 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.8} />
              <div className="font-display text-3xl font-extrabold text-base-content">
                <CountUp value={value} suffix="+" />
              </div>
              <div className="text-sm text-base-content/60 mt-1">{t(`home.stats.${key}`)}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Recently viewed ---------------- */

function RecentlyViewed() {
  const [items] = useState(getRecent);
  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-14">
      <Reveal>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-base-content/80">
          <History className="w-5 h-5 text-primary" /> {t('recent.title')}
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="shrink-0 w-44 card bg-base-100 shadow-sm card-lift img-zoom block"
            >
              <figure className="h-24">
                <Img src={item.image} alt={lx(item.title)} className="w-full h-full object-cover" />
              </figure>
              <div className="p-3">
                <span className="font-semibold text-sm leading-tight line-clamp-1">{lx(item.title)}</span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Category explore row ---------------- */

function CategoryRow() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-16">
      <Reveal>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-1">{t('home.exploreTitle')}</h2>
            <p className="text-base-content/60">{t('home.exploreSubtitle')}</p>
          </div>
          <Link to="/explore" className="link link-primary font-medium items-center gap-1 hidden sm:flex">
            {t('home.exploreAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
      <Reveal>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 lg:justify-between">
          {CATEGORIES.map(({ key, Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="shrink-0 lg:flex-1"
            >
              <Link
                to={`/explore?cat=${key}`}
                className="card bg-base-100 shadow-md card-lift items-center text-center p-5 w-32 lg:w-auto"
              >
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6" strokeWidth={1.8} />
                </span>
                <span className="font-semibold text-sm">{t(`spot.category.${key}`)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Seasonal picks ---------------- */

// Month-aware curated picks — what Bangladesh is best at right now
const SEASONS = [
  { key: 'monsoon', months: [5, 6, 7, 8], cat: 'haor', slugs: ['sunamganj', 'kishoreganj', 'netrokona', 'moulvibazar'] },
  { key: 'winter', months: [9, 10, 11, 0, 1], cat: 'hill', slugs: ['bandarban', 'rangamati', 'coxs-bazar', 'khagrachhari'] },
  { key: 'summer', months: [2, 3, 4], cat: 'garden', slugs: ['sylhet', 'moulvibazar', 'habiganj', 'panchagarh'] },
];

function SeasonalPicks({ districts }) {
  const season = SEASONS.find((s) => s.months.includes(new Date().getMonth())) || SEASONS[0];
  const picks = season.slugs
    .map((slug) => (districts || []).find((d) => d.slug === slug))
    .filter(Boolean);
  if (!picks.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-16">
      <Reveal>
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-stretch">
          {/* Season story card */}
          <div className="card bg-gradient-to-br from-neutral via-[#14453b] to-primary text-neutral-content p-8 justify-center relative overflow-hidden">
            <span className="badge badge-accent gap-1 mb-4 font-semibold w-fit">
              ☀️ {t(`home.season.${season.key}.name`)} · {t('home.seasonBadge')}
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-3">
              {t(`home.season.${season.key}.title`)}
            </h2>
            <p className="opacity-85 leading-relaxed mb-6">{t(`home.season.${season.key}.desc`)}</p>
            <Link to={`/explore?cat=${season.cat}`} className="btn btn-accent btn-sm rounded-full w-fit gap-1.5">
              {t('home.seasonExplore')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* This season's districts */}
          <div className="grid grid-cols-2 gap-4">
            {picks.map((d) => (
              <Link key={d.slug} to={`/districts/${d.slug}`} className="card shadow-md card-lift img-zoom block relative h-40 lg:h-auto overflow-hidden">
                <Img src={d.heroImageUrl} alt={lx(d.name)} icon={MapIcon} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-neutral/10 to-transparent" />
                <div className="absolute bottom-0 p-4 text-neutral-content">
                  <h3 className="font-display text-lg font-bold leading-tight">{lx(d.name)}</h3>
                  <span className="text-xs opacity-80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t(`district.divisions.${d.division}`) || d.division}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Districts showcase ---------------- */

function DistrictShowcase({ districts }) {
  // API sorts verified-first; the homepage shows only the top few
  const featured = (districts || []).slice(0, 5);
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-center mb-2">{t('home.districtsTitle')}</h2>
        <p className="text-center text-base-content/60 mb-10">{t('home.districtsSubtitle')}</p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((d, i) => (
          <Reveal key={d.slug} delay={i * 0.08}>
            <Link to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
              <figure className="h-56 relative">
                <Img src={d.heroImageUrl} alt={lx(d.name)} icon={MapIcon} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <VerifiedBadge verified={d.isVerified} />
                </div>
                <FavoriteButton kind="district" itemId={d._id} className="absolute top-3 right-3 z-20" />
                <div className="absolute bottom-0 p-5 text-neutral-content pointer-events-none">
                  <h3 className="font-display text-2xl font-bold">{lx(d.name)}</h3>
                  <span className="text-sm opacity-80 flex items-center gap-1">
                    <ArrowRight className="w-4 h-4" /> {t('district.viewDetails')}
                  </span>
                </div>
              </figure>
            </Link>
          </Reveal>
        ))}

        {/* All 64 districts card */}
        <Reveal delay={featured.length * 0.08}>
          <Link
            to="/districts"
            className="card h-56 border-2 border-dashed border-primary/40 bg-primary/5 items-center justify-center text-center p-6 card-lift"
          >
            <MapIcon className="w-10 h-10 text-primary mb-3" strokeWidth={1.5} />
            <h3 className="font-bold text-primary">{t('home.moreDistrictsTitle')}</h3>
            <p className="text-sm text-base-content/55">{t('home.moreDistrictsDesc')}</p>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

const steps = [
  { Icon: ListChecks, title: t('home.how1Title'), desc: t('home.how1Desc') },
  { Icon: SlidersHorizontal, title: t('home.how2Title'), desc: t('home.how2Desc') },
  { Icon: FileDown, title: t('home.how3Title'), desc: t('home.how3Desc') },
];

function HowItWorks() {
  return (
    <section className="bg-base-100 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-center mb-2">{t('home.howTitle')}</h2>
          <p className="text-center text-base-content/60 mb-14">{t('home.howSubtitle')}</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-9 left-[16%] right-[16%] border-t-2 border-dashed border-primary/30" aria-hidden />
          {steps.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.15} className="relative text-center">
              <div className="w-18 h-18 md:w-[4.5rem] md:h-[4.5rem] rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25 relative">
                <Icon className="w-8 h-8" strokeWidth={1.8} />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-content text-sm font-bold flex items-center justify-center shadow">
                  {['১', '২', '৩'][i]}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-base-content/60 max-w-xs mx-auto leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4} className="text-center mt-12">
          <Link to="/plan" className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-primary/25 gap-2">
            <Sparkles className="w-5 h-5" /> {t('home.ctaPlan')}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Featured spots carousel ---------------- */

function SpotsCarousel({ firstDistrictSlug }) {
  const { data } = useDistrict(firstDistrictSlug);
  const spots = data?.spots || [];
  if (!spots.length) return null;

  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <Reveal>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t('home.featuredSpots')}</h2>
          <Link to={`/districts/${firstDistrictSlug}`} className="link link-primary font-medium flex items-center gap-1">
            {t('home.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>

      <Reveal>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1.15}
          breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.3 } }}
          autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          className="!pb-12"
        >
          {spots.map((s) => (
            <SwiperSlide key={s.slug}>
              <Link to={`/spots/${s.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
                <figure className="h-48 relative">
                  <Img src={s.images?.[0]} alt={lx(s.name)} icon={Camera} className="w-full h-full object-cover" />
                  {s.isHidden && (
                    <span className="absolute top-3 left-3 badge badge-secondary badge-sm shadow">💎 {t('district.hiddenGem')}</span>
                  )}
                </figure>
                <div className="card-body p-4">
                  <h3 className="font-bold">{lx(s.name)}</h3>
                  <span className="badge badge-outline badge-sm">{t(`spot.category.${s.category}`)}</span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </section>
  );
}

/* ---------------- Latest blogs ---------------- */

function BlogStrip() {
  const { data } = useBlogs({});
  const blogs = (data?.blogs || []).slice(0, 3);
  if (!blogs.length) return null;

  return (
    <section className="bg-base-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">{t('home.latestBlogs')}</h2>
            <Link to="/blog" className="link link-primary font-medium flex items-center gap-1">
              {t('home.seeAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {blogs.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.1}>
              <Link to={`/blog/${b.slug}`} className="card bg-base-200 card-lift img-zoom block h-full">
                <figure className="h-44">
                  <Img src={b.coverImageUrl} alt={lx(b.title)} icon={PenLine} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body p-5">
                  <h3 className="font-bold leading-snug line-clamp-2">{lx(b.title)}</h3>
                  <p className="text-sm text-base-content/60 line-clamp-2">{b.excerpt}</p>
                  <span className="text-xs text-base-content/50 mt-1">
                    ✍️ {b.author?.name} · {new Date(b.publishedAt).toLocaleDateString(locale())}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Guide CTA ---------------- */

function GuideCta() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral via-[#14453b] to-primary text-neutral-content p-10 md:p-16 text-center shadow-2xl">
          <motion.div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Compass className="w-12 h-12 mx-auto mb-4 text-accent" strokeWidth={1.5} />
          <h2 className="font-display text-2xl md:text-4xl font-extrabold mb-3">{t('home.guideCtaTitle')}</h2>
          <p className="opacity-80 max-w-xl mx-auto mb-8">{t('home.guideCtaDesc')}</p>
          <Link to="/become-guide" className="btn btn-accent btn-lg rounded-full px-10 shadow-xl shadow-accent/30">
            {t('home.guideCtaBtn')}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Home() {
  const { data: districts } = useDistricts();
  const firstDistrictSlug = districts?.[0]?.slug;
  const { data: firstDistrict } = useDistrict(firstDistrictSlug);

  // Montage: district hero + first photo of each spot (react-query dedupes
  // this fetch with the spots carousel below)
  const heroImages = useMemo(() => {
    const d = firstDistrict?.district;
    const spots = firstDistrict?.spots || [];
    return [d?.heroImageUrl, ...spots.map((s) => s.images?.[0])].filter(Boolean).slice(0, 6);
  }, [firstDistrict]);

  return (
    <div>
      <Seo
        description={t('home.heroSubtitle')}
        jsonLd={{
          '@type': 'WebSite',
          name: 'বাংলাদেশ ল্যান্ডস্কেপ',
          alternateName: 'Bangladesh Landscape',
          url: window.location.origin,
        }}
      />
      <AdBanner slot="hero-top" />
      <Hero districts={districts} images={heroImages} />
      <StatsStrip />
      <RecentlyViewed />
      <CategoryRow />
      <SeasonalPicks districts={districts} />
      <AdBanner slot="hero-bottom" />
      <DistrictShowcase districts={districts} />
      <HowItWorks />
      {firstDistrictSlug && <SpotsCarousel firstDistrictSlug={firstDistrictSlug} />}
      <BlogStrip />
      <GuideCta />
    </div>
  );
}
