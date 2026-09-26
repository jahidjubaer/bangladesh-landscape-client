import { Link } from 'react-router-dom';
import { Mountain, MapPin } from 'lucide-react';

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

const columns = [
  {
    title: t('footer.quickLinks'),
    links: [
      { to: '/districts', label: t('nav.districts') },
      { to: '/plan', label: t('nav.planTour') },
      { to: '/guides', label: t('nav.guides') },
      { to: '/become-guide', label: t('guide.becomeGuide') },
      { to: '/blog', label: t('nav.blog') },
    ],
  },
  {
    title: t('footer.policies'),
    links: [
      { to: '/policies/user', label: t('footer.userPolicy') },
      { to: '/policies/guide', label: t('footer.guidePolicy') },
      { to: '/policies/partner', label: t('footer.partnerPolicy') },
      { to: '/policies/sponsor', label: 'বিজ্ঞাপন নীতিমালা' },
      { to: '/policies/blog', label: 'ব্লগ নীতিমালা' },
    ],
  },
];

const socials = [
  { Icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  { Icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-neutral text-neutral-content mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-2 max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Mountain className="w-6 h-6 text-primary-content" strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl font-bold">{t('site.name')}</span>
          </Link>
          <p className="text-sm opacity-75 leading-relaxed mb-5">{t('footer.about')}</p>
          <div className="flex gap-2">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-neutral-content/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title}>
            <h3 className="font-bold mb-4 text-neutral-content/90">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link className="opacity-70 hover:opacity-100 hover:text-primary transition-all" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-neutral-content/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-sm opacity-70">
          <span>© {new Date().getFullYear()} {t('site.name')} — {t('footer.rights')}</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> সুনামগঞ্জ থেকে শুরু · ৬৪ জেলার পথে
          </span>
        </div>
      </div>
    </footer>
  );
}
