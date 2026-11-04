// The six Bengali seasons (ষড়ঋতু) on the revised Bangladesh calendar:
// Pohela Boishakh = 14 Apr, Pohela Falgun = 14 Feb. Each season is two months.
// `start` is [month (1-12), day] in the Gregorian calendar.
export const SEASONS = [
  { key: 'grishma', bn: 'গ্রীষ্ম', en: 'Grishma', start: [4, 14], scene: 'heritage' },
  { key: 'barsha', bn: 'বর্ষা', en: 'Barsha', start: [6, 15], scene: 'haor' },
  { key: 'sharat', bn: 'শরৎ', en: 'Sharat', start: [8, 16], scene: 'kash' },
  { key: 'hemanta', bn: 'হেমন্ত', en: 'Hemanta', start: [10, 17], scene: 'garden' },
  { key: 'sheet', bn: 'শীত', en: 'Sheet', start: [12, 16], scene: 'fog' },
  { key: 'basanta', bn: 'বসন্ত', en: 'Basanta', start: [2, 14], scene: 'shimul' },
];

export const SEASON_KEYS = SEASONS.map((s) => s.key);

// Season for a date, using Bangladesh time so the switch-over happens at local midnight
export function seasonFor(date = new Date()) {
  const bd = new Date(date.getTime() + (6 * 60 + date.getTimezoneOffset()) * 60000);
  const md = (bd.getMonth() + 1) * 100 + bd.getDate();
  // Latest season whose start is on or before today; before 14 Feb it is still Sheet
  let current = SEASONS.find((s) => s.key === 'sheet');
  for (const s of [...SEASONS].sort((a, b) => a.start[0] * 100 + a.start[1] - (b.start[0] * 100 + b.start[1]))) {
    if (s.start[0] * 100 + s.start[1] <= md) current = s;
  }
  return current;
}

// Puts the season on <html data-season> so CSS accent tokens follow it
export function applySeason(key = seasonFor().key) {
  if (SEASON_KEYS.includes(key)) document.documentElement.dataset.season = key;
  return key;
}
