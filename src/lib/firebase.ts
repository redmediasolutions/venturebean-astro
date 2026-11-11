/**
 * Read-only Firebase connection used while the site is being BUILT.
 * Keys come from the .env file (see .env.example; on Cloudflare the build
 * variables, see firebase-env.ts) — the same Firebase
 * project as the Content Manager admin panel.
 */
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore/lite';
import { firebaseEnv } from './firebase-env';

const config = firebaseEnv;

export const isCmsConfigured = Boolean(config.apiKey && config.projectId);

let db: Firestore | undefined;
export function getDb(): Firestore {
  if (!db) db = getFirestore(getApps().length ? getApp() : initializeApp(config));
  return db;
}
