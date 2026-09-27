import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Mountain, Map, Sparkles, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

// App-style tab bar on small screens (PWA feel). Hides while scrolling
// down, returns on scroll up.
export default function BottomNav() {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabs = [
    { to: '/', icon: Mountain, label: t('nav.home'), end: true },
    { to: '/districts', icon: Map, label: t('nav.districts') },
    { to: '/plan', icon: Sparkles, label: t('nav.planTour') },
    { icon: Search, label: t('search.title'), onClick: () => window.dispatchEvent(new CustomEvent('bl:open-search')) },
    user
      ? { to: '/profile', icon: User, label: t('nav.profile') }
      : { to: '/login', icon: User, label: t('nav.login') },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-base-100/92 backdrop-blur-lg border-t border-base-200 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map(({ to, icon: Icon, label, end, onClick }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-base-content/55'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`px-3 py-0.5 rounded-full transition-colors ${isActive ? 'bg-primary/12' : ''}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ) : (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-base-content/55"
            >
              <span className="px-3 py-0.5 rounded-full">
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </span>
              {label}
            </button>
          )
        )}
      </div>
    </nav>
  );
}
