// frontend/src/firebase/firebase.js
// Firebase client configuration with real-world Email Verification & OAuth
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google popup → returns Firebase IdToken
 * (Google automatically verifies email)
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { idToken, user: result.user };
}

/**
 * Register user with Email & Password in Firebase, then send real verification email
 */
export async function signUpWithFirebaseEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await sendEmailVerification(userCredential.user);
  } catch (err) {
    console.warn('sendEmailVerification notice:', err?.message);
  }
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Resend verification email to current user
 */
export async function resendVerificationEmail(user = auth.currentUser) {
  if (!user) throw new Error('No user currently signed in to send verification email.');
  await sendEmailVerification(user);
  return true;
}

/**
 * Sign in with Email & Password via Firebase
 */
export async function signInWithFirebaseEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return {
    user: userCredential.user,
    idToken,
    emailVerified: userCredential.user.emailVerified,
  };
}

/**
 * Check if the user's email has been verified after clicking link
 */
export async function checkEmailVerified() {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
}

/**
 * Send password reset email
 */
export async function resetPasswordWithFirebase(email) {
  await sendPasswordResetEmail(auth, email);
  return true;
}

/**
 * Sign out from Firebase (local)
 */
export async function firebaseSignOut() {
  await signOut(auth);
}

export default app;
