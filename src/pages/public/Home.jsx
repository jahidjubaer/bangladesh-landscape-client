import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Camera, FileDown, History, Map as MapIcon, PenLine, ShieldCheck } from 'lucide-react';
import { getRecent } from '../../lib/recent';
import api from '../../lib/axios';
import { useDistricts, useDistrict } from '../../features/districts/queries';
import { useBlogs } from '../../features/blogs/queries';
import AdBanner from '../../components/AdBanner';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import CountUp from '../../components/ui/CountUp';
import HomeHero from '../../components/home/HomeHero';
import SeasonSection from '../../components/season/SeasonSection';
import { ExperienceRail, StoryBand, PlanPreview, GuidesStrip } from '../../components/home/HomeSections';
import { t, lx, locale } from '../../i18n';

// Map sections carry the district geometry; load them after the hero
const DivisionExplorer = lazy(() => import('../../components/home/MapSections').then((m) => ({ default: m.DivisionExplorer })));
const MyMapTeaser = lazy(() => import('../../components/home/MapSections').then((m) => ({ default: m.MyMapTeaser })));

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
    <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-base-300 rounded-3xl overflow-hidden shadow-xl shadow-neutral/10">
          {items.map(({ key, value, Icon }) => (
            <div key={key} className="bg-base-100 p-5 md:p-6 text-center">
              <Icon className="w-5 h-5 text-season-ink mx-auto mb-2" strokeWidth={1.8} aria-hidden />
              <div className="font-display text-3xl font-bold text-base-content">
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
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-base-content/80">
          <History className="w-5 h-5 text-season-ink" aria-hidden /> {t('recent.title')}
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((item) => (
            <Link key={item.link} to={item.link} className="shrink-0 w-44 rounded-2xl bg-base-100 shadow-sm card-lift img-zoom block overflow-hidden">
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

/* ---------------- More from the journal (after the story band) ---------------- */

function BlogStrip() {
  const { data } = useBlogs({});
  const blogs = (data?.blogs || []).slice(1, 4); // [0] leads the story band
  if (!blogs.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-16">
      <Reveal>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-title font-bold">{t('home.latestBlogs')}</h2>
          <Link to="/blog" className="font-medium flex items-center gap-1 text-season-ink hover:gap-2 transition-all">
            {t('home.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {blogs.map((b, i) => (
          <Reveal key={b.slug} delay={i * 0.08}>
            <Link to={`/blog/${b.slug}`} className="group block h-full">
              <figure className="aspect-[16/10] rounded-2xl overflow-hidden">
                <Img
                  src={b.coverImageUrl}
                  alt={lx(b.title)}
                  icon={PenLine}
                  className="w-full h-full object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
                />
              </figure>
              <h3 className="font-display text-xl font-bold leading-snug mt-4 line-clamp-2 group-hover:text-season-ink transition-colors">
                {lx(b.title)}
              </h3>
              <p className="text-sm text-base-content/60 line-clamp-2 mt-1">{b.excerpt}</p>
              <span className="text-xs text-base-content/50 mt-2 block">
                {b.author?.name} · {new Date(b.publishedAt).toLocaleDateString(locale())}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const lazyFallback = <div className="min-h-[30rem]" aria-hidden />;

export default function Home() {
  const { data: districts } = useDistricts();
  const firstDistrictSlug = districts?.[0]?.slug;
  const { data: firstDistrict } = useDistrict(firstDistrictSlug);

  // Hero montage: the lead district's photo plus its spots' first photos
  const heroImages = useMemo(() => {
    const d = firstDistrict?.district;
    const spots = firstDistrict?.spots || [];
    return [d?.heroImageUrl, ...spots.map((s) => s.images?.[0])].filter(Boolean).slice(0, 6);
  }, [firstDistrict]);

  return (
    <div>
      <Seo
        description={t('home2.heroSub')}
        jsonLd={{
          '@type': 'WebSite',
          name: 'বাংলাদেশ ল্যান্ডস্কেপ',
          alternateName: 'Bangladesh Landscape',
          url: window.location.origin,
        }}
      />
      <HomeHero districts={districts} images={heroImages} />
      <StatsStrip />
      <AdBanner slot="hero-top" />
      <RecentlyViewed />
      <SeasonSection />
      <AdBanner slot="hero-bottom" />
      <Suspense fallback={lazyFallback}>
        <DivisionExplorer launched={districts || []} />
      </Suspense>
      <ExperienceRail />
      <StoryBand />
      <BlogStrip />
      <PlanPreview />
      <GuidesStrip />
      <Suspense fallback={lazyFallback}>
        <MyMapTeaser />
      </Suspense>
    </div>
  );
}
