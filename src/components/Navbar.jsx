import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Menu, X, Mountain, Map, Compass, PenLine, Sparkles, Tent, Camera, Search, Heart, Gamepad2, ChevronDown,
  User, LogOut, ShieldCheck, BookOpenText, CalendarCheck, FileText, Settings as SettingsIcon, BedDouble,
  ArrowRight, MapPinned, Palette, Calculator, Signpost,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import LanguageToggle from './ui/LanguageToggle';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';
import SeasonStrip from './SeasonStrip';
import Scene from './ui/Scene';
import { CATEGORIES } from '../lib/categories';
import { SEASONS, seasonFor } from '../lib/seasons';
import { t } from '../i18n';

const NOW = seasonFor();
const DIVISIONS = ['Sylhet', 'Chattogram', 'Dhaka', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh'];

// Intent-grouped navigation (docs/09 §4). Every top item is a real link;
// its chevron opens the panel for keyboard and touch users.
const MENUS = [
  {
    key: 'places',
    to: '/districts',
    label: t('nav2.places'),
    scene: 'haor',
    feature: { to: '/explore', title: t('nav2.featPlaces'), sub: t('nav2.featPlacesSub') },
    groups: [
      {
        title: t('nav2.byDivision'),
        cols: 2,
        links: DIVISIONS.map((d) => ({ to: `/districts?division=${d}`, label: t(`district.divisions.${d}`) })),
      },
      {
        title: t('nav2.discover'),
        links: [
          { to: '/districts', label: t('nav2.allDistricts'), icon: Map },
          { to: '/explore', label: t('nav2.exploreMap'), icon: MapPinned },
          { to: '/my-map', label: t('nav2.myMap'), icon: Palette },
          { to: '/gallery', label: t('nav2.gallery'), icon: Camera },
        ],
      },
    ],
  },
  {
    key: 'todo',
    to: '/explore',
    label: t('nav2.todo'),
    scene: 'tea',
    feature: { to: '/events', title: t('nav2.featTodo'), sub: t('nav2.featTodoSub') },
    groups: [
      {
        title: t('nav2.byType'),
        cols: 2,
        links: CATEGORIES.map(({ key, Icon }) => ({ to: `/explore?cat=${key}`, label: t(`spot.category.${key}`), icon: Icon })),
      },
      {
        title: t('nav2.bookable'),
        links: [
          { to: '/events', label: t('nav2.events'), icon: Tent },
          { to: '/stays', label: t('nav2.stays'), icon: BedDouble },
          { to: '/guides', label: t('nav2.guides'), icon: Compass },
        ],
      },
    ],
  },
  {
    key: 'seasons',
    to: `/seasons/${NOW.key}`,
    label: t('nav2.seasons'),
    scene: NOW.scene,
    feature: {
      to: `/seasons/${NOW.key}`,
      title: t('season.ui.nowIn').replace('{x}', t(`season.name.${NOW.key}`)),
      sub: t(`season.tagline.${NOW.key}`),
    },
    groups: [
      {
        title: t('season.ui.pick'),
        cols: 2,
        links: SEASONS.map((x) => ({ to: `/seasons/${x.key}`, label: `${t(`season.name.${x.key}`)} · ${t(`season.gloss.${x.key}`)}` })),
      },
      {
        title: t('nav2.planning'),
        links: [
          { to: '/plan', label: t('nav2.aiPlan'), icon: Sparkles },
          { to: '/events', label: t('nav2.events'), icon: Tent },
        ],
      },
    ],
  },
  {
    key: 'plan',
    to: '/plan',
    label: t('nav2.plan'),
    scene: 'river',
    feature: { to: '/plan', title: t('nav2.featPlan'), sub: t('nav2.featPlanSub') },
    groups: [
      {
        title: t('nav2.planning'),
        links: [
          { to: '/plan', label: t('nav2.aiPlan'), icon: Sparkles },
          { to: '/guides', label: t('nav2.guides'), icon: Compass },
          { to: '/stays', label: t('nav2.stays'), icon: BedDouble },
        ],
      },
      {
        title: t('nav2.handy'),
        links: [
          { to: '/tools/budget', label: t('nav2.budget'), icon: Calculator },
          { to: '/tools/where-to-go', label: t('nav2.whereToGo'), icon: Signpost },
          { to: '/tools/quiz', label: t('nav2.quiz'), icon: Gamepad2 },
          { to: '/tools', label: t('nav2.toolsHub'), icon: Gamepad2 },
        ],
      },
    ],
  },
  {
    key: 'stories',
    to: '/blog',
    label: t('nav2.stories'),
    scene: 'kash',
    feature: { to: '/blog', title: t('nav2.featStories'), sub: t('nav2.featStoriesSub') },
    groups: [
      {
        title: t('nav2.read'),
        links: [
          { to: '/blog', label: t('nav2.blog'), icon: PenLine },
          { to: '/write-blog', label: t('nav2.writeBlog'), icon: BookOpenText },
          { to: '/gallery', label: t('nav2.gallery'), icon: Camera },
          { to: '/credits', label: t('nav2.credits'), icon: Camera },
        ],
      },
    ],
  },
];

function MegaPanel({ menu, onEnter, onLeave, onNavigate }) {
  return (
    <motion.div
      id={`mega-${menu.key}`}
      role="region"
      aria-label={menu.label}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full hidden lg:block"
    >
      <div className="max-w-7xl mx-auto px-4 pt-2">
        <div className="bg-base-100 rounded-3xl shadow-2xl ring-1 ring-base-300 p-5 grid grid-cols-12 gap-6">
          <Link
            to={menu.feature.to}
            onClick={onNavigate}
            className="col-span-4 relative rounded-2xl overflow-hidden min-h-56 text-white group"
          >
            <Scene
              type={menu.scene}
              className="absolute inset-0 w-full h-full transition-transform duration-700 ease-brand group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5">
              <span className="font-display text-2xl font-bold block leading-tight">{menu.feature.title}</span>
              <span className="text-sm text-white/85 block mt-1">{menu.feature.sub}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold mt-3">
                {menu.label} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </span>
          </Link>
          {menu.groups.map((g) => (
            <div key={g.title} className={g.cols === 2 ? 'col-span-5' : 'col-span-3'}>
              <p className="eyebrow mb-3 px-3">{g.title}</p>
              <ul className={`grid gap-0.5 ${g.cols === 2 ? 'grid-cols-2' : ''}`}>
                {g.links.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[0.9375rem] hover:bg-season-soft hover:text-season-ink transition-colors"
                    >
                      {Icon && <Icon className="w-4 h-4 opacity-60 shrink-0" aria-hidden />}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DesktopNav({ openKey, setOpenKey }) {
  const closeTimer = useRef(null);
  const triggers = useRef({});
  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 160);
  };
  const open = (key) => {
    cancelClose();
    setOpenKey(key);
  };

  useEffect(() => {
    if (!openKey) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        triggers.current[openKey]?.focus();
        setOpenKey(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openKey, setOpenKey]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const active = MENUS.find((m) => m.key === openKey);
  const linkCls = (on) =>
    `py-2 font-medium text-[0.9375rem] transition-colors ${on ? 'text-season-ink' : 'hover:text-season-ink'}`;

  return (
    <>
      <ul className="flex items-center gap-0.5">
        {MENUS.map((m) => (
          <li key={m.key} className="flex items-center" onMouseEnter={() => open(m.key)} onMouseLeave={scheduleClose}>
            <NavLink
              to={m.to}
              onClick={() => setOpenKey(null)}
              className={({ isActive }) => `pl-4 pr-1 ${linkCls(isActive || openKey === m.key)}`}
            >
              {m.label}
            </NavLink>
            <button
              ref={(el) => {
                triggers.current[m.key] = el;
              }}
              onClick={() => (openKey === m.key ? setOpenKey(null) : open(m.key))}
              aria-expanded={openKey === m.key}
              aria-controls={`mega-${m.key}`}
              aria-label={t('nav2.showSub').replace('{x}', m.label)}
              className="pr-3 pl-0.5 py-2 hover:text-season-ink"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openKey === m.key ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          </li>
        ))}
        <li className="hidden xl:block">
          <NavLink to="/my-map" className={({ isActive }) => `px-4 ${linkCls(isActive)}`}>
            {t('nav2.myMap')}
          </NavLink>
        </li>
      </ul>
      <AnimatePresence>
        {active && (
          <MegaPanel
            key={active.key}
            menu={active}
            onEnter={cancelClose}
            onLeave={scheduleClose}
            onNavigate={() => setOpenKey(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Full-screen menu on phones/tablets: one accordion per group of links
function MobileSheet({ user, onClose, top }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.nav
      id="mobile-menu"
      aria-label={t('nav2.menu')}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ top }}
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-base-100 border-t border-base-200 pb-24"
    >
      <div className="max-w-xl mx-auto p-4 space-y-2">
        {MENUS.map((m) => (
          <details key={m.key} className="group rounded-2xl bg-base-200/60 open:bg-base-200">
            <summary className="list-none cursor-pointer flex items-center gap-3 p-4 font-semibold [&::-webkit-details-marker]:hidden">
              <span className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
                <Scene type={m.scene} className="absolute inset-0 w-full h-full" />
              </span>
              <span className="grow text-lg">{m.label}</span>
              <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <Link to={m.to} className="flex items-center justify-between rounded-xl bg-base-100 px-4 py-3 font-medium">
                {m.label} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              {m.groups.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow mb-2 px-1">{g.title}</p>
                  <ul className="grid grid-cols-2 gap-1">
                    {g.links.map(({ to, label }) => (
                      <li key={to}>
                        <Link to={to} className="block rounded-lg px-3 py-2.5 text-[0.9375rem] hover:bg-base-100">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
        <Link to="/my-map" className="flex items-center gap-3 p-4 rounded-2xl bg-base-200/60 font-semibold text-lg">
          <Palette className="w-5 h-5 text-season-ink" aria-hidden /> {t('nav2.myMap')}
        </Link>
        {!user && (
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link to="/login" className="btn btn-outline rounded-full">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="btn btn-primary rounded-full">
              {t('nav.register')}
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

function UserMenu({ user, hasRole, onLogout }) {
  const items = [
    hasRole('admin') && { to: '/admin', label: t('admin.title'), icon: ShieldCheck },
    hasRole('guide') && { to: '/guide-dashboard', label: t('guide.dashboard'), icon: Compass },
    hasRole('partner') && { to: '/partner-dashboard', label: t('partner.dashboard'), icon: BedDouble },
    { to: '/my-plans', label: t('plan.myPlans'), icon: FileText },
    { to: '/my-bookings', label: t('booking.myBookings'), icon: CalendarCheck },
    { to: '/wishlist', label: t('wishlist.title'), icon: Heart },
    { to: '/my-blogs', label: t('blog.myBlogs'), icon: BookOpenText },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/settings', label: t('settings.title'), icon: SettingsIcon },
  ].filter(Boolean);

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost rounded-full gap-2 pl-1.5">
        <div className="avatar placeholder">
          {user.avatarUrl ? (
            <div className="w-8 rounded-full">
              <img src={user.avatarUrl} alt={user.name} />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-8">
              <span className="text-sm font-bold">{user.name.charAt(0)}</span>
            </div>
          )}
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
  const headerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sheetTop, setSheetTop] = useState(64);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);

  // Ctrl+K / Cmd+K opens search; the mobile bottom nav asks via event
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onOpen = () => setSearchOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('bl:open-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('bl:open-search', onOpen);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setOpenKey(null);
  }, [location.pathname, location.search]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  function toggleMobile() {
    // The sheet starts under the header, which may still sit below the alert strip
    if (!mobileOpen && headerRef.current) setSheetTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
    setMobileOpen((v) => !v);
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const solid = scrolled || openKey || mobileOpen;
  // Home: transparent over the full-bleed hero until the visitor scrolls
  const overHero = location.pathname === '/' && !solid;

  return (
    <>
      <SeasonStrip />
      <header
        ref={headerRef}
        data-over-hero={overHero || undefined}
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          overHero
            ? 'bg-transparent text-white'
            : solid
              ? 'bg-base-100/90 backdrop-blur-lg shadow-md'
              : 'bg-base-100/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
          <button
            className="btn btn-ghost btn-circle lg:hidden -ml-2"
            aria-label={mobileOpen ? t('nav2.close') : t('nav2.open')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={toggleMobile}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" aria-label={t('site.name')} className="flex items-center gap-2 group shrink-0 mr-2 xl:mr-4">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Mountain className="w-5 h-5 text-primary-content" strokeWidth={2.2} aria-hidden />
            </span>
            <span className={`font-display text-lg sm:text-xl font-bold leading-none lg:hidden xl:inline ${overHero ? '' : 'text-base-content'}`}>
              {t('site.name')}
            </span>
          </Link>

          <nav aria-label={t('nav2.menu')} className="hidden lg:block">
            <DesktopNav openKey={openKey} setOpenKey={setOpenKey} />
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              className="btn btn-ghost rounded-full px-3 gap-2"
              aria-label={t('search.title')}
              title={`${t('search.title')} (Ctrl+K)`}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" aria-hidden />
              <kbd className="hidden xl:inline text-[0.7rem] font-sans font-medium border border-base-content/20 rounded-md px-1.5 py-0.5 opacity-70">
                Ctrl K
              </kbd>
            </button>
            <LanguageToggle />
            <ThemeToggle />
            {user && <NotificationBell />}
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

      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && <MobileSheet user={user} onClose={closeMobile} top={sheetTop} />}
      </AnimatePresence>
    </>
  );
}
