// App-wide React Router entry point. Import routing APIs from here, not from
// 'react-router-dom': Link, NavLink and useNavigate default to view transitions
// (document.startViewTransition), so page changes cross-fade and a clicked spot
// card's photo can grow into the spot hero. Browsers without the API just
// navigate. The animations are styled in index.css under "View transitions".
//
// Every navigation must go through a view transition, not just most of them.
// React Router 7.18.4 (and 7.18.5) drops a plain navigation that lands between a
// view-transition navigation starting and the browser running its update callback
// (about one frame): the router state moves on, but the page never re-renders.
// A view-transition navigation in the same window is handled as an interruption.
// That is why Navigate and useSearchParams are wrapped too. Filter changes use a
// "quiet" transition (no animation, via html.vt-quiet) so the page doesn't fade.
import { useCallback, useEffect } from 'react';
import {
  Link as RRLink,
  NavLink as RRNavLink,
  useNavigate as useRRNavigate,
  useSearchParams as useRRSearchParams,
} from 'react-router-dom';

export * from 'react-router-dom';

const setQuiet = (on) => document.documentElement.classList.toggle('vt-quiet', on);
// A card named by an earlier, abandoned click can survive when React keeps the
// list's DOM; every navigation starts by un-naming them (morphFrom then names one)
const clearMorphs = () => document.querySelectorAll('[data-morph]').forEach((n) => (n.style.viewTransitionName = ''));
// Back/forward: animate normally (React Router reuses the pushed transition)
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    setQuiet(false);
    clearMorphs();
  });
}

function loud(onClick) {
  return (e) => {
    setQuiet(false);
    clearMorphs();
    onClick?.(e);
  };
}

export function Link({ onClick, ...props }) {
  return <RRLink viewTransition onClick={loud(onClick)} {...props} />;
}

export function NavLink({ onClick, ...props }) {
  return <RRNavLink viewTransition onClick={loud(onClick)} {...props} />;
}

export function useNavigate() {
  const navigate = useRRNavigate();
  return useCallback((to, options) => {
    if (typeof to === 'number') return navigate(to);
    setQuiet(false);
    clearMorphs();
    return navigate(to, { viewTransition: true, ...options });
  }, [navigate]);
}

// Same contract as React Router's <Navigate>: redirect after render
export function Navigate({ to, replace, state, relative }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace, state, relative });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- React Router's Navigate also fires once
  return null;
}

export function useSearchParams(init) {
  const [params, setParams] = useRRSearchParams(init);
  const set = useCallback((next, options) => {
    setQuiet(true);
    clearMorphs();
    return setParams(next, { viewTransition: true, ...options });
  }, [setParams]);
  return [params, set];
}

// Spot photo morph: name only the photo of the card being clicked, so the name
// is unique on the page (a duplicate name makes the browser skip the transition).
// Put data-morph on the card's photo wrapper and call this from the link's onClick.
export const SPOT_MORPH = 'spot-photo';

export function morphFrom(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!document.startViewTransition) return;
  clearMorphs();
  const el = e.currentTarget.querySelector('[data-morph]');
  if (el) el.style.viewTransitionName = SPOT_MORPH;
}
