import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Download, Share2, Link2, RotateCcw, Search, Eye, MapPinned, Check, Home, Footprints, Eraser, Type,
} from 'lucide-react';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from '../../features/districtMap/bdDistricts';
import {
  DIVISIONS, TOTAL, loadMap, saveMap, loadName, saveName, encodeMap, decodeMap, divisionStats,
  stateOf, setState, visitedCount, emptyMap,
} from '../../features/districtMap/visited';
import { renderShareImage } from '../../features/districtMap/shareImage';
import { STATE_FILL } from '../../features/districtMap/MiniMap';
import { t, getLang, locale } from '../../i18n';

const num = (n) => Number(n).toLocaleString(locale());
const nameOf = (d) => (getLang() === 'en' ? d.en : d.bn);

const BRUSHES = [
  { key: 'visited', Icon: Check, swatch: 'bg-primary' },
  { key: 'passed', Icon: Footprints, swatch: 'bg-amber-400' },
  { key: 'home', Icon: Home, swatch: 'bg-rose-600' },
  { key: 'erase', Icon: Eraser, swatch: 'bg-base-300' },
];
// List chips cycle through these (home is chosen from its own selector)
const CYCLE = { '': 'visited', visited: 'passed', passed: '', home: '' };
const CHIP = {
  visited: 'btn-primary',
  passed: 'bg-amber-400 border-amber-400 text-neutral hover:bg-amber-500',
  home: 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700',
  '': 'btn-ghost bg-base-200',
};
// Label colour must contrast with its district's fill
const LABEL = { visited: 'fill-white', home: 'fill-white', passed: 'fill-neutral', '': 'fill-base-content/60' };

const sameSet = (list, set) => list.length === set.size && list.every((s) => set.has(s));

