import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from './bdDistricts';
import { TOTAL, divisionStats, stateOf, visitedCount } from './visited';

// 4:5 portrait — the size Facebook/Instagram feeds show uncropped
const W = 1080;
const H = 1350;

export const STATE_COLORS = {
  visited: '#0d7a68',
  passed: '#f59e0b',
  home: '#e11d48',
  '': '#d5ece6',
};
const COLORS = {
  bgTop: '#f0fdf9',
  bgBottom: '#ccfbf1',
  ink: '#0f172a',
  muted: '#475569',
  primary: '#0d7a68',
  border: '#ffffff',
  barTrack: '#b8e3d8',
};

const SANS = "'Noto Sans Bengali', system-ui, sans-serif";
const SERIF = "'Noto Serif Bengali', 'Noto Sans Bengali', serif";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// labels: { title, count, passedCount(n), legend:{visited,passed,home}, divisionName(div), districtName(d), footer, num(n) }
export async function renderShareImage(map, labels) {
  // Canvas only uses web fonts that are already loaded
  await Promise.all([
    document.fonts.load(`800 64px ${SERIF}`, 'বাংলাদেশ'),
    document.fonts.load(`600 28px ${SANS}`, 'বাংলাদেশ'),
  ]).catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, COLORS.bgTop);
  bg.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 56px ${SERIF}`;
  ctx.textBaseline = 'top';
  ctx.fillText(labels.title, 64, 60, W - 128);

  const visited = visitedCount(map);
  const pct = Math.round((visited / TOTAL) * 100);
  ctx.fillStyle = COLORS.primary;
  ctx.font = `800 104px ${SANS}`;
  const big = `${labels.num(visited)}/${labels.num(TOTAL)}`;
  ctx.fillText(big, 64, 140);
  const bigW = ctx.measureText(big).width;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 32px ${SANS}`;
  ctx.fillText(`${labels.count} · ${labels.num(pct)}%`, 64 + bigW + 24, 160, W - bigW - 140);
  if (map.passed.size) ctx.fillText(labels.passedCount(map.passed.size), 64 + bigW + 24, 204, W - bigW - 140);

  // Map, left column
  const mapH = 940;
  const scale = mapH / MAP_HEIGHT;
  const mapW = MAP_WIDTH * scale;
  const mapX = 40;
  const mapY = 300;
  ctx.save();
  ctx.translate(mapX, mapY);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.border;
  ctx.shadowColor = 'rgba(13, 122, 104, 0.18)';
  ctx.shadowBlur = 24;
  for (const d of DISTRICTS) {
    ctx.fillStyle = STATE_COLORS[stateOf(map, d.slug)];
    ctx.fill(new Path2D(d.d));
  }
  ctx.shadowBlur = 0;
  for (const d of DISTRICTS) ctx.stroke(new Path2D(d.d));

  // Names on marked districts (all 64 would be unreadable at this size)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 10px ${SANS}`;
  ctx.lineWidth = 2;
  for (const d of DISTRICTS) {
    const state = stateOf(map, d.slug);
    if (!state) continue;
    const name = labels.districtName(d);
    const light = state !== 'passed';
    ctx.strokeStyle = light ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.85)';
    ctx.strokeText(name, d.cx, d.cy);
    ctx.fillStyle = light ? '#ffffff' : COLORS.ink;
    ctx.fillText(name, d.cx, d.cy);
  }
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Legend + division progress, right column
  const colX = mapX + mapW + 36;
  const colW = W - colX - 56;
  let y = 300;
  for (const key of ['visited', 'passed', 'home']) {
    if (key === 'passed' && !map.passed.size) continue;
    if (key === 'home' && !map.home) continue;
    roundRect(ctx, colX, y + 4, 26, 26, 7);
    ctx.fillStyle = STATE_COLORS[key];
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = `600 24px ${SANS}`;
    ctx.fillText(labels.legend[key], colX + 38, y + 2, colW - 38);
    y += 40;
  }
  y += 24;
  const rowH = Math.min(100, (1240 - y) / 8);
  for (const s of divisionStats(map)) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 26px ${SANS}`;
    ctx.fillText(labels.divisionName(s.division), colX, y, colW - 90);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `600 24px ${SANS}`;
    const frac = `${labels.num(s.visited)}/${labels.num(s.total)}`;
    ctx.fillText(frac, colX + colW - ctx.measureText(frac).width, y + 2);
    roundRect(ctx, colX, y + 40, colW, 12, 6);
    ctx.fillStyle = COLORS.barTrack;
    ctx.fill();
    if (s.visited) {
      roundRect(ctx, colX, y + 40, Math.max(12, (colW * s.visited) / s.total), 12, 6);
      ctx.fillStyle = COLORS.primary;
      ctx.fill();
    }
    y += rowH;
  }

  // Footer brand strip
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, H - 84, W, 84);
  ctx.fillStyle = '#f0fdf9';
  ctx.font = `700 30px ${SANS}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(labels.footer, 64, H - 42, W - 128);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
