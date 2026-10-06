// Single source of truth for Firebase (modular SDK v9+).
// App.jsx imports `auth` and `db` from here — nothing else initializes Firebase.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  initializeAuth,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDB-9IDokppDTOf4TmWGbYiQNeheQ6ZSxc",
  authDomain: "j7vj7f.firebaseapp.com",
  databaseURL: "https://j7vj7f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "j7vj7f",
  storageBucket: "j7vj7f.firebasestorage.app",
  messagingSenderId: "261128145678",
  appId: "1:261128145678:web:02314ffb677b4135ca655f",
  measurementId: "G-YZM7VZQCXM",
};

/* "session" = owner is signed out when the tab closes (same behaviour as before).
   Change to "local" to keep owners signed in across browser restarts. */
export const AUTH_PERSISTENCE = "session";

// Initialize Firebase once (safe with Vite hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth — persistence is set synchronously at creation, so there is no race
// between "set persistence" and the first sign-in call.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence:
      AUTH_PERSISTENCE === "local"
        ? browserLocalPersistence
        : browserSessionPersistence,
  });
} catch {
  // Already initialized (hot reload) — reuse the existing instance
  _auth = getAuth(app);
}
export const auth = _auth;

// Realtime Database (same project / same databaseURL as before)
export const db = getDatabase(app);

// Analytics is optional and must never break the app (blocked by ad-blockers,
// unsupported in some browsers, etc.), so it is initialized defensively.
export let analytics = null;
isSupported()
  .then((ok) => {
    if (ok) analytics = getAnalytics(app);
  })
  .catch(() => {});

export default app;