import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, PenLine, MapPin, Route, FileDown, Star, BadgeCheck, Languages } from 'lucide-react';
import api from '../../lib/axios';
import { CATEGORIES } from '../../lib/categories';
import { useBlogs } from '../../features/blogs/queries';
import SeasonSpotCard from '../season/SeasonSpotCard';
import Img from '../ui/Img';
import Scene from '../ui/Scene';
import Reveal from '../ui/Reveal';
import { Skeleton } from '../ui/Skeleton';
import { t, lx, getLang } from '../../i18n';

const num = (n) => Number(n).toLocaleString(getLang() === 'bn' ? 'bn-BD' : 'en-GB');

/* ---------------- Experiences: tabbed horizontal rail ---------------- */

const EXP_TYPES = CATEGORIES.filter((c) => c.key !== 'other');

export function ExperienceRail() {
  const [cat, setCat] = useState(EXP_TYPES[0].key);
  const rail = useRef(null);
  const { data, isLoading } = useQuery({
    queryKey: ['exp-rail', cat],
    queryFn: async () => (await api.get('/spots', { params: { category: cat, limit: 10 } })).data.data.spots,
    staleTime: 5 * 60 * 1000,
  });
  const scroll = (dir) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' });
  const catName = t(`spot.category.${cat}`);

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('home2.expEyebrow')}</p>
              <h2 className="font-display text-display font-bold mt-2">{t('home2.expTitle')}</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll(-1)} aria-label={t('home2.prev')} className="btn btn-circle btn-outline border-base-300">
                <ArrowLeft className="w-5 h-5" aria-hidden />
              </button>
              <button onClick={() => scroll(1)} aria-label={t('home2.next')} className="btn btn-circle btn-outline border-base-300">
                <ArrowRight className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>

        <div role="tablist" aria-label={t('home2.expEyebrow')} className="flex gap-2 overflow-x-auto no-scrollbar mt-7 mb-6 pb-1">
          {EXP_TYPES.map(({ key, Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={key === cat}
              aria-controls="exp-rail"
              onClick={() => setCat(key)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium border transition-colors ${
                key === cat ? 'bg-base-content text-base-100 border-base-content' : 'border-base-300 hover:border-base-content/50'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden /> {t(`spot.category.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div
        id="exp-rail"
        ref={rail}
        role="tabpanel"
        className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))] pb-2"
      >
        {isLoading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="shrink-0 w-[78vw] sm:w-[22rem] min-h-[26rem] rounded-3xl" />)
          : (data || []).map((s) => (
              <div key={s._id} className="shrink-0 w-[78vw] sm:w-[22rem] snap-start">
                <SeasonSpotCard spot={s} />
              </div>
            ))}
        {!isLoading && (
          <Link
            to={`/explore?cat=${cat}`}
            className="shrink-0 w-[60vw] sm:w-64 snap-start rounded-3xl border-2 border-dashed border-base-300 grid place-items-center text-center p-6 hover:border-season hover:text-season-ink transition-colors"
          >
            <span className="font-display text-xl font-bold">
              {t('home2.seeAllType').replace('{x}', catName)}
              <ArrowRight className="w-6 h-6 mx-auto mt-3" aria-hidden />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

/* ---------------- Story band: latest journal post, full bleed ---------------- */

export function StoryBand() {
  const { data } = useBlogs({});
  const post = data?.blogs?.[0];
  // The parallax hook needs its target mounted, so it lives in the inner component
  return post ? <StoryBandInner post={post} /> : null;
}

function StoryBandInner({ post }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section ref={ref} className="relative min-h-[80vh] flex items-center overflow-hidden text-white bg-[#0a2622]">
      <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0" aria-hidden>
        <Img src={post.coverImageUrl} alt="" icon={PenLine} scene="haor" className="w-full h-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a2622]/90 via-[#0a2622]/55 to-transparent" />
      <div className="relative max-w-7xl mx-auto w-full px-4 py-24">
        <Reveal>
          <p className="eyebrow !text-white/75">{t('home2.storyEyebrow')}</p>
          <h2 className="font-display text-display font-semibold max-w-[18ch] mt-4">{lx(post.title)}</h2>
          {post.excerpt && <p className="text-lg text-white/85 max-w-xl mt-4 line-clamp-3">{post.excerpt}</p>}
          <div className="flex items-center gap-3 mt-6 text-white/85">
            <span className="w-11 h-11 rounded-full bg-season grid place-items-center font-bold text-white" aria-hidden>
              {(post.author?.name || '?').charAt(0)}
            </span>
            <span>
              <span className="block font-semibold text-white">{post.author?.name}</span>
              {post.publishedAt && (
                <span className="text-sm">{new Date(post.publishedAt).toLocaleDateString(getLang() === 'bn' ? 'bn-BD' : 'en-GB')}</span>
              )}
            </span>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 mt-8 font-semibold border-b-2 border-season-bright pb-1 hover:gap-3 transition-all"
          >
            {t('home2.storyRead')} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- AI plan preview: sample card ---------------- */

const COSTS = [
  { key: 'costTransport', bdt: 1600, color: '#0d7a68' },
  { key: 'costStay', bdt: 2500, color: '#0a6a8a' },
  { key: 'costFood', bdt: 900, color: '#d97706' },
  { key: 'costFees', bdt: 400, color: '#e8590c' },
];

export function PlanPreview() {
  const total = COSTS.reduce((n, c) => n + c.bdt, 0);
  const steps = [
    { Icon: MapPin, title: 'planStep1', sub: 'planStep1s' },
    { Icon: Route, title: 'planStep2', sub: 'planStep2s' },
    { Icon: FileDown, title: 'planStep3', sub: 'planStep3s' },
  ];
  const timeline = [
    ['day1m', 'sampleD1a'],
    ['day1a', 'sampleD1b'],
    ['day1n', 'sampleD1c'],
    ['day2m', 'sampleD2a'],
    ['day2e', 'sampleD2b'],
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center">
      <Reveal>
        <p className="eyebrow">{t('home2.planEyebrow')}</p>
        <h2 className="font-display text-display font-bold mt-2">{t('home2.planTitle')}</h2>
        <p className="text-base-content/65 text-lg mt-3 max-w-xl">{t('home2.planSub')}</p>
        <ol className="mt-8 space-y-4">
          {steps.map(({ Icon, title, sub }) => (
            <li key={title} className="flex gap-4">
              <span className="shrink-0 w-11 h-11 rounded-2xl bg-season-soft text-season-ink grid place-items-center">
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">{t(`home2.${title}`)}</span>
                <span className="text-base-content/60 text-sm">{t(`home2.${sub}`)}</span>
              </span>
            </li>
          ))}
        </ol>
        <Link to="/plan" className="btn bg-season hover:brightness-110 text-white border-0 rounded-full px-8 mt-9 gap-2 shadow-lg">
          {t('home2.planCta')} <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </Reveal>

      <Reveal delay={0.1}>
        <figure className="rounded-[1.75rem] bg-base-100 shadow-2xl shadow-neutral/20 ring-1 ring-base-300 overflow-hidden lg:-rotate-1 lg:hover:rotate-0 transition-transform duration-700 ease-brand">
          <div className="relative h-36 text-white">
            <Scene type="haor" className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5">
              <span className="text-xs text-white/85">
                {t('home2.sample')} · {t('home2.sampleMeta')}
              </span>
              <span className="block font-display text-2xl font-bold">{t('home2.sampleTitle')}</span>
            </figcaption>
          </div>
          <div className="p-5 md:p-6 grid sm:grid-cols-[1.2fr_1fr] gap-6">
            <ol className="relative ps-6 before:absolute before:start-[7px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-base-300">
              {timeline.map(([when, what]) => (
                <li key={when} className="relative pb-3.5 text-sm">
                  <span className="absolute -start-6 top-1 w-4 h-4 rounded-full bg-base-100 border-[3px] border-season" aria-hidden />
                  <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-season-ink">{t(`home2.${when}`)}</span>
                  {t(`home2.${what}`)}
                </li>
              ))}
            </ol>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/55">{t('home2.costPer')}</p>
              <div className="flex h-2 rounded-full overflow-hidden my-3" aria-hidden>
                {COSTS.map((c) => (
                  <span key={c.key} style={{ flex: c.bdt, background: c.color }} />
                ))}
              </div>
              <dl className="text-sm">
                {COSTS.map((c) => (
                  <div key={c.key} className="flex justify-between gap-2 py-1.5 border-b border-dashed border-base-300">
                    <dt className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} aria-hidden />
                      {t(`home2.${c.key}`)}
                    </dt>
                    <dd className="tabular-nums">৳{num(c.bdt)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-2 pt-3 font-bold">
                  <dt>{t('home2.total')}</dt>
                  <dd className="font-display text-xl text-season-ink tabular-nums">৳{num(total)}</dd>
                </div>
              </dl>
              <p className="text-[0.7rem] text-base-content/50 mt-3">{t('home2.sampleNote')}</p>
            </div>
          </div>
        </figure>
      </Reveal>
    </section>
  );
}

/* ---------------- Verified guides ---------------- */

export function GuidesStrip() {
  const { data, isLoading } = useQuery({
    queryKey: ['guides-featured'],
    queryFn: async () => (await api.get('/guides/featured', { params: { limit: 4 } })).data.data.guides,
    staleTime: 10 * 60 * 1000,
  });
  if (!isLoading && !data?.length) return null;

  return (
    <section className="bg-base-200 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('home2.guidesEyebrow')}</p>
              <h2 className="font-display text-display font-bold mt-2 max-w-2xl">{t('home2.guidesTitle')}</h2>
            </div>
            <Link to="/guides" className="btn rounded-full bg-base-content text-base-100 border-0 hover:brightness-125 px-6 gap-2">
              {t('home2.guidesAll')} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-9">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />)
            : data.map((g, i) => (
                <Reveal key={g.id} delay={i * 0.06}>
                  <Link to={`/guides/${g.id}`} className="group block rounded-3xl bg-base-100 border border-base-300 overflow-hidden card-lift h-full">
                    <div className="relative aspect-[4/4.2] overflow-hidden">
                      <Img
                        src={g.photoUrl || g.user?.avatarUrl}
                        alt={g.user?.name || ''}
                        scene="river"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-base-100/95 text-success text-xs font-bold px-2.5 py-1">
                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden /> {t('home2.verified')}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold truncate">{g.user?.name}</p>
                      <p className="text-sm text-base-content/60 truncate">
                        {(g.districts || []).map((d) => lx(d.name)).filter(Boolean).slice(0, 2).join(' · ')}
                      </p>
                      {g.languages?.length > 0 && (
                        <p className="text-xs text-base-content/55 mt-1 flex items-center gap-1 truncate">
                          <Languages className="w-3.5 h-3.5 shrink-0" aria-hidden /> {g.languages.map((l) => t(`guide.lang.${l}`)).join(' · ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
                          {g.ratingCount > 0 ? num(g.ratingAvg.toFixed(1)) : '—'}
                        </span>
                        {g.dailyRate > 0 && (
                          <span className="font-semibold">
                            ৳{num(g.dailyRate)}
                            <span className="font-normal text-base-content/55">{t('home2.perDay')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
        </div>
        <p className="mt-8 text-center">
          <Link to="/become-guide" className="link link-hover text-season-ink font-medium">
            {t('home2.becomeGuide')}
          </Link>
        </p>
      </div>
    </section>
  );
}
