import api from './axios';

// First-party crash reporting → POST /client-errors (admin → Errors).
// Capped per page load and de-duplicated so a render loop can't spam the API.
const MAX_REPORTS = 5;
const sent = new Set();

// Browser/extension noise that isn't our bug
const IGNORE = [/ResizeObserver loop/i, /^Script error\.?$/i, /extension:\/\//i];

export function reportError(error, extra = {}) {
  try {
    const message = String(error?.message || error || 'Unknown error').slice(0, 500);
    if (!message || IGNORE.some((re) => re.test(message) || re.test(error?.stack || ''))) return;
    if (sent.has(message) || sent.size >= MAX_REPORTS) return;
    sent.add(message);
    if (import.meta.env.DEV) return; // keep dev logs local
    api
      .post('/client-errors', {
        message,
        stack: String(error?.stack || '').slice(0, 4000),
        path: extra.path || window.location.pathname,
      })
      .catch(() => {});
  } catch {
    /* never throw from the reporter */
  }
}

// A deploy replaces hashed chunks; tabs opened before it fail to lazy-load pages
export function isChunkLoadError(error) {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    String(error?.message || error)
  );
}

// Reload once to pick up the new build; the timestamp guard prevents a reload loop
export function reloadForNewBuild() {
  try {
    const last = Number(sessionStorage.getItem('bl-chunk-reload') || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem('bl-chunk-reload', String(Date.now()));
  } catch {
    /* storage blocked: still try once */
  }
  window.location.reload();
  return true;
}

export function installGlobalErrorHandlers() {
  window.addEventListener('error', (e) => reportError(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => {
    // Axios rejections are API errors the UI already handles
    if (e.reason?.isAxiosError) return;
    reportError(e.reason);
  });
  // Vite fires this when a preloaded chunk 404s after a redeploy
  window.addEventListener('vite:preloadError', (e) => {
    e.preventDefault();
    reloadForNewBuild();
  });
}
