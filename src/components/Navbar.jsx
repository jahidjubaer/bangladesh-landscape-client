import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Menu, X, Mountain, Map, Compass, PenLine, Sparkles,
  User, LogOut, ShieldCheck, BookOpenText, CalendarCheck, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import { t } from '../i18n';

const navItems = [
  { to: '/', label: t('nav.home'), icon: Mountain, end: true },
  { to: '/districts', label: t('nav.districts'), icon: Map },
  { to: '/plan', label: t('nav.planTour'), icon: Sparkles },
  { to: '/guides', label: t('nav.guides'), icon: Compass },
  { to: '/blog', label: t('nav.blog'), icon: PenLine },
];

function DesktopLinks() {
  return navItems.map((item) => (
    <li key={item.to}>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `rounded-full px-4 font-medium ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`
        }
      >
        {item.label}
      </NavLink>
    </li>
  ));
}

function UserMenu({ user, hasRole, onLogout }) {
  const items = [
    hasRole('admin') && { to: '/admin', label: t('admin.title'), icon: ShieldCheck },
    hasRole('guide') && { to: '/guide-dashboard', label: t('guide.dashboard'), icon: Compass },
    { to: '/my-plans', label: t('plan.myPlans'), icon: FileText },
    { to: '/my-bookings', label: t('booking.myBookings'), icon: CalendarCheck },
    { to: '/my-blogs', label: t('blog.myBlogs'), icon: BookOpenText },
    { to: '/profile', label: t('nav.profile'), icon: User },
  ].filter(Boolean);

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost rounded-full gap-2 pl-1.5">
        <div className="avatar placeholder">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-8">
            <span className="text-sm font-bold">{user.name.charAt(0)}</span>
          </div>
        </div>
        <span className="hidden sm:inline max-w-28 truncate">{user.name}</span>
      </div>
      <ul tabIndex={0} className="menu dropdown-content mt-3 z-20 p-2 shadow-xl bg-base-100 rounded-2xl w-60 border border-base-200">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="gap-3">
              <Icon className="w-4 h-4 text-base-content/60" /> {label}
            </Link>
          </li>
        ))}
        <div className="divider my-1"></div>
        <li>
          <button onClick={onLogout} className="gap-3 text-error">
            <LogOut className="w-4 h-4" /> {t('nav.logout')}
          </button>
        </li>
      </ul>
    </div>
  );
}

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-base-100/85 backdrop-blur-lg shadow-md' : 'bg-base-100/60 backdrop-blur-md'
      }`}
    >
      <div className="navbar max-w-7xl mx-auto px-4 min-h-16">
        <div className="navbar-start gap-1">
          <button
            className="btn btn-ghost btn-circle lg:hidden"
            aria-label="menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Mountain className="w-5 h-5 text-primary-content" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg sm:text-xl font-bold text-base-content leading-none">
              {t('site.name')}
            </span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1">
            <DesktopLinks />
          </ul>
        </div>

        <div className="navbar-end gap-1">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} hasRole={hasRole} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm rounded-full hidden sm:inline-flex">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm rounded-full px-5 shadow-md shadow-primary/25">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-base-200 bg-base-100/95 backdrop-blur-lg"
          >
            <ul className="menu p-3 gap-1">
              {navItems.map(({ to, label, icon: Icon, end }, i) => (
                <motion.li
                  key={to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                >
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `gap-3 rounded-xl ${isActive ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                  >
                    <Icon className="w-5 h-5" /> {label}
                  </NavLink>
                </motion.li>
              ))}
              {!user && (
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Link to="/login" className="gap-3 rounded-xl">
                    <User className="w-5 h-5" /> {t('nav.login')}
                  </Link>
                </motion.li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
