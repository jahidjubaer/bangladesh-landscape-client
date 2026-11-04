import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, MapPin, Phone } from 'lucide-react';

// lucide dropped brand icons — minimal inline paths instead
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
  </svg>
);
const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.5 15.6V8.4L15.8 12l-6.3 3.6Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);
import { t } from '../i18n';
import { seasonFor } from '../lib/seasons';
import { isDataSaver, setDataSaver } from '../lib/dataSaver';

const columns = [
  {
    title: t('footer2.explore'),
    links: [
      { to: '/districts', label: t('footer2.allDistricts') },
      { to: '/explore', label: t('footer2.map') },
      { to: `/seasons/${seasonFor().key}`, label: t('footer2.seasons') },
      { to: '/events', label: t('footer2.events') },
      { to: '/stays', label: t('footer2.stays') },
      { to: '/blog', label: t('footer2.journal') },
      { to: '/gallery', label: t('footer2.gallery') },
    ],
  },
  {
    title: t('footer2.plan'),
    links: [
      { to: '/plan', label: t('footer2.ai') },
      { to: '/guides', label: t('footer2.guides') },
      { to: '/tools/budget', label: t('footer2.budget') },
      { to: '/tools/where-to-go', label: t('footer2.whereToGo') },
      { to: '/my-map', label: t('footer2.myMap') },
      { to: '/become-guide', label: t('footer2.becomeGuide') },
    ],
  },
  {
    title: t('footer2.about'),
    links: [
      { to: '/policies/user', label: t('footer.userPolicy') },
      { to: '/policies/guide', label: t('footer.guidePolicy') },
      { to: '/policies/partner', label: t('footer.partnerPolicy') },
      { to: '/policies/sponsor', label: t('footer2.sponsorPolicy') },
      { to: '/policies/blog', label: t('footer2.blogPolicy') },
      { to: '/credits', label: t('footer2.credits') },
    ],
  },
];

const socials = [
  { Icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  { Icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  const season = seasonFor().key;
  const [saver, setSaver] = useState(isDataSaver);
  const toggleSaver = () => {
    setDataSaver(!saver);
    setSaver(!saver);
  };
  return (
    <footer className="relative mt-auto bg-[#071c19] text-[#a9c3bc]">
      {/* Hill silhouette joining the page to the footer */}
      <svg className="absolute bottom-full left-0 w-full h-10 md:h-16 text-[#071c19]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 80V52c120-18 220-40 340-30s190 34 320 22 220-46 360-40 240 34 420 16V80Z" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1 max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Mountain className="w-6 h-6 text-primary-content" strokeWidth={2.2} aria-hidden />
            </span>
            <span className="font-display text-xl font-bold">{t('site.name')}</span>
          </Link>
          <p className="font-display text-2xl text-white mt-6">{t('footer2.tagline')}</p>
          <p className="text-sm leading-relaxed mt-2">{t('footer.about')}</p>
          <div className="flex flex-wrap gap-2 mt-6 text-sm">
            <Link
              to={`/seasons/${season}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 hover:border-season-bright hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-season-bright" aria-hidden />
              {t('footer2.seasonNow').replace('{x}', t(`season.name.${season}`))}
            </Link>
            <a href="tel:999" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" aria-hidden /> {t('footer2.emergency')}
            </a>
          </div>
          <div className="flex gap-2 mt-6">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-season-bright hover:text-[#071c19] flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white mb-4">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link className="hover:text-white transition-colors" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>
            © {new Date().getFullYear()} {t('site.name')} · {t('footer.rights')}
          </span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden /> {t('footer2.started')}
            </span>
            <button
              type="button"
              onClick={toggleSaver}
              aria-pressed={saver}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 hover:text-white hover:border-white/40 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${saver ? 'bg-season-bright' : 'bg-white/30'}`} aria-hidden />
              {t('footer2.dataSaver')}: {saver ? t('footer2.on') : t('footer2.off')}
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}
