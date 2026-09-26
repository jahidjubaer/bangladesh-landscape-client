import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/public/Home';
import Districts from '../pages/public/Districts';
import District from '../pages/public/District';
import Spot from '../pages/public/Spot';
import PlanWizard from '../pages/public/PlanWizard';
import PlanView from '../pages/public/PlanView';
import MyPlans from '../pages/user/MyPlans';
import Guides from '../pages/public/Guides';
import GuideDetail from '../pages/public/GuideDetail';
import BecomeGuide from '../pages/public/BecomeGuide';
import GuideDashboard from '../pages/guide/GuideDashboard';
import MyBookings from '../pages/user/MyBookings';
import AdminGuideApplications from '../pages/admin/AdminGuideApplications';
import AdminPayments from '../pages/admin/AdminPayments';
import { lazy, Suspense } from 'react';
import BlogList from '../pages/public/BlogList';
import BlogDetail from '../pages/public/BlogDetail';
import MyBlogs from '../pages/user/MyBlogs';
import Loader from '../components/Loader';

// Quill is heavy — load the editor only when someone actually writes
const BlogEditor = lazy(() => import('../pages/user/BlogEditor'));
const LazyEditor = (
  <Suspense fallback={<Loader fullScreen />}>
    <BlogEditor />
  </Suspense>
);
import AdminBlogs from '../pages/admin/AdminBlogs';
import AdminAds from '../pages/admin/AdminAds';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminListings from '../pages/admin/AdminListings';
import PolicyPage from '../pages/public/PolicyPage';
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

      // Tour plans (Phase 3)
      { path: 'plan', element: <PlanWizard /> },
      { path: 'plans/:publicId', element: <PlanView /> },

      // Guides (Phase 4)
      { path: 'guides', element: <Guides /> },
      { path: 'guides/:id', element: <GuideDetail /> },
      { path: 'become-guide', element: <BecomeGuide /> },

      // Blog (Phase 5)
      { path: 'blog', element: <BlogList /> },
      { path: 'blog/:slug', element: <BlogDetail /> },
      { path: 'write-blog', element: LazyEditor },
      { path: 'write-blog/:id', element: LazyEditor },

      // Policies (Phase 6)
      { path: 'policies/:type', element: <PolicyPage /> },

      // Authenticated routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <Profile /> },
          { path: 'my-plans', element: <MyPlans /> },
          { path: 'my-bookings', element: <MyBookings /> },
          { path: 'my-blogs', element: <MyBlogs /> },
        ],
      },

      // Guide dashboard (role-gated)
      {
        element: <ProtectedRoute roles={['guide']} />,
        children: [{ path: 'guide-dashboard', element: <GuideDashboard /> }],
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
              { path: 'guide-applications', element: <AdminGuideApplications /> },
              { path: 'payments', element: <AdminPayments /> },
              { path: 'blogs', element: <AdminBlogs /> },
              { path: 'ads', element: <AdminAds /> },
              { path: 'listings', element: <AdminListings /> },
              { path: 'settings', element: <AdminSettings /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
