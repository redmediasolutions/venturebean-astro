/**
 * Firebase web keys for the site build. Accepts either name, so the same
 * values work locally (.env → PUBLIC_FIREBASE_…) and on Cloudflare, where the
 * build variables were added with the Content Manager's names
 * (NEXT_PUBLIC_FIREBASE_…).
 */
const pick = (...values: (string | undefined)[]) => values.find((v) => typeof v === 'string' && v.trim())?.trim() ?? '';
const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

export const firebaseEnv = {
  apiKey: pick(import.meta.env.PUBLIC_FIREBASE_API_KEY, env.PUBLIC_FIREBASE_API_KEY, env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: pick(import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN, env.PUBLIC_FIREBASE_AUTH_DOMAIN, env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: pick(import.meta.env.PUBLIC_FIREBASE_PROJECT_ID, env.PUBLIC_FIREBASE_PROJECT_ID, env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: pick(import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET, env.PUBLIC_FIREBASE_STORAGE_BUCKET, env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: pick(
    import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: pick(import.meta.env.PUBLIC_FIREBASE_APP_ID, env.PUBLIC_FIREBASE_APP_ID, env.NEXT_PUBLIC_FIREBASE_APP_ID),
};
