import bn from './bn.json';

// Bangla is the default language and ships in the main bundle. English is only
// downloaded for readers who chose it; top-level await makes modules that call
// t() at import time wait for it.
const LANGS = ['bn', 'en'];

function savedLang() {
  try {
    const l = localStorage.getItem('bl-lang');
    if (LANGS.includes(l)) return l;
  } catch {
    /* private mode */
  }
  return 'bn';
}

let currentLang = savedLang();
document.documentElement.lang = currentLang;

const dictionaries = { bn, en: currentLang === 'en' ? (await import('./en.json')).default : null };

export function getLang() {
  return currentLang;
}

// Many components capture t() results at module scope, so a language
// change persists + reloads instead of re-rendering in place.
export function setLang(lang) {
  if (!LANGS.includes(lang) || lang === currentLang) return;
  try {
    localStorage.setItem('bl-lang', lang);
  } catch {
    /* private mode */
  }
  window.location.reload();
}

// UI strings: t('nav.home') — falls back en→bn→key
export function t(path) {
  const pick = (dict) =>
    path.split('.').reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), dict);
  const value = pick(dictionaries[currentLang]) ?? pick(dictionaries.bn);
  return value === undefined ? path : value;
}

// DB localized fields: lx({bn, en}) — falls back to bn when en is empty
export function lx(localized) {
  if (!localized || typeof localized !== 'object') return localized ?? '';
  return localized[currentLang] || localized.bn || '';
}

// Number/date locale for toLocaleString/toLocaleDateString
export function locale() {
  return currentLang === 'en' ? 'en-GB' : 'bn-BD';
}

// Count string: uses `${path}_one` when n is 1 and that key exists, and fills
// {n} with the number in the current locale. tn('season.ui.placesN', 3)
export function tn(path, n) {
  const one = n === 1 ? t(`${path}_one`) : null;
  const str = one && one !== `${path}_one` ? one : t(path);
  return str.replace('{n}', Number(n).toLocaleString(locale()));
}
