/**
 * Firebase Admin SDK initialization
 * Used to verify Google Sign-In ID tokens from the frontend
 *
 * Credentials needed (in backend .env):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY  (from service account JSON, use \n for newlines in .env)
 */
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let firebaseAdminInitialized = false;

function initFirebaseAdmin() {
  if (firebaseAdminInitialized || getApps().length > 0) return;

  if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
    logger.warn(
      'Firebase Admin SDK credentials not configured. ' +
      'Google Sign-In will not work until FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set in .env'
    );
    return;
  }

  try {
    initializeApp({
      credential: cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }),
    });
    firebaseAdminInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize Firebase Admin SDK', { error: err.message });
  }
}

// Initialize on module load
initFirebaseAdmin();

/**
 * Verify a Firebase ID token and return the decoded payload
 * @param {string} idToken - Firebase ID token from frontend signInWithGoogle()
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export async function verifyFirebaseToken(idToken) {
  if (firebaseAdminInitialized || getApps().length > 0) {
    const auth = getAuth();
    return await auth.verifyIdToken(idToken);
  }

  // If in development mode and Firebase credentials are not yet configured in .env:
  // parse the JWT payload without signature verification so login flow can still be tested locally.
  if (env.isDev) {
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        logger.warn('Using unverified token decode in DEV mode because Firebase credentials are not set in .env');
        return {
          uid: payload.sub || payload.user_id || payload.uid,
          email: payload.email,
          name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
          picture: payload.picture || '',
        };
      }
    } catch (parseErr) {
      logger.error('Failed to parse dev token', { error: parseErr.message });
    }
  }

  throw new Error(
    'Firebase Admin SDK is not configured on the server. ' +
    'Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env'
  );
}


export default { verifyFirebaseToken };
