/**
 * Firebase Client Configuration & Service Initializer
 *
 * Integrates optional Firebase features:
 * - Firebase Authentication (Phone OTP / Google Sign-in)
 * - Firebase Cloud Messaging (Web Push Notifications)
 * - Firebase Storage (Image & Attachment uploads)
 *
 * If environment variables are not provided, features degrade gracefully
 * to HelpJi's native backend services.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export function getFirebaseConfig() {
  return firebaseConfig;
}

export default firebaseConfig;
