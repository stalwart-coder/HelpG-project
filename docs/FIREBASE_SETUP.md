# HelpJi — Complete Firebase Setup & Production Guide

This guide details how to configure Firebase for HelpJi across **Authentication**, **Firebase Cloud Messaging (FCM)**, and **Storage** without modifying the core backend architecture.

---

## Architecture Overview

HelpJi uses a hybrid architecture:
1. **Frontend (Vercel)**: Connects to Firebase Web SDK (optional client analytics, web push registration, recaptcha phone verification) and the HelpJi Node/Express API.
2. **Backend (Render)**: Uses Firebase Cloud Messaging (REST API / Admin SDK) to dispatch push notifications to mobile and web helper/customer devices.
3. **Security Rule**: Sensitive server credentials (`FCM_SERVER_KEY`, service account keys) are **strictly stored on Render** and never exposed to the frontend.

---

## Step 1: Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `helpji-production`).
3. (Optional) Enable Google Analytics for production metrics.
4. Click **Create Project** and wait for provisioning.

---

## Step 2: Register Web App (Frontend)

1. On the Firebase Project Overview page, click the **Web icon** (`</>`) to add an app.
2. App nickname: `HelpJi Web`.
3. Check **Also set up Firebase Hosting** (optional, since frontend deploys to Vercel).
4. Click **Register app**.
5. Copy the `firebaseConfig` keys provided.

### Frontend Environment Variables (`frontened/.env`)
Add these to your local `.env` and in **Vercel Project Settings → Environment Variables**:

```env
VITE_API_URL=https://<your-render-backend-url>.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyA...
VITE_FIREBASE_AUTH_DOMAIN=helpji-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=helpji-production
VITE_FIREBASE_STORAGE_BUCKET=helpji-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

---

## Step 3: Configure Cloud Messaging (FCM Push Notifications)

HelpJi's `backend/services/notificationService.js` automatically delivers real-time notifications for task creation, helper matching, arrival milestones, and payment settlement.

1. In Firebase Console, go to **Project Settings** (gear icon) → **Cloud Messaging** tab.
2. If Cloud Messaging API (Legacy) is disabled:
   - Click the three dots on the right → **Manage API in Google Cloud Console**.
   - Enable **Firebase Cloud Messaging API**.
   - Copy the **Server key**.
3. (Recommended v1 HTTP API):
   - Go to **Project Settings** → **Service accounts** tab.
   - Click **Generate new private key** and download the JSON.

### Backend Environment Variables (`backend/.env` & Render)
Add these to your Render environment variables:

```env
FCM_SERVER_KEY=your_firebase_server_key_here
FCM_PROJECT_ID=helpji-production
```

---

## Step 4: Configure Firebase Authentication (Phone OTP & Google)

HelpJi supports direct SMS/phone OTP and Google Sign-in:

1. In Firebase Console, open **Build → Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - **Phone**: Click Enable. (You can also add test phone numbers like `+91 9876543210` with verification code `123456` for instant testing without consuming SMS credits).
   - **Google**: Click Enable, set Support email to your admin email, and save.
4. **Authorized Domains**:
   - Scroll to **Authorized domains** under Authentication settings.
   - Click **Add domain**.
   - Add your Vercel deployment URL (e.g. `helpji-app.vercel.app`) and custom domains (e.g. `helpji.com`).
   - `localhost` is already included by default.

---

## Step 5: Firebase Storage (Optional Attachment Storage)

If hosting task attachments and KYC images on Firebase Storage rather than local Render disk:

1. In Firebase Console, open **Build → Storage**.
2. Click **Get Started** and choose production security rules.
3. Select your cloud bucket region (e.g. `asia-south1` for India / Mumbai).
4. Set storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /kyc/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{taskId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Verification Checklist

| Service | Test Case | Success Criteria |
| :--- | :--- | :--- |
| **FCM Push** | Run `notifyUser()` in backend | Logs `[FCM] Push notification sent` with 200 response |
| **Phone OTP** | Trigger login OTP in test mode | OTP received or test verification code accepted |
| **Auth Domains** | Open Vercel URL | No `auth/unauthorized-domain` error in browser console |
| **Credentials** | Inspect frontend build bundle | Zero backend secrets or private keys bundled in JS |
