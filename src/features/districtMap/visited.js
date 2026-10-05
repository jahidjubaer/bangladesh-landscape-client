import { DISTRICTS } from './bdDistricts';

export const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
export const TOTAL = DISTRICTS.length;
const SLUGS = new Set(DISTRICTS.map((d) => d.slug));

// Map state: visited (stayed/explored), passed (only travelled through), home
export const emptyMap = () => ({ visited: new Set(), passed: new Set(), home: '' });

const KEY = 'bl-map-v2';
const OLD_KEY = 'bl-visited-districts'; // v1: plain array of visited slugs
const NAME_KEY = 'bl-visited-name';

const clean = (list) => new Set((list || []).filter((s) => SLUGS.has(s)));

// Per-device memory of the visitor's own map; storage can be blocked (private mode)
export function loadMap() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const m = JSON.parse(raw);
      return { visited: clean(m.visited), passed: clean(m.passed), home: SLUGS.has(m.home) ? m.home : '' };
    }
    return { ...emptyMap(), visited: clean(JSON.parse(localStorage.getItem(OLD_KEY) || '[]')) };
  } catch {
    return emptyMap();
  }
}

export function saveMap(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ visited: [...map.visited], passed: [...map.passed], home: map.home }));
  } catch {
    /* private mode */
  }
}

export function loadName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode */
  }
}

// What a district is on this map: 'home' | 'visited' | 'passed' | ''
export function stateOf(map, slug) {
  if (map.home === slug) return 'home';
  if (map.visited.has(slug)) return 'visited';
  if (map.passed.has(slug)) return 'passed';
  return '';
}

// Applies one state to a district (each district has exactly one state; one home)
export function setState(map, slug, state) {
  const next = { visited: new Set(map.visited), passed: new Set(map.passed), home: map.home };
  next.visited.delete(slug);
  next.passed.delete(slug);
  if (next.home === slug) next.home = '';
  if (state === 'visited') next.visited.add(slug);
  if (state === 'passed') next.passed.add(slug);
  if (state === 'home') next.home = slug;
  return next;
}

// Home counts as visited for totals
export const visitedCount = (map) => map.visited.size + (map.home && !map.visited.has(map.home) ? 1 : 0);
export const isVisited = (map, slug) => map.home === slug || map.visited.has(slug);

// Share links carry 64-bit masks in base36 (≤13 chars each), indexed by the
// fixed order of DISTRICTS: ?v=<visited>&p=<passed>&h=<home index>
function encodeSet(set) {
  let mask = 0n;
  DISTRICTS.forEach((d, i) => {
    if (set.has(d.slug)) mask |= 1n << BigInt(i);
  });
  return mask.toString(36);
}
function decodeSet(code) {
  if (!/^[0-9a-z]{1,13}$/.test(code || '')) return null;
  let mask = 0n;
  for (const ch of code) mask = mask * 36n + BigInt(parseInt(ch, 36));
  return new Set(DISTRICTS.filter((_, i) => (mask >> BigInt(i)) & 1n).map((d) => d.slug));
}

export function encodeMap(map) {
  const params = new URLSearchParams({ v: encodeSet(map.visited) });
  if (map.passed.size) params.set('p', encodeSet(map.passed));
  const homeIndex = DISTRICTS.findIndex((d) => d.slug === map.home);
  if (homeIndex >= 0) params.set('h', homeIndex.toString(36));
  return params.toString();
}

export function decodeMap(params) {
  const visited = decodeSet(params.get('v'));
  if (!visited) return null;
  const home = DISTRICTS[parseInt(params.get('h') || '', 36)]?.slug || '';
  return { visited, passed: decodeSet(params.get('p')) || new Set(), home };
}

export function divisionStats(map) {
  return DIVISIONS.map((division) => {
    const all = DISTRICTS.filter((d) => d.division === division);
    return {
      division,
      total: all.length,
      visited: all.filter((d) => isVisited(map, d.slug)).length,
      passed: all.filter((d) => stateOf(map, d.slug) === 'passed').length,
    };
  });
}
