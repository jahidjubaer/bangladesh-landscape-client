import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const navItems = [
  { to: '/', label: t('nav.home'), end: true },
  { to: '/districts', label: t('nav.districts') },
  { to: '/plan', label: t('nav.planTour') },
  { to: '/guides', label: t('nav.guides') },
  { to: '/blog', label: t('nav.blog') },
];

function NavLinks() {
  return navItems.map((item) => (
    <li key={item.to}>
      <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active font-semibold' : '')}>
        {item.label}
      </NavLink>
    </li>
  ));
}

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar max-w-7xl mx-auto px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" aria-label="menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52">
              <NavLinks />
            </ul>
          </div>
          <Link to="/" className="text-xl font-bold text-primary">
            {t('site.name')}
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <NavLinks />
          </ul>
        </div>

        <div className="navbar-end gap-2">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>{user.name.charAt(0)}</span>
                  </div>
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </div>
              <ul tabIndex={0} className="menu dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52">
                {hasRole('admin') && (
                  <li>
                    <Link to="/admin">{t('admin.title')}</Link>
                  </li>
                )}
                <li>
                  <Link to="/my-plans">{t('plan.myPlans')}</Link>
                </li>
                <li>
                  <Link to="/profile">{t('nav.profile')}</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>{t('nav.logout')}</button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
