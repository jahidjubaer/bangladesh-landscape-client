import { useEffect } from 'react';
import { Outlet, useLocation, useNavigation, ScrollRestoration } from '../lib/router';
import { MotionConfig } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import api from '../lib/api';
import { t } from '../i18n';

// Anonymous per-browser id for first-party unique-visitor counts (no cookies, no PII)
function visitorId() {
  try {
    let v = localStorage.getItem('bl-vid');
    if (!v) {
      v = crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('bl-vid', v);
    }
    return v;
  } catch {
    return null;
  }
}

export default function RootLayout() {
  const location = useLocation();
  // A page chunk or route loader is pending: the current page stays up meanwhile
  const busy = useNavigation().state !== 'idle';

  // First-party page-view beacon; admin pages are never counted
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    api.post('/track', { path: location.pathname, vid: visitorId() }).catch(() => {});
  }, [location.pathname]);

  return (
    // reducedMotion="user": Motion skips transform animations when the OS asks for less motion
    <MotionConfig reducedMotion="user">
    <div className="flex flex-col min-h-screen bg-base-200 pb-bottom-nav">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-base-100 focus:px-4 focus:py-2 focus:shadow-lg"
      >
        {t('a11y.skip')}
      </a>
      <div className={`nav-progress ${busy ? 'is-busy' : ''}`} role="progressbar" aria-hidden={!busy} aria-label={t('common.loading')} />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {/* Page changes animate with view transitions (lib/router.jsx, index.css) */}
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ScrollRestoration />
    </div>
    </MotionConfig>
  );
}
