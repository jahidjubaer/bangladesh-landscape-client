// Google sign-in through Firebase Auth. The SDK (~60 KB gzip) loads only when someone
// presses the Google button, so it never touches the first-load budget.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const googleSignInEnabled = Boolean(config.apiKey && config.authDomain && config.projectId);

let authPromise = null;
function loadAuth() {
  if (!authPromise) {
    authPromise = Promise.all([import('firebase/app'), import('firebase/auth')]).then(([app, auth]) => ({
      auth,
      instance: auth.getAuth(app.initializeApp(config)),
    }));
    authPromise.catch(() => {
      authPromise = null; // retry on the next click after a network failure
    });
  }
  return authPromise;
}

// Warm the SDK on hover/focus so the popup opens without a visible delay
export function preloadGoogleSignIn() {
  if (googleSignInEnabled) loadAuth().catch(() => {});
}

// Opens the Google popup and returns a Firebase ID token for the server to verify,
// or null when the user closed the popup. The server session cookie is the only
// session we keep, so the Firebase session is signed out right away.
export async function getGoogleIdToken() {
  const { auth, instance } = await loadAuth();
  const provider = new auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await auth.signInWithPopup(instance, provider);
    const idToken = await cred.user.getIdToken();
    auth.signOut(instance).catch(() => {});
    return idToken;
  } catch (err) {
    if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(err?.code)) return null;
    throw err;
  }
}
