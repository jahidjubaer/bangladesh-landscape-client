import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/user/Profile';
import ComingSoon from '../pages/ComingSoon';
import NotFound from '../pages/NotFound';
import { t } from '../i18n';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Phase 2+ placeholders
      { path: 'districts', element: <ComingSoon title={t('nav.districts')} /> },
      { path: 'guides', element: <ComingSoon title={t('nav.guides')} /> },
      { path: 'blog', element: <ComingSoon title={t('nav.blog')} /> },
      { path: 'plan', element: <ComingSoon title={t('nav.planTour')} /> },
      { path: 'policies/:type', element: <ComingSoon title={t('footer.policies')} /> },

      // Authenticated routes
      {
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <Profile /> }],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
