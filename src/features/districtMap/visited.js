import { DISTRICTS } from './bdDistricts';

export const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
export const TOTAL = DISTRICTS.length;

const KEY = 'bl-visited-districts';
const NAME_KEY = 'bl-visited-name';

// Per-device memory of the visitor's own map; storage can be blocked (private mode)
export function loadVisited() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(list.filter((slug) => DISTRICTS.some((d) => d.slug === slug)));
  } catch {
    return new Set();
  }
}

export function saveVisited(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
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

// Share links carry the selection as a 64-bit mask in base36 (≤13 chars),
// indexed by the fixed order of DISTRICTS
export function encodeVisited(set) {
  let mask = 0n;
  DISTRICTS.forEach((d, i) => {
    if (set.has(d.slug)) mask |= 1n << BigInt(i);
  });
  return mask.toString(36);
}

export function decodeVisited(code) {
  if (!/^[0-9a-z]{1,13}$/.test(code || '')) return null;
  let mask = 0n;
  for (const ch of code) mask = mask * 36n + BigInt(parseInt(ch, 36));
  return new Set(DISTRICTS.filter((_, i) => (mask >> BigInt(i)) & 1n).map((d) => d.slug));
}

export function divisionStats(set) {
  return DIVISIONS.map((division) => {
    const all = DISTRICTS.filter((d) => d.division === division);
    return { division, total: all.length, visited: all.filter((d) => set.has(d.slug)).length };
  });
}
