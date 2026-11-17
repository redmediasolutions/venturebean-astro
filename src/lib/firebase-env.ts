/**
 * Firebase web keys for reading the Content Manager. They are written in at
 * build time by astro.config.mjs (from .env, or the Cloudflare build variables
 * named PUBLIC_FIREBASE_… or NEXT_PUBLIC_FIREBASE_…).
 */
export const firebaseEnv = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID ?? '',
};
