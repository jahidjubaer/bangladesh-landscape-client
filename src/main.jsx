import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from './lib/router';
import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmModal';
import router from './routes/router';
import queryClient from './lib/queryClient';
import { installGlobalErrorHandlers } from './lib/errorReporter';
import { applySeason } from './lib/seasons';
import { applyDataSaver } from './lib/dataSaver';
import './index.css';

installGlobalErrorHandlers();
applySeason();
applyDataSaver();

// Components render with the lightweight `m` element; animation features arrive in a separate chunk
const motionFeatures = () => import('./lib/motionFeatures').then((mod) => mod.default);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={motionFeatures}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <RouterProvider router={router} />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LazyMotion>
  </StrictMode>
);

// PWA: offline shell + cached plans (production builds only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
