import bn from './bn.json';

// Lightweight i18n: bn only for now; add en.json later and a language switcher.
const dictionaries = { bn };
let currentLang = 'bn';

export function setLang(lang) {
  if (dictionaries[lang]) currentLang = lang;
}

// t('nav.home') → 'হোম'; falls back to the key itself if missing
export function t(path) {
  const value = path
    .split('.')
    .reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), dictionaries[currentLang]);
  return value === undefined ? path : value;
}
