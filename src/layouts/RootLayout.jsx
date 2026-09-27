import { useEffect } from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import api from '../lib/axios';

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

  // First-party page-view beacon; admin pages are never counted
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    api.post('/track', { path: location.pathname, vid: visitorId() }).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-base-200 pb-bottom-nav">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav />
      <ScrollRestoration />
    </div>
  );
}
