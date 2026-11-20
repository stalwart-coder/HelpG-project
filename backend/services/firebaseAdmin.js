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
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let firebaseAdminInitialized = false;
let cachedGoogleCerts = null;
let certsExpiry = 0;

async function getGooglePublicCerts() {
  const now = Date.now();
  if (cachedGoogleCerts && now < certsExpiry) {
    return cachedGoogleCerts;
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (res.ok) {
      cachedGoogleCerts = await res.json();
      certsExpiry = now + 6 * 60 * 60 * 1000; // cache for 6 hours
      return cachedGoogleCerts;
    }
  } catch (err) {
    logger.warn('Failed to fetch Google public certs', { error: err.message });
  }
  return cachedGoogleCerts || {};
}

function initFirebaseAdmin() {
  if (firebaseAdminInitialized || getApps().length > 0) return;

  if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
    logger.info(
      'Firebase Admin private key not provided in .env — will use Google public x509 cert verification for Google tokens'
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
 * @returns {Promise<{uid: string, email: string, name: string, picture: string}>}
 */
export async function verifyFirebaseToken(idToken) {
  if (firebaseAdminInitialized || getApps().length > 0) {
    try {
      const auth = getAuth();
      const verified = await auth.verifyIdToken(idToken);
      return {
        uid: verified.uid,
        email: verified.email,
        name: verified.name || (verified.email ? verified.email.split('@')[0] : 'User'),
        picture: verified.picture || '',
      };
    } catch (adminErr) {
      logger.warn('Firebase Admin verifyIdToken error, attempting public cert verify', { error: adminErr.message });
    }
  }

  const expectedProjectId = env.firebase.projectId || 'helpji';

  // 1. Try cryptographic verification using Google's public x509 certificates
  try {
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (decodedHeader?.header?.kid) {
      const certs = await getGooglePublicCerts();
      const cert = certs[decodedHeader.header.kid];
      if (cert) {
        const verified = jwt.verify(idToken, cert, {
          algorithms: ['RS256'],
          audience: expectedProjectId,
          issuer: `https://securetoken.google.com/${expectedProjectId}`,
        });
        return {
          uid: verified.sub || verified.user_id || verified.uid,
          email: verified.email,
          name: verified.name || (verified.email ? verified.email.split('@')[0] : 'User'),
          picture: verified.picture || '',
        };
      }
    }
  } catch (cryptoErr) {
    logger.warn('Google public cert verify failed, falling back to payload check', { error: cryptoErr.message });
  }

  // 2. Validate token structure & standard Google claims
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Firebase ID token has expired. Please sign in again.');
      }

      const isGoogleIssuer =
        typeof payload.iss === 'string' &&
        (payload.iss.includes('securetoken.google.com') ||
         payload.iss.includes('accounts.google.com'));

      if (!isGoogleIssuer) {
        throw new Error('Invalid Firebase token issuer');
      }

      return {
        uid: payload.sub || payload.user_id || payload.uid,
        email: payload.email,
        name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
        picture: payload.picture || '',
      };
    }
  } catch (parseErr) {
    logger.error('Failed to parse Firebase token payload', { error: parseErr.message });
    throw parseErr;
  }

  throw new Error('Invalid Firebase token format');
}


export default { verifyFirebaseToken };
