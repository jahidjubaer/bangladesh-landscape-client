import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from './bdDistricts';
import { TOTAL, divisionStats } from './visited';

// 4:5 portrait — the size Facebook/Instagram feeds show uncropped
const W = 1080;
const H = 1350;

const COLORS = {
  bgTop: '#f0fdf9',
  bgBottom: '#ccfbf1',
  ink: '#0f172a',
  muted: '#475569',
  primary: '#0d7a68',
  visited: '#0d7a68',
  unvisited: '#d5ece6',
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

// labels: { title, count, divisionName(div), footer, num(n) }
export async function renderShareImage(visited, labels) {
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

  const pct = Math.round((visited.size / TOTAL) * 100);
  ctx.fillStyle = COLORS.primary;
  ctx.font = `800 104px ${SANS}`;
  const big = `${labels.num(visited.size)}/${labels.num(TOTAL)}`;
  ctx.fillText(big, 64, 140);
  const bigW = ctx.measureText(big).width;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 32px ${SANS}`;
  ctx.fillText(labels.count, 64 + bigW + 24, 170);
  ctx.fillText(`${labels.num(pct)}%`, 64 + bigW + 24, 214);

  // Map, left column
  const mapH = 940;
  const mapW = (MAP_WIDTH / MAP_HEIGHT) * mapH;
  const mapX = 40;
  const mapY = 300;
  ctx.save();
  ctx.translate(mapX, mapY);
  ctx.scale(mapH / MAP_HEIGHT, mapH / MAP_HEIGHT);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.border;
  ctx.shadowColor = 'rgba(13, 122, 104, 0.18)';
  ctx.shadowBlur = 24;
  for (const d of DISTRICTS) {
    const path = new Path2D(d.d);
    ctx.fillStyle = visited.has(d.slug) ? COLORS.visited : COLORS.unvisited;
    ctx.fill(path);
  }
  ctx.shadowBlur = 0;
  for (const d of DISTRICTS) ctx.stroke(new Path2D(d.d));
  ctx.restore();

  // Division progress, right column
  const colX = mapX + mapW + 36;
  const colW = W - colX - 56;
  let y = 360;
  for (const s of divisionStats(visited)) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 28px ${SANS}`;
    ctx.fillText(labels.divisionName(s.division), colX, y, colW - 90);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `600 26px ${SANS}`;
    const frac = `${labels.num(s.visited)}/${labels.num(s.total)}`;
    ctx.fillText(frac, colX + colW - ctx.measureText(frac).width, y + 2);
    roundRect(ctx, colX, y + 46, colW, 14, 7);
    ctx.fillStyle = COLORS.barTrack;
    ctx.fill();
    if (s.visited) {
      roundRect(ctx, colX, y + 46, Math.max(14, (colW * s.visited) / s.total), 14, 7);
      ctx.fillStyle = COLORS.primary;
      ctx.fill();
    }
    y += 108;
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
