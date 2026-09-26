import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/public/Home';
import Districts from '../pages/public/Districts';
import District from '../pages/public/District';
import Spot from '../pages/public/Spot';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/user/Profile';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDistricts from '../pages/admin/AdminDistricts';
import AdminDistrictForm from '../pages/admin/AdminDistrictForm';
import AdminSpots from '../pages/admin/AdminSpots';
import AdminSpotForm from '../pages/admin/AdminSpotForm';
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

      // District content (Phase 2)
      { path: 'districts', element: <Districts /> },
      { path: 'districts/:slug', element: <District /> },
      { path: 'spots/:slug', element: <Spot /> },

      // Phase 3+ placeholders
      { path: 'guides', element: <ComingSoon title={t('nav.guides')} /> },
      { path: 'blog', element: <ComingSoon title={t('nav.blog')} /> },
      { path: 'plan', element: <ComingSoon title={t('nav.planTour')} /> },
      { path: 'policies/:type', element: <ComingSoon title={t('footer.policies')} /> },

      // Authenticated routes
      {
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <Profile /> }],
      },

      // Admin (role-gated)
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'districts', element: <AdminDistricts /> },
              { path: 'districts/:id', element: <AdminDistrictForm /> },
              { path: 'spots', element: <AdminSpots /> },
              { path: 'spots/:id', element: <AdminSpotForm /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
