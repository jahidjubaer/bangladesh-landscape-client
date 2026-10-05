import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Share2, Link2, RotateCcw, Search, Eye, MapPinned, Check } from 'lucide-react';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
import { useToast } from '../../components/ui/Toast';
import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from '../../features/districtMap/bdDistricts';
import {
  DIVISIONS, TOTAL, loadVisited, saveVisited, loadName, saveName,
  encodeVisited, decodeVisited, divisionStats,
} from '../../features/districtMap/visited';
import { renderShareImage } from '../../features/districtMap/shareImage';
import { t, getLang, locale } from '../../i18n';

const num = (n) => Number(n).toLocaleString(locale());
const nameOf = (d) => (getLang() === 'en' ? d.en : d.bn);

export default function MyMap() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const shared = useMemo(() => decodeVisited(params.get('v')), [params]);
  const viewingShared = Boolean(shared);

  const [mine, setMine] = useState(loadVisited);
  const [name, setName] = useState(loadName);
  const [hovered, setHovered] = useState(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const visited = viewingShared ? shared : mine;
  const stats = divisionStats(visited);
  const pct = Math.round((visited.size / TOTAL) * 100);

  useEffect(() => saveVisited(mine), [mine]);
  useEffect(() => saveName(name), [name]);

  const toggle = (slug) => {
    if (viewingShared) return;
    setMine((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const setDivision = (division, on) => {
    setMine((prev) => {
      const next = new Set(prev);
      for (const d of DISTRICTS) if (d.division === division) on ? next.add(d.slug) : next.delete(d.slug);
      return next;
    });
  };

  const imageTitle = name.trim()
    ? t('myMap.imageTitleNamed').replace('{name}', name.trim())
    : t('myMap.imageTitle');

  async function makeImage() {
    return renderShareImage(visited, {
      title: imageTitle,
      count: t('myMap.districtsVisited'),
      divisionName: (dv) => t(`district.divisions.${dv}`),
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
      a.download = `my-bangladesh-map-${visited.size}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast(t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const shareLink = () => `${window.location.origin}/my-map?v=${encodeVisited(visited)}`;

  async function share() {
    setBusy(true);
    try {
      const blob = await makeImage();
      const file = new File([blob], 'my-bangladesh-map.png', { type: 'image/png' });
      const text = `${imageTitle} — ${num(visited.size)}/${num(TOTAL)} ${t('myMap.districtsVisited')}`;
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
    setMine(new Set());
    setConfirmClear(false);
  };

  const matches = (d) => {
    const s = q.trim().toLowerCase();
    return !s || d.en.toLowerCase().includes(s) || d.bn.includes(s);
  };

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
          <div className="card-body p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3 min-h-8">
              <div className="font-semibold text-primary truncate">
                {hovered ? nameOf(hovered) : viewingShared ? '' : t('myMap.tapHint')}
              </div>
              <div className="badge badge-primary badge-lg font-bold shrink-0">
                {num(visited.size)}/{num(TOTAL)}
              </div>
            </div>
            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              className="w-full max-h-[78vh] select-none"
              role="group"
              aria-label={t('myMap.title')}
              onMouseLeave={() => setHovered(null)}
            >
              {DISTRICTS.map((d) => {
                const on = visited.has(d.slug);
                return (
                  <path
                    key={d.slug}
                    d={d.d}
                    onClick={() => toggle(d.slug)}
                    onMouseEnter={() => setHovered(d)}
                    className={`stroke-base-100 transition-colors duration-200 ${
                      on ? 'fill-primary hover:fill-primary/85' : 'fill-primary/15 hover:fill-primary/35'
                    } ${viewingShared ? '' : 'cursor-pointer'}`}
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                  >
                    <title>{nameOf(d)}</title>
                  </path>
                );
              })}
            </svg>
            <p className="text-xs text-base-content/40 text-right">{t('myMap.attribution')}</p>
          </div>
        </div>

        {/* Panel */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 gap-3">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold text-primary">{num(visited.size)}</span>
                <span className="text-base-content/60 mb-1.5">
                  / {num(TOTAL)} {t('myMap.districtsVisited')} · {num(pct)}%
                </span>
              </div>
              <progress className="progress progress-primary w-full" value={visited.size} max={TOTAL} />

              {!viewingShared && (
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
                    disabled={!mine.size}
                    onClick={clearAll}
                  >
                    <RotateCcw className="w-4 h-4" /> {confirmClear ? t('myMap.confirmClear') : t('myMap.clear')}
                  </button>
                )}
              </div>
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
                          const on = visited.has(d.slug);
                          return (
                            <button
                              key={d.slug}
                              aria-pressed={on}
                              disabled={viewingShared}
                              onClick={() => toggle(d.slug)}
                              className={`btn btn-xs rounded-full font-medium ${on ? 'btn-primary' : 'btn-ghost bg-base-200'} disabled:opacity-100`}
                            >
                              {on && <Check className="w-3 h-3" />}
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
