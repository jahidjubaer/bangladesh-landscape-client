import bn from './bn.json';
import en from './en.json';

const dictionaries = { bn, en };

function savedLang() {
  try {
    const l = localStorage.getItem('bl-lang');
    if (dictionaries[l]) return l;
  } catch {
    /* private mode */
  }
  return 'bn';
}

let currentLang = savedLang();
document.documentElement.lang = currentLang;

export function getLang() {
  return currentLang;
}

// Many components capture t() results at module scope, so a language
// change persists + reloads instead of re-rendering in place.
export function setLang(lang) {
  if (!dictionaries[lang] || lang === currentLang) return;
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
