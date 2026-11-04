// Illustrated landscape scenes (pure SVG strings) used as image placeholders
// until real photos exist. Deterministic: the same type always draws the same picture.

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function ridge(w, h, base, amp, seed, steps) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push([(i * w) / steps, base - r() * amp]);
  let d = `M0 ${h} L0 ${base}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    d += ` Q${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`;
  }
  return `${d} L${w} ${pts[pts.length - 1][1]} L${w} ${h} Z`;
}

const PALETTES = {
  haor: { sky: ['#1b4d5c', '#e9a86b', '#f6d6a2'], sun: ['#fff3d1', 1050, 470], hills: ['#3d6a73', '#2c5560'], water: ['#5a8f95', '#173f45'], extra: 'boat' },
  river: { sky: ['#5b86a8', '#c9dce4', '#f3ead2'], sun: ['#fffaf0', 380, 330], hills: ['#7d9c88'], water: ['#6d9aa8', '#2b5a6a'], extra: 'sail' },
  tea: { sky: ['#9fd0d8', '#dff0e8', '#f4f7ec'], sun: ['#fffbe8', 300, 200], hills: ['#7fae74', '#4f8a4e', '#2f6b35'], extra: 'tea' },
  garden: { sky: ['#c58a2a', '#f1c878', '#fbecc4'], sun: ['#fff4d6', 1150, 320], hills: ['#a8963e', '#7d7a2c'], extra: 'paddy' },
  mangrove: { sky: ['#30514a', '#9cb896', '#d7e3c6'], sun: ['#f3f7da', 800, 330], hills: ['#5d7d63'], water: ['#6f8f84', '#1d3b34'], extra: 'mangrove' },
  sea: { sky: ['#2f8fc4', '#9ad3e8', '#f5e6c7'], sun: ['#fff7df', 1200, 300], water: ['#2a9bb8', '#0e5e7c'], extra: 'beach' },
  heritage: { sky: ['#7a3e1d', '#e08a3c', '#f5cf87'], sun: ['#ffe6b0', 800, 520], hills: ['#b06a35'], extra: 'temple' },
  kash: { sky: ['#4f7fc4', '#a8c6ec', '#eaf2fb'], sun: ['#ffffff', 1250, 220], hills: ['#8fae8a', '#6b915f'], extra: 'kash' },
  fog: { sky: ['#8a96a3', '#c9d0d6', '#eef0f1'], sun: ['#ffffffaa', 700, 380], hills: ['#9aa6ad', '#7f8d92', '#5c6c70'], extra: 'fog' },
  shimul: { sky: ['#f2b5a5', '#fbd9c4', '#fff3e6'], sun: ['#fff7ec', 350, 300], hills: ['#b7a27d', '#8c8a5a'], extra: 'shimul' },
  hill: { sky: ['#243b55', '#6f7fa8', '#e8b98f'], sun: ['#ffe2b8', 1100, 420], hills: ['#3e4f72', '#2d3c5a', '#1d2a42'], extra: 'clouds' },
  waterfall: { sky: ['#47705f', '#a9c9b0', '#e5efe2'], sun: ['#f7fbef', 1250, 250], hills: ['#5f8a68', '#3c6a4a', '#24503a'], extra: 'falls' },
  food: { sky: ['#5b1d0e', '#c4501c', '#f3a65a'], sun: ['#ffd59a', 800, 420], hills: ['#7a2c12'], extra: 'lanterns' },
};

export const SCENE_TYPES = Object.keys(PALETTES);

// Spot categories (lib/categories.js) → scene
export const CATEGORY_SCENE = {
  haor: 'haor',
  hill: 'hill',
  waterfall: 'waterfall',
  river: 'river',
  garden: 'tea',
  heritage: 'heritage',
  other: 'kash',
};

// Stable scene for any string (e.g. alt text) so a card keeps its picture
export function sceneForText(text = '') {
  const pool = ['haor', 'river', 'tea', 'hill', 'mangrove', 'sea', 'kash', 'garden', 'waterfall', 'shimul'];
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

function extras(type, w, h, horizon, s) {
  const r = rng(11);
  let out = '';
  switch (type) {
    case 'boat':
      out += `<g transform="translate(420 640)"><path d="M0 30 Q140 60 300 30 L270 52 Q150 72 30 52Z" fill="#14262a"/><rect x="70" y="-8" width="170" height="38" rx="6" fill="#1d3337"/><path d="M60 -8 L150 -40 L250 -8Z" fill="#14262a"/><rect x="90" y="2" width="24" height="16" fill="#f6c77a" opacity=".85"/><rect x="130" y="2" width="24" height="16" fill="#f6c77a" opacity=".85"/></g>`;
      for (let i = 0; i < 5; i++) {
        const x = 1000 + i * 90;
        out += `<path d="M${x} 600 l0 -${40 + r() * 30}" stroke="#14262a" stroke-width="5"/><circle cx="${x}" cy="${560 - r() * 30}" r="${22 + r() * 10}" fill="#1a3438"/>`;
      }
      break;
    case 'sail':
      [[520, 650, 1], [1080, 610, 0.7]].forEach(([x, y, k]) => {
        out += `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-120 0 Q0 40 120 0 L95 22 Q0 45 -95 22Z" fill="#2a2a24"/><path d="M0 -5 L0 -230" stroke="#2a2a24" stroke-width="6"/><path d="M4 -225 Q110 -120 70 -12 L4 -12Z" fill="#e9dcc0"/></g>`;
      });
      break;
    case 'tea':
      for (let i = 0; i < 22; i++) {
        const y = 640 + i * 14;
        out += `<path d="M0 ${y} Q400 ${y - 30 - i} 800 ${y} T1600 ${y}" stroke="#235a2a" stroke-width="5" fill="none" opacity=".45"/>`;
      }
      for (let i = 0; i < 7; i++) {
        const x = 150 + i * 220 + r() * 60;
        const y = 560 + r() * 60;
        out += `<path d="M${x} ${y + 40} l0 -60" stroke="#2a3d22" stroke-width="7"/><ellipse cx="${x}" cy="${y - 30}" rx="70" ry="28" fill="#2f5b2c"/>`;
      }
      break;
    case 'paddy':
      out += `<rect y="660" width="${w}" height="${h - 660}" fill="#c9a43c"/>`;
      for (let i = 0; i < 160; i++) {
        const x = r() * w;
        const y = 670 + r() * 230;
        out += `<path d="M${x} ${y} q6 -30 ${-8 + r() * 30} -${30 + r() * 30}" stroke="${r() > 0.5 ? '#8a6d1d' : '#e7c35a'}" stroke-width="3" fill="none"/>`;
      }
      for (let i = 0; i < 4; i++) {
        const x = 200 + i * 380;
        out += `<path d="M${x} 660 l0 -140" stroke="#4d3a1a" stroke-width="10"/>`;
        for (let k = 0; k < 7; k++) out += `<path d="M${x} 520 q${(k - 3) * 30} -10 ${(k - 3) * 55} 40" stroke="#4d5a1f" stroke-width="7" fill="none"/>`;
      }
      break;
    case 'mangrove':
      for (let i = 0; i < 14; i++) {
        const x = i * 120 + r() * 60;
        const ht = 180 + r() * 160;
        const y = horizon;
        out += `<g fill="none" stroke="#17302a" stroke-width="5"><path d="M${x} ${y} l0 -${ht}"/><path d="M${x} ${y - 40} q-30 20 -40 40 M${x} ${y - 40} q30 20 40 40 M${x} ${y - 20} q-15 10 -22 20"/></g><ellipse cx="${x}" cy="${y - ht}" rx="${60 + r() * 40}" ry="${50 + r() * 30}" fill="#1f3d33"/>`;
      }
      break;
    case 'beach':
      out += `<path d="M0 700 Q500 640 1000 690 T1600 660 L1600 900 L0 900Z" fill="#ecd4a6"/><path d="M0 700 Q500 640 1000 690 T1600 660" stroke="#fff" stroke-width="8" fill="none" opacity=".7"/>`;
      [[220, 700], [330, 720]].forEach(([x, y]) => {
        out += `<path d="M${x} ${y} Q${x + 30} ${y - 160} ${x + 70} ${y - 290}" stroke="#3b2a1c" stroke-width="12" fill="none"/>`;
        for (let k = 0; k < 6; k++) {
          const a = k * 60;
          out += `<path d="M${x + 70} ${y - 290} q${Math.cos(a) * 90} ${-30 + Math.sin(a) * 40} ${Math.cos(a) * 170} ${40 + Math.sin(a) * 30}" stroke="#1f4b2c" stroke-width="16" fill="none" stroke-linecap="round"/>`;
        }
      });
      break;
    case 'temple':
      out += `<g fill="#5a2a12"><rect x="0" y="700" width="1600" height="200"/>`;
      for (let i = 0; i < 5; i++) {
        const x = 420 + i * 160;
        out += `<rect x="${x}" y="560" width="140" height="150"/><path d="M${x - 6} 565 Q${x + 70} 440 ${x + 146} 565Z"/><rect x="${x + 62}" y="430" width="16" height="30"/>`;
      }
      out += `<rect x="380" y="620" width="840" height="90"/></g>`;
      for (let i = 0; i < 14; i++) out += `<rect x="${400 + i * 58}" y="640" width="22" height="50" rx="11" fill="#f5cf87" opacity=".35"/>`;
      break;
    case 'kash':
      for (let i = 0; i < 140; i++) {
        const x = r() * w;
        const y = 640 + r() * 260;
        const hh = 60 + r() * 90;
        out += `<path d="M${x} ${y} q${-10 + r() * 20} -${hh / 2} ${-20 + r() * 40} -${hh}" stroke="#6f8f5f" stroke-width="2" fill="none"/><ellipse cx="${x - 10 + r() * 20}" cy="${y - hh}" rx="${8 + r() * 6}" ry="${18 + r() * 10}" fill="#fff" opacity=".9"/>`;
      }
      break;
    case 'fog':
      for (let i = 0; i < 5; i++) out += `<rect y="${480 + i * 80}" width="${w}" height="70" fill="#fff" opacity="${0.18 + i * 0.08}"/>`;
      for (let i = 0; i < 9; i++) {
        const x = 80 + i * 180;
        out += `<path d="M${x} 820 l0 -170" stroke="#4b5559" stroke-width="10"/>`;
        for (let k = 0; k < 7; k++) out += `<path d="M${x} 650 q${(k - 3) * 30} -10 ${(k - 3) * 55} 40" stroke="#4b5559" stroke-width="6" fill="none"/>`;
      }
      break;
    case 'shimul':
      for (let t = 0; t < 3; t++) {
        const x = 300 + t * 520;
        const y = 820;
        out += `<path d="M${x} ${y} l0 -330 M${x} ${y - 200} l-120 -90 M${x} ${y - 250} l130 -100 M${x} ${y - 320} l-60 -70" stroke="#4a3223" stroke-width="10" fill="none"/>`;
        for (let k = 0; k < 70; k++) out += `<circle cx="${x - 170 + r() * 340}" cy="${y - 470 + r() * 230}" r="${6 + r() * 8}" fill="${r() > 0.3 ? '#e11d48' : '#f97316'}" opacity=".9"/>`;
      }
      break;
    case 'clouds':
      for (let i = 0; i < 4; i++) out += `<ellipse cx="${200 + i * 400}" cy="${620 + r() * 60}" rx="300" ry="40" fill="#fff" opacity=".35"/>`;
      break;
    case 'falls':
      out += `<path d="M720 300 Q700 600 690 900 L910 900 Q890 600 880 300Z" fill="#eef6f3" opacity=".9"/>`;
      for (let i = 0; i < 12; i++) out += `<path d="M${725 + i * 13} 320 L${700 + i * 18} 900" stroke="#ffffff" stroke-width="3" opacity="${0.3 + r() * 0.5}"/>`;
      out += `<ellipse cx="800" cy="880" rx="300" ry="50" fill="#fff" opacity=".55"/>`;
      break;
    case 'lanterns':
      out += `<rect y="720" width="${w}" height="180" fill="#3b1208"/>`;
      for (let i = 0; i < 18; i++) {
        const x = 60 + i * 88;
        const y = 260 + Math.sin(i) * 40;
        out += `<line x1="${x}" y1="0" x2="${x}" y2="${y}" stroke="#2a0c05" stroke-width="2"/><ellipse cx="${x}" cy="${y + 20}" rx="18" ry="26" fill="#ffb347" opacity=".9"/>`;
      }
      for (let i = 0; i < 6; i++) out += `<rect x="${120 + i * 250}" y="640" width="190" height="90" rx="10" fill="#5a1d0c"/>`;
      break;
    default:
  }
  return out;
}

