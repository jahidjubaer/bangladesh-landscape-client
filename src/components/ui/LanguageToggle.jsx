import { getLang, setLang } from '../../i18n';

// Switches bn ⇄ en (persists, then reloads so module-scope strings refresh)
export default function LanguageToggle() {
  const lang = getLang();
  const next = lang === 'bn' ? 'en' : 'bn';
  return (
    <button
      onClick={() => setLang(next)}
      className="btn btn-ghost btn-sm rounded-full px-3 font-bold text-xs"
      aria-label={next === 'en' ? 'Switch to English' : 'বাংলায় দেখুন'}
      title={next === 'en' ? 'English' : 'বাংলা'}
    >
      {next === 'en' ? 'EN' : 'বাং'}
    </button>
  );
}
