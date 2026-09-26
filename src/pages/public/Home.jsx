import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  MapPin, Sparkles, Compass, ShieldCheck, ChevronDown, ArrowRight,
  ListChecks, SlidersHorizontal, FileDown, Map as MapIcon, Camera, PenLine,
} from 'lucide-react';
import api from '../../lib/axios';
import { useDistricts, useDistrict } from '../../features/districts/queries';
import { useBlogs } from '../../features/blogs/queries';
import AdBanner from '../../components/AdBanner';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import CountUp from '../../components/ui/CountUp';
import { t } from '../../i18n';

/* ---------------- Hero ---------------- */

const headlineWords = t('home.heroTitle').split(' ');

function Hero({ districts }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  function go(e) {
    e.preventDefault();
    navigate(selected ? `/districts/${selected}` : '/plan');
  }

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden bg-neutral text-neutral-content">
      {/* Layered background: gradients + slow floating glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2622] via-[#0d3a32] to-[#0a2622]" />
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

        {/* Search-style CTA card */}
        <motion.form
          onSubmit={go}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="bg-base-100/95 backdrop-blur rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto text-base-content"
        >
          <label className="flex items-center gap-2 flex-1 px-3">
            <Compass className="w-5 h-5 text-primary shrink-0" />
            <select
              className="select select-ghost w-full focus:outline-none font-medium"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label={t('home.searchDistrict')}
            >
              <option value="">{t('home.searchTitle')}</option>
              {(districts || []).map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name.bn}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary rounded-xl px-8 shadow-lg shadow-primary/30 gap-2">
            <Sparkles className="w-4 h-4" /> {t('home.searchGo')}
          </button>
        </motion.form>
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

/* ---------------- Districts showcase ---------------- */

function DistrictShowcase({ districts }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-center mb-2">{t('home.districtsTitle')}</h2>
        <p className="text-center text-base-content/60 mb-10">{t('home.districtsSubtitle')}</p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(districts || []).map((d, i) => (
          <Reveal key={d.slug} delay={i * 0.08}>
            <Link to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block">
              <figure className="h-56 relative">
                <Img src={d.heroImageUrl} alt={d.name.bn} icon={MapIcon} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-5 text-neutral-content">
                  <h3 className="font-display text-2xl font-bold">{d.name.bn}</h3>
                  <span className="text-sm opacity-80 flex items-center gap-1">
                    <ArrowRight className="w-4 h-4" /> {t('district.viewDetails')}
                  </span>
                </div>
              </figure>
            </Link>
          </Reveal>
        ))}

        {/* Coming-soon card */}
        <Reveal delay={(districts?.length || 0) * 0.08}>
          <div className="card h-56 border-2 border-dashed border-base-300 bg-base-100/50 items-center justify-center text-center p-6">
            <MapIcon className="w-10 h-10 text-base-content/25 mb-3" strokeWidth={1.5} />
            <h3 className="font-bold text-base-content/70">{t('home.moreDistrictsTitle')}</h3>
            <p className="text-sm text-base-content/50">{t('home.moreDistrictsDesc')}</p>
          </div>
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
                  <Img src={s.images?.[0]} alt={s.name.bn} icon={Camera} className="w-full h-full object-cover" />
                  {s.isHidden && (
                    <span className="absolute top-3 left-3 badge badge-secondary badge-sm shadow">💎 {t('district.hiddenGem')}</span>
                  )}
                </figure>
                <div className="card-body p-4">
                  <h3 className="font-bold">{s.name.bn}</h3>
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
                  <Img src={b.coverImageUrl} alt={b.title.bn} icon={PenLine} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body p-5">
                  <h3 className="font-bold leading-snug line-clamp-2">{b.title.bn}</h3>
                  <p className="text-sm text-base-content/60 line-clamp-2">{b.excerpt}</p>
                  <span className="text-xs text-base-content/50 mt-1">
                    ✍️ {b.author?.name} · {new Date(b.publishedAt).toLocaleDateString('bn-BD')}
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

  return (
    <div>
      <AdBanner slot="hero-top" />
      <Hero districts={districts} />
      <StatsStrip />
      <AdBanner slot="hero-bottom" />
      <DistrictShowcase districts={districts} />
      <HowItWorks />
      {firstDistrictSlug && <SpotsCarousel firstDistrictSlug={firstDistrictSlug} />}
      <BlogStrip />
      <GuideCta />
    </div>
  );
}
