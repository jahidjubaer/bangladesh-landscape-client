import { QueryClient } from '@tanstack/react-query';

// One client for the app and for route loaders that warm the cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60 * 1000 },
  },
});

export default queryClient;

// Route loader helper: wait for a query at most `ms`, then let the page render
// (it shows its own loader if the data is still on the way). Errors are left to
// the page, which already handles them.
export function warmQuery(options, ms = 700) {
  const pending = queryClient.ensureQueryData(options).catch(() => null);
  return Promise.race([pending, new Promise((r) => setTimeout(r, ms))]).then(() => null);
}