export default function MyMap() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const shared = useMemo(() => decodeMap(params), [params]);
  const viewingShared = Boolean(shared);

  const [mine, setMine] = useState(loadMap);
  const [name, setName] = useState(loadName);
  const [brush, setBrush] = useState('visited');
  const [showNames, setShowNames] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const map = viewingShared ? shared : mine;
  const stats = divisionStats(map);
  const visited = visitedCount(map);
  const pct = Math.round((visited / TOTAL) * 100);

  useEffect(() => saveMap(mine), [mine]);
  useEffect(() => saveName(name), [name]);

  // Logged-in users: merge this device's map with the account copy once,
  // then keep the account in sync (debounced) so it follows them across devices
  const { user, refreshUser } = useAuth();
  const synced = useRef(false);
  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;
    setMine((prev) => {
      let next = prev;
      for (const s of user.visitedDistricts || []) if (!stateOf(next, s)) next = setState(next, s, 'visited');
      for (const s of user.passedDistricts || []) if (!stateOf(next, s)) next = setState(next, s, 'passed');
      if (!next.home && user.homeDistrict) next = setState(next, user.homeDistrict, 'home');
      return next;
    });
    if (!name && user.name) setName(user.name.split(' ')[0]);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user || !synced.current) return;
    if (
      sameSet(user.visitedDistricts || [], mine.visited) &&
      sameSet(user.passedDistricts || [], mine.passed) &&
      (user.homeDistrict || '') === mine.home
    ) return;
    const timer = setTimeout(() => {
      api
        .put('/auth/me/visited-districts', { slugs: [...mine.visited], passed: [...mine.passed], home: mine.home })
        .then(() => refreshUser())
        .catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [mine, user, refreshUser]);

  // Map tap: apply the current brush; tapping the same state again clears it
  const paint = (slug) => {
    if (viewingShared) return;
    const target = brush === 'erase' ? '' : brush;
    setMine((prev) => setState(prev, slug, stateOf(prev, slug) === target ? '' : target));
  };
  const cycle = (slug) => {
    if (viewingShared) return;
    setMine((prev) => setState(prev, slug, CYCLE[stateOf(prev, slug)]));
  };
  const setDivision = (division, on) => {
    setMine((prev) => {
      let next = prev;
      for (const d of DISTRICTS) {
        if (d.division !== division || stateOf(next, d.slug) === 'home') continue;
        next = setState(next, d.slug, on ? 'visited' : '');
      }
      return next;
    });
  };

  const imageTitle = name.trim()
    ? t('myMap.imageTitleNamed').replace('{name}', name.trim())
    : t('myMap.imageTitle');

  async function makeImage() {
    return renderShareImage(map, {
      title: imageTitle,
      count: t('myMap.districtsVisited'),
      passedCount: (n) => t('myMap.passedCount').replace('{n}', num(n)),
      legend: { visited: t('myMap.legendVisited'), passed: t('myMap.legendPassed'), home: t('myMap.legendHome') },
      divisionName: (dv) => t(`district.divisions.${dv}`),
      districtName: nameOf,
      footer: `${t('site.name')} · ${window.location.host}/my-map`,
      num,
    });
  }

  async function download() {
    setBusy(true);
    try {
      const blob = await makeImage();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-bangladesh-map-${visited}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast(t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const shareLink = () => `${window.location.origin}/my-map?${encodeMap(map)}`;

  async function share() {
    setBusy(true);
    try {
      const blob = await makeImage();
      const file = new File([blob], 'my-bangladesh-map.png', { type: 'image/png' });
      const text = `${imageTitle} — ${num(visited)}/${num(TOTAL)} ${t('myMap.districtsVisited')}`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: imageTitle, text: `${text}\n${shareLink()}` });
      } else {
        // Desktop browsers mostly can't share files — save the picture instead
        await download();
        await copyLink(true);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') toast(t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(quiet) {
    try {
      await navigator.clipboard.writeText(shareLink());
      toast(quiet ? t('myMap.savedAndCopied') : t('myMap.linkCopied'), 'success');
    } catch {
      toast(shareLink(), 'info');
    }
  }

  const clearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setMine(emptyMap());
    setConfirmClear(false);
  };

  const matches = (d) => {
    const s = q.trim().toLowerCase();
    return !s || d.en.toLowerCase().includes(s) || d.bn.includes(s);
  };
  const sortedDistricts = useMemo(() => [...DISTRICTS].sort((a, b) => nameOf(a).localeCompare(nameOf(b))), []);
  const hoveredState = hovered ? stateOf(map, hovered.slug) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Seo title={t('myMap.title')} description={t('myMap.subtitle')} />

      <Reveal>
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('myMap.title')}</h1>
          <p className="text-base-content/60">{t('myMap.subtitle')}</p>
        </div>
      </Reveal>

      {viewingShared && (
        <div role="status" className="alert bg-primary/10 border-primary/20 mb-6 flex flex-wrap justify-between">
          <span className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" /> {t('myMap.viewingShared')}
          </span>
          <button className="btn btn-primary btn-sm rounded-full" onClick={() => setParams({})}>
            {t('myMap.makeMine')}
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Map */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-3 sm:p-5 gap-3">
            {!viewingShared && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-base-content/60">{t('myMap.brush')}:</span>
                {BRUSHES.map(({ key, Icon, swatch }) => (
                  <button
                    key={key}
                    aria-pressed={brush === key}
                    onClick={() => setBrush(key)}
                    className={`btn btn-sm rounded-full gap-1.5 ${brush === key ? 'btn-neutral' : 'btn-ghost bg-base-200'}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${swatch}`} />
                    <Icon className="w-3.5 h-3.5" /> {t(`myMap.brushes.${key}`)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 min-h-8">
              <div className="font-semibold text-primary truncate">
                {hovered
                  ? `${nameOf(hovered)}${hoveredState ? ` · ${t(`myMap.legend${hoveredState[0].toUpperCase()}${hoveredState.slice(1)}`)}` : ''}`
                  : viewingShared ? '' : t('myMap.tapHint')}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className={`btn btn-xs btn-circle ${showNames ? 'btn-neutral' : 'btn-ghost'}`}
                  aria-pressed={showNames}
                  title={t('myMap.showNames')}
                  onClick={() => setShowNames((v) => !v)}
                >
                  <Type className="w-3.5 h-3.5" />
                </button>
                <div className="badge badge-primary badge-lg font-bold">
                  {num(visited)}/{num(TOTAL)}
                </div>
              </div>
            </div>
            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              className="w-full max-h-[78vh] select-none"
              role="group"
              aria-label={t('myMap.title')}
              onMouseLeave={() => setHovered(null)}
            >
              {DISTRICTS.map((d) => (
                <path
                  key={d.slug}
                  d={d.d}
                  onClick={() => paint(d.slug)}
                  onMouseEnter={() => setHovered(d)}
                  className={`stroke-base-100 transition-[fill,opacity] duration-200 hover:opacity-80 ${STATE_FILL[stateOf(map, d.slug)]} ${
                    viewingShared ? '' : 'cursor-pointer'
                  }`}
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                >
                  <title>{nameOf(d)}</title>
                </path>
              ))}
              {showNames &&
                DISTRICTS.map((d) => (
                  <text
                    key={d.slug}
                    x={d.cx}
                    y={d.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`pointer-events-none font-semibold ${LABEL[stateOf(map, d.slug)]}`}
                    style={{ fontSize: 7.5 }}
                  >
                    {nameOf(d)}
                  </text>
                ))}
            </svg>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-3 text-base-content/70">
                {['visited', 'passed', 'home'].map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded ${{ visited: 'bg-primary', passed: 'bg-amber-400', home: 'bg-rose-600' }[k]}`} />
                    {t(`myMap.legend${k[0].toUpperCase()}${k.slice(1)}`)}
                  </span>
                ))}
              </div>
              <span className="text-base-content/40">{t('myMap.attribution')}</span>
            </div>
          </div>
        </div>

        {/* Panel */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 gap-3">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold text-primary">{num(visited)}</span>
                <span className="text-base-content/60 mb-1.5">
                  / {num(TOTAL)} {t('myMap.districtsVisited')} · {num(pct)}%
                </span>
              </div>
              <progress className="progress progress-primary w-full" value={visited} max={TOTAL} />
              {map.passed.size > 0 && (
                <p className="text-sm text-base-content/70 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-amber-500" /> {t('myMap.passedCount').replace('{n}', num(map.passed.size))}
                </p>
              )}

              {!viewingShared && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="form-control">
                    <span className="label-text text-sm mb-1">{t('myMap.yourName')}</span>
                    <input
                      className="input input-bordered input-sm"
                      maxLength={30}
                      value={name}
                      placeholder={t('myMap.namePlaceholder')}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-sm mb-1 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-rose-600" /> {t('myMap.homeDistrict')}
                    </span>
                    <select
                      className="select select-bordered select-sm"
                      value={mine.home}
                      onChange={(e) =>
                        setMine((prev) => (e.target.value ? setState(prev, e.target.value, 'home') : setState(prev, prev.home, '')))
                      }
                    >
                      <option value="">—</option>
                      {sortedDistricts.map((d) => <option key={d.slug} value={d.slug}>{nameOf(d)}</option>)}
                    </select>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-primary rounded-full" disabled={busy} onClick={share}>
                  <Share2 className="w-4 h-4" /> {t('myMap.share')}
                </button>
                <button className="btn btn-outline rounded-full" disabled={busy} onClick={download}>
                  <Download className="w-4 h-4" /> {t('myMap.download')}
                </button>
                <button className="btn btn-ghost btn-sm rounded-full" onClick={() => copyLink(false)}>
                  <Link2 className="w-4 h-4" /> {t('myMap.copyLink')}
                </button>
                {!viewingShared && (
                  <button
                    className={`btn btn-ghost btn-sm rounded-full ${confirmClear ? 'text-error' : ''}`}
                    disabled={!visited && !mine.passed.size}
                    onClick={clearAll}
                  >
                    <RotateCcw className="w-4 h-4" /> {confirmClear ? t('myMap.confirmClear') : t('myMap.clear')}
                  </button>
                )}
              </div>
              {!viewingShared && (
                <p className="text-xs text-base-content/50 text-center">
                  {user ? (
                    t('myMap.savedToAccount')
                  ) : (
                    <Link to="/login" className="link link-primary">{t('myMap.loginToSave')}</Link>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 gap-3">
              <label className="input input-bordered input-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-base-content/40" />
                <input
                  className="grow bg-transparent focus:outline-none"
                  placeholder={t('district.searchPlaceholder')}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              {!viewingShared && <p className="text-xs text-base-content/50">{t('myMap.chipHint')}</p>}

              <div className="max-h-[52vh] overflow-y-auto -mx-1 px-1 space-y-4">
                {DIVISIONS.map((division) => {
                  const list = DISTRICTS.filter((d) => d.division === division && matches(d));
                  if (!list.length) return null;
                  const s = stats.find((x) => x.division === division);
                  const all = s.visited === s.total;
                  return (
                    <div key={division}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">
                          {t(`district.divisions.${division}`)}{' '}
                          <span className="text-base-content/50 font-normal">
                            {num(s.visited)}/{num(s.total)}
                          </span>
                        </span>
                        {!viewingShared && (
                          <button className="link link-primary text-xs" onClick={() => setDivision(division, !all)}>
                            {all ? t('myMap.unselectAll') : t('myMap.selectAll')}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((d) => {
                          const state = stateOf(map, d.slug);
                          return (
                            <button
                              key={d.slug}
                              disabled={viewingShared}
                              onClick={() => cycle(d.slug)}
                              title={state ? t(`myMap.legend${state[0].toUpperCase()}${state.slice(1)}`) : ''}
                              className={`btn btn-xs rounded-full font-medium border ${CHIP[state]} disabled:opacity-100`}
                            >
                              {state === 'visited' && <Check className="w-3 h-3" />}
                              {state === 'passed' && <Footprints className="w-3 h-3" />}
                              {state === 'home' && <Home className="w-3 h-3" />}
                              {nameOf(d)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Link to="/districts" className="btn btn-ghost btn-sm w-full rounded-full">
            <MapPinned className="w-4 h-4" /> {t('myMap.exploreNext')}
          </Link>
        </div>
      </div>
    </div>
  );
}