const cache = new Map();

// Inner SVG markup for a scene; gradient ids are prefixed with `id` so several
// scenes can live on one page.
export function sceneMarkup(type, id, w = 1600, h = 900) {
  const key = `${type}|${w}|${h}`;
  if (!cache.has(key)) {
    const s = PALETTES[type] || PALETTES.haor;
    const horizon = s.water ? 560 : 620;
    let out = `<defs><linearGradient id="__s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset=".6" stop-color="${s.sky[1]}"/><stop offset="1" stop-color="${s.sky[2]}"/></linearGradient><radialGradient id="__g"><stop offset="0" stop-color="${s.sun[0]}"/><stop offset="1" stop-color="${s.sun[0]}" stop-opacity="0"/></radialGradient>`;
    if (s.water) out += `<linearGradient id="__w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.water[0]}"/><stop offset="1" stop-color="${s.water[1]}"/></linearGradient>`;
    out += `</defs><rect width="${w}" height="${h}" fill="url(#__s)"/>`;
    out += `<circle cx="${s.sun[1]}" cy="${s.sun[2]}" r="260" fill="url(#__g)"/><circle cx="${s.sun[1]}" cy="${s.sun[2]}" r="56" fill="${s.sun[0]}"/>`;
    (s.hills || []).forEach((c, i) => {
      out += `<path d="${ridge(w, h, horizon - 110 + i * 70, 140 - i * 30, 7 + i * 13, 8 + i * 3)}" fill="${c}"/>`;
    });
    if (s.water) {
      out += `<rect y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#__w)"/>`;
      const r = rng(5);
      for (let i = 0; i < 26; i++) {
        const y = horizon + 12 + r() * (h - horizon - 20);
        out += `<rect x="${r() * w}" y="${y}" width="${60 + r() * 220}" height="2" rx="1" fill="#fff" opacity="${0.08 + r() * 0.2}"/>`;
      }
      out += `<rect x="${s.sun[1] - 40}" y="${horizon + 4}" width="80" height="${h - horizon}" fill="${s.sun[0]}" opacity=".18"/>`;
    }
    out += extras(s.extra, w, h, horizon, s);
    cache.set(key, out);
  }
  return cache.get(key).replaceAll('__', id);
}
