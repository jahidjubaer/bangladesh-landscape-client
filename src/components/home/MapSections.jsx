// Below-the-fold home sections that need the district geometry (~130 KB);
// Home lazy-loads this module so the hero does not wait for it.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from '../../features/districtMap/bdDistricts';
import { DIVISIONS, loadMap, stateOf } from '../../features/districtMap/visited';
import MiniMap from '../../features/districtMap/MiniMap';
import Reveal from '../ui/Reveal';
import { t, lx, getLang } from '../../i18n';

const num = (n) => Number(n).toLocaleString(getLang() === 'bn' ? 'bn-BD' : 'en-GB');
const fill = (s, vars) => Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s);

/* ---------------- Explore by division ---------------- */

export function DivisionExplorer({ launched = [] }) {
  const [active, setActive] = useState('Sylhet');
  const launchedSet = useMemo(() => new Set(launched.map((d) => d.slug)), [launched]);
  const byDivision = useMemo(() => {
    const m = Object.fromEntries(DIVISIONS.map((dv) => [dv, { total: 0, open: [] }]));
    DISTRICTS.forEach((d) => m[d.division] && (m[d.division].total += 1));
    launched.forEach((d) => m[d.division]?.open.push(d));
    return m;
  }, [launched]);
  const info = byDivision[active];
  const spots = info.open.reduce((n, d) => n + (d.spotCount || 0), 0);
  const divName = t(`district.divisions.${active}`);

  return (
    <section className="bg-base-200 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center">
        <div>
          <Reveal>
            <p className="eyebrow">{t('home2.divEyebrow')}</p>
            <h2 className="font-display text-display font-bold mt-2">{t('home2.divTitle')}</h2>
            <p className="text-base-content/65 text-lg mt-3 max-w-xl">{t('home2.divSub')}</p>
          </Reveal>

          {/* Accessible control: the map mirrors these buttons */}
          <div role="tablist" aria-label={t('home2.divEyebrow')} className="flex flex-wrap gap-2 mt-7">
            {DIVISIONS.map((dv) => (
              <button
                key={dv}
                role="tab"
                aria-selected={dv === active}
                aria-controls="division-panel"
                onClick={() => setActive(dv)}
                onMouseEnter={() => setActive(dv)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                  dv === active ? 'bg-season text-white border-transparent' : 'bg-base-100 border-base-300 hover:border-season'
                }`}
              >
                {t(`district.divisions.${dv}`)}
              </button>
            ))}
          </div>

          <div id="division-panel" role="tabpanel" aria-live="polite" className="mt-6 rounded-3xl bg-base-100 border border-base-300 p-6 md:p-7">
            <h3 className="font-display text-title font-bold">{divName}</h3>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 mt-3">
              {[
                [fill(t('home2.divDistricts'), { n: num(info.total) })],
                [fill(t('home2.divOpen'), { n: num(info.open.length) })],
                spots > 0 && [fill(t('home2.divSpots'), { n: num(spots) })],
              ]
                .filter(Boolean)
                .map(([label]) => (
                  <dd key={label} className="text-base-content/70">
                    {label}
                  </dd>
                ))}
            </dl>
            {info.open.length ? (
              <ul className="flex flex-wrap gap-2 mt-5">
                {info.open.map((d) => (
                  <li key={d.slug}>
                    <Link
                      to={`/districts/${d.slug}`}
                      className="inline-block rounded-full border border-base-300 px-3.5 py-1.5 text-sm hover:border-season hover:text-season-ink transition-colors"
                    >
                      {lx(d.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-base-content/60">{t('home2.divNone')}</p>
            )}
            <Link
              to={`/districts?division=${active}`}
              className="mt-5 inline-flex items-center gap-1.5 font-semibold text-season-ink hover:gap-2.5 transition-all"
            >
              {fill(t('home2.divOpenAll'), { x: divName })} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>

        <Reveal delay={0.1}>
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full max-w-[520px] mx-auto h-auto drop-shadow-xl"
            aria-hidden="true"
          >
            {DISTRICTS.map((d) => {
              const on = d.division === active;
              const open = launchedSet.has(d.slug);
              return (
                <path
                  key={d.slug}
                  d={d.d}
                  onMouseEnter={() => setActive(d.division)}
                  onClick={() => setActive(d.division)}
                  className={`stroke-base-100 cursor-pointer transition-[fill,opacity] duration-300 ${
                    on ? (open ? 'fill-season' : 'fill-season/45') : open ? 'fill-base-content/25' : 'fill-base-content/10'
                  } hover:opacity-85`}
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- My Bangladesh Map teaser ---------------- */

export function MyMapTeaser() {
  const [map] = useState(loadMap);
  const visited = DISTRICTS.filter((d) => stateOf(map, d.slug) === 'visited' || stateOf(map, d.slug) === 'home').length;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0a2622] text-[#e2efeb] p-8 md:p-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow !text-season-bright">{t('home2.mapEyebrow')}</p>
            <h2 className="font-display text-display font-bold text-white mt-2">
              {visited ? fill(t('home2.mapTitleN'), { n: num(visited) }) : t('home2.mapTitleZero')}
            </h2>
            <p className="text-[#b9d3cc] text-lg mt-3 max-w-lg">{t('home2.mapSub')}</p>
            <ul className="flex flex-wrap gap-4 mt-5 text-sm text-[#b9d3cc]">
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary" />{t('home2.legendVisited')}</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-600" />{t('home2.legendHome')}</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-400" />{t('home2.legendPassed')}</li>
            </ul>
            <Link to="/my-map" className="btn bg-season hover:brightness-110 text-white border-0 rounded-full px-7 mt-8 gap-2">
              {t('home2.mapCta')} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <MiniMap map={map} className="w-full max-w-sm mx-auto h-auto [&_path]:stroke-[#0a2622]" />
        </div>
      </Reveal>
    </section>
  );
}
