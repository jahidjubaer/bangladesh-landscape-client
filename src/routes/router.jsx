import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Loader from '../components/Loader';
import Home from '../pages/public/Home';
import NotFound from '../pages/NotFound';

// Route-level code splitting: each page ships as its own chunk and the
// router waits for it during navigation, so the previous page stays
// visible instead of flashing a spinner.
const lazyPage = (load) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    hydrateFallbackElement: <Loader fullScreen />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', lazy: lazyPage(() => import('../pages/auth/Login')) },
      { path: 'register', lazy: lazyPage(() => import('../pages/auth/Register')) },

      // District content (Phase 2)
      { path: 'explore', lazy: lazyPage(() => import('../pages/public/Explore')) },
      { path: 'districts', lazy: lazyPage(() => import('../pages/public/Districts')) },
      { path: 'districts/:slug', lazy: lazyPage(() => import('../pages/public/District')) },
      { path: 'spots/:slug', lazy: lazyPage(() => import('../pages/public/Spot')) },
      { path: 'listings/:id', lazy: lazyPage(() => import('../pages/public/ListingDetail')) },

      // Tour plans (Phase 3)
      { path: 'plan', lazy: lazyPage(() => import('../pages/public/PlanWizard')) },
      { path: 'plans/:publicId', lazy: lazyPage(() => import('../pages/public/PlanView')) },

      // Guides (Phase 4)
      { path: 'guides', lazy: lazyPage(() => import('../pages/public/Guides')) },
      { path: 'guides/:id', lazy: lazyPage(() => import('../pages/public/GuideDetail')) },
      { path: 'become-guide', lazy: lazyPage(() => import('../pages/public/BecomeGuide')) },

      // Blog (Phase 5) — Quill editor is the heaviest chunk of all
      { path: 'blog', lazy: lazyPage(() => import('../pages/public/BlogList')) },
      { path: 'blog/:slug', lazy: lazyPage(() => import('../pages/public/BlogDetail')) },
      { path: 'write-blog', lazy: lazyPage(() => import('../pages/user/BlogEditor')) },
      { path: 'write-blog/:id', lazy: lazyPage(() => import('../pages/user/BlogEditor')) },

      // Policies (Phase 6)
      { path: 'policies/:type', lazy: lazyPage(() => import('../pages/public/PolicyPage')) },
      { path: 'credits', lazy: lazyPage(() => import('../pages/public/PhotoCredits')) },
      { path: 'stays', lazy: lazyPage(() => import('../pages/public/Stays')) },
      { path: 'gallery', lazy: lazyPage(() => import('../pages/public/Gallery')) },
      { path: 'events', lazy: lazyPage(() => import('../pages/public/Events')) },
      { path: 'events/:slug', lazy: lazyPage(() => import('../pages/public/EventDetail')) },

      // Authenticated routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', lazy: lazyPage(() => import('../pages/user/Profile')) },
          { path: 'my-plans', lazy: lazyPage(() => import('../pages/user/MyPlans')) },
          { path: 'my-bookings', lazy: lazyPage(() => import('../pages/user/MyBookings')) },
          { path: 'wishlist', lazy: lazyPage(() => import('../pages/user/Wishlist')) },
          { path: 'my-blogs', lazy: lazyPage(() => import('../pages/user/MyBlogs')) },
          { path: 'settings', lazy: lazyPage(() => import('../pages/user/Settings')) },
        ],
      },

      // Guide dashboard (role-gated)
      {
        element: <ProtectedRoute roles={['guide']} />,
        children: [
          { path: 'guide-dashboard', lazy: lazyPage(() => import('../pages/guide/GuideDashboard')) },
        ],
      },

      // Partner dashboard (role-gated)
      {
        element: <ProtectedRoute roles={['partner']} />,
        children: [
          { path: 'partner-dashboard', lazy: lazyPage(() => import('../pages/partner/PartnerDashboard')) },
        ],
      },

      // Admin (role-gated)
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [
          {
            path: 'admin',
            lazy: lazyPage(() => import('../layouts/AdminLayout')),
            children: [
              { index: true, lazy: lazyPage(() => import('../pages/admin/AdminDashboard')) },
              { path: 'districts', lazy: lazyPage(() => import('../pages/admin/AdminDistricts')) },
              { path: 'districts/:id', lazy: lazyPage(() => import('../pages/admin/AdminDistrictForm')) },
              { path: 'spots', lazy: lazyPage(() => import('../pages/admin/AdminSpots')) },
              { path: 'spots/:id', lazy: lazyPage(() => import('../pages/admin/AdminSpotForm')) },
              { path: 'guide-applications', lazy: lazyPage(() => import('../pages/admin/AdminGuideApplications')) },
              { path: 'payments', lazy: lazyPage(() => import('../pages/admin/AdminPayments')) },
              { path: 'blogs', lazy: lazyPage(() => import('../pages/admin/AdminBlogs')) },
              { path: 'reviews', lazy: lazyPage(() => import('../pages/admin/AdminReviews')) },
              { path: 'ads', lazy: lazyPage(() => import('../pages/admin/AdminAds')) },
              { path: 'users', lazy: lazyPage(() => import('../pages/admin/AdminUsers')) },
              { path: 'events', lazy: lazyPage(() => import('../pages/admin/AdminEvents')) },
              { path: 'listings', lazy: lazyPage(() => import('../pages/admin/AdminListings')) },
              { path: 'settings', lazy: lazyPage(() => import('../pages/admin/AdminSettings')) },
            ],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
