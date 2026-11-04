import { useState, useMemo } from 'react';
import { Link } from '../../../lib/router';
import { useQuery } from '@tanstack/react-query';
import { m as motion } from 'motion/react';
import { Compass, ArrowRight, ArrowLeft, RotateCcw, Sparkles, MapPin } from 'lucide-react';
import Seo from '../../../components/Seo';
import Img from '../../../components/ui/Img';
import Loader from '../../../components/Loader';
import api from '../../../lib/api';
import { t, lx, locale } from '../../../i18n';

// Landscapes the DB categories can't express on their own
// How strongly each coastal district delivers a 'sea' trip (beaches > islands > mangrove coast)
const COASTAL = {
  'coxs-bazar': 22, patuakhali: 17, chattogram: 13, noakhali: 11, bhola: 10, barguna: 10,
  bagerhat: 7, satkhira: 6, khulna: 6, lakshmipur: 3, feni: 3,
};
const LANDSCAPES = {
  sea: { cats: [], coastal: true },
  hill: { cats: ['hill', 'waterfall'] },
  water: { cats: ['haor', 'river'] },
  heritage: { cats: ['heritage'] },
  nature: { cats: ['garden', 'waterfall'] },
};
// Season → categories that shine then
const SEASON_BOOST = {
  monsoon: ['haor', 'waterfall', 'river', 'hill'],
  winter: ['heritage', 'garden', 'haor', 'river'],
  summer: ['heritage', 'hill', 'garden'],
};
const QUESTIONS = [
  { key: 'landscape', options: Object.keys(LANDSCAPES) },
  { key: 'season', options: Object.keys(SEASON_BOOST) },
  { key: 'days', options: ['short', 'medium', 'long'] },
  { key: 'style', options: ['adventure', 'relaxed', 'family'] },
  { key: 'from', options: null }, // district select
];
const MAX_KM = { short: 220, medium: 420, long: 9999 };
// Points lost per km travelled — short trips care most about distance
const KM_COST = { short: 1 / 25, medium: 1 / 70, long: 1 / 200 };

function km(a, b) {
  const R = (d) => (d * Math.PI) / 180;
  const h = Math.sin(R(b.lat - a.lat) / 2) ** 2 + Math.cos(R(a.lat)) * Math.cos(R(b.lat)) * Math.sin(R(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function rank(districts, answers) {
  const origin = districts.find((d) => d.slug === answers.from);
  const land = LANDSCAPES[answers.landscape];
  return districts
    .filter((d) => d.spotCount > 0 && d.slug !== answers.from)
    .map((d) => {
      const reasons = [];
      const match = land.cats.reduce((s, c) => s + (d.categories[c] || 0), 0);
      let score = match * 3;
      if (land.coastal && COASTAL[d.slug]) {
        score += COASTAL[d.slug];
        reasons.push('sea');
      } else if (match) reasons.push(answers.landscape);
      const seasonal = SEASON_BOOST[answers.season].reduce((s, c) => s + (d.categories[c] || 0), 0);
      score += seasonal;
      if (seasonal >= 2) reasons.push(`season-${answers.season}`);
      if (answers.style === 'adventure' && d.hiddenCount) {
        score += d.hiddenCount * 1.5;
        reasons.push('hidden');
      }
      if (answers.style === 'family' && (d.categories.garden || d.categories.heritage)) score += 2;
      const dist = origin ? km(origin.center, d.center) : 0;
      score -= dist * KM_COST[answers.days];
      if (dist > MAX_KM[answers.days]) score -= 8 + (dist - MAX_KM[answers.days]) / 40;
      else if (answers.days === 'short' && dist < 120) reasons.push('near');
      return { ...d, score, dist, reasons: [...new Set(reasons)] };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export default function TripMatcher() {
  const { data: districts, isLoading } = useQuery({
    queryKey: ['tools-district-profiles'],
    queryFn: async () => (await api.get('/tools/district-profiles')).data.data.districts,
    staleTime: 10 * 60 * 1000,
  });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ from: 'dhaka' });
  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done && districts ? rank(districts, answers) : []), [done, districts, answers]);

  if (isLoading) return <Loader fullScreen />;
  const q = QUESTIONS[step];
  const pick = (value) => {
    setAnswers((a) => ({ ...a, [q.key]: value }));
    setStep((s) => s + 1);
  };
  const sorted = [...(districts || [])].sort((a, b) => lx(a.name).localeCompare(lx(b.name)));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Seo title={t('tools.matcher.name')} description={t('tools.matcher.desc')} />
      <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2 mb-2">
        <Compass className="w-7 h-7 text-primary" /> {t('tools.matcher.name')}
      </h1>
      <p className="text-base-content/60 mb-6">{t('tools.matcher.desc')}</p>
      <progress className="progress progress-primary w-full mb-6" value={Math.min(step, QUESTIONS.length)} max={QUESTIONS.length} />

      {!done ? (
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="card bg-base-100 shadow-md">
          <div className="card-body gap-5">
            <h2 className="text-xl font-bold">{t(`tools.matcher.q.${q.key}`)}</h2>
            {q.options ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map((o) => (
                  <button key={o} className="btn btn-outline h-auto py-4 rounded-2xl justify-start text-left normal-case" onClick={() => pick(o)}>
                    {t(`tools.matcher.a.${q.key}.${o}`)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <select className="select select-bordered grow" value={answers.from} onChange={(e) => setAnswers((a) => ({ ...a, from: e.target.value }))}>
                  {sorted.map((d) => <option key={d.slug} value={d.slug}>{lx(d.name)}</option>)}
                </select>
                <button className="btn btn-primary rounded-full" onClick={() => setStep((s) => s + 1)}>
                  {t('tools.matcher.show')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step > 0 && (
              <button className="btn btn-ghost btn-sm w-fit rounded-full" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="w-4 h-4" /> {t('plan.back')}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('tools.matcher.results')}</h2>
          {results.map((d, i) => (
            <motion.div key={d.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
              <div className="card sm:card-side bg-base-100 shadow-md overflow-hidden">
                <figure className="sm:w-48 h-40 sm:h-auto shrink-0 relative">
                  <Img src={d.heroImageUrl} alt={lx(d.name)} icon={MapPin} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 badge badge-primary font-bold">#{i + 1}</span>
                </figure>
                <div className="card-body gap-2">
                  <h3 className="card-title">{lx(d.name)}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {d.reasons.map((r) => <span key={r} className="badge badge-ghost badge-sm">{t(`tools.matcher.why.${r}`)}</span>)}
                    <span className="badge badge-ghost badge-sm">~{Math.round(d.dist).toLocaleString(locale())} km</span>
                    <span className="badge badge-ghost badge-sm">{t('district.spotCount').replace('{n}', d.spotCount.toLocaleString(locale()))}</span>
                  </div>
                  <p className="text-sm text-base-content/65 line-clamp-2">{lx(d.bestSeason)}</p>
                  <div className="card-actions mt-1">
                    <Link to={`/districts/${d.slug}`} className="btn btn-sm btn-outline rounded-full">{t('district.viewDetails')}</Link>
                    <Link to="/plan" className="btn btn-sm btn-primary rounded-full"><Sparkles className="w-4 h-4" /> {t('home.ctaPlan')}</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <button className="btn btn-ghost rounded-full" onClick={() => setStep(0)}>
            <RotateCcw className="w-4 h-4" /> {t('tools.matcher.again')}
          </button>
        </div>
      )}
    </div>
  );
}
