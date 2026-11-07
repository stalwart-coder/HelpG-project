# Complete Cloud Deployment & Integration Guide (Cloudinary, Firebase, Render, Vercel)

This document provides a step-by-step production setup and deployment manual for **Helpजी (HelpJi)**.

---

## 📁 1. Organized Project Structure

```text
helpji-workspace/
├── backend/                  # Node.js + Express 5 REST API & WebSocket Server
│   ├── config/               # Database, Cloudinary, Firebase, JWT env config
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth, Rate limiting, Input sanitization, Error handlers
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API endpoint definitions
│   ├── services/             # Auth, Booking, Payment, Notification services
│   ├── server.js             # Main server entrypoint
│   └── .env                  # Backend environment configuration
│
├── frontened/                # React 19 + Vite 8 Single Page App
│   ├── src/                  # Components, Screens, Router, Contexts, i18n
│   ├── vercel.json           # Client-side SPA routing rules for Vercel
│   └── package.json          # Frontend dependencies
│
├── presentation/             # College & Faculty Presentation Deliverables
│   ├── HelpJi_MCA_Major_Project.pptx   # 16:9 PowerPoint presentation file
│   └── index.html                      # Interactive web presentation deck
│
├── scripts/                  # Maintenance & generator scripts
│   ├── generate_pptx.js      # PowerPoint deck generator script
│   ├── fix_profile.js        # Profile screen maintenance patch
│   └── fix_profile_v2.js     # Profile UI refinement patch
│
├── docs/                     # Project documentation & guides
│   ├── CLOUD_DEPLOYMENT_GUIDE.md  # This cloud setup manual
│   ├── API_DOCUMENTATION.md       # API endpoint specification
│   └── SETUP.md                   # Local setup instructions
│
├── package.json              # Root workspace runner
└── README.md                 # Project introduction
```

---

## ☁️ 2. Cloudinary Setup (Image & Document Storage)

Cloudinary is used for uploading:
- Customer task reference photos
- Helper KYC verification documents (Aadhaar, PAN cards)
- User profile avatars

### Step 2.1: Create a Cloudinary Account
1. Visit [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. Open your **Cloudinary Dashboard**.
3. Copy the following credentials from the **Product Environment Details** card:
   - **Cloud Name** (e.g. `dxy8abcde`)
   - **API Key** (e.g. `839182739182739`)
   - **API Secret** (e.g. `AbCdEfGhIjKlMnOpQrStUvWxYz`)

### Step 2.2: Add Cloudinary Keys to Backend `.env`
Add these keys to your `backend/.env`:
```env
# ── Cloudinary Configuration ──────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=helpji_uploads
```

### Step 2.3: How Backend Uses Cloudinary
In `backend/config/cloudinary.js`:
```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import env from './env.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpji/kyc_and_tasks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

export const uploadCloud = multer({ storage });
export default cloudinary;
```

---

## 🔥 3. Firebase Setup (FCM Push Notifications & Auth)

Firebase Cloud Messaging (FCM) is used to send real-time alerts when:
- A new task request is within the helper's radar
- A helper accepts a task
- A helper updates status (*Arrived*, *In Progress*, *Completed*)

### Step 3.1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g. `helpji-app`).
2. Go to **Project Settings** (⚙️ icon) > **Service Accounts**.
3. Click **Generate New Private Key** and download the JSON file.

### Step 3.2: Configure Backend Environment
From the downloaded JSON file, extract the values and add them to `backend/.env`:
```env
# ── Firebase Cloud Messaging (FCM) ────────────────────────────
FIREBASE_PROJECT_ID=helpji-app-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@helpji-app-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...=\n-----END PRIVATE KEY-----\n"
```

---

## 🚀 4. Deploying Backend on Render (Web Service)

Render provides free/scalable hosting for Node.js Express servers and WebSockets.

### Step 4.1: Create Render Web Service
1. Push your project repository to GitHub.
2. Log in to [Render](https://render.com/) and click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the build parameters:
   - **Name**: `helpji-api`
   - **Region**: `Singapore` or `Frankfurt` (closest to India)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

### Step 4.2: Add Environment Variables in Render
In the Render **Environment** tab, add:
| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | Server listening port |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/helpji` | MongoDB Atlas database URI |
| `JWT_ACCESS_SECRET` | `your-super-secret-64-character-jwt-access-key` | Auth token secret |
| `JWT_REFRESH_SECRET` | `your-super-secret-64-character-jwt-refresh-key`| Refresh token secret |
| `FRONTEND_URL` | `https://helpji.vercel.app` | Allowed CORS frontend URL |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary name |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary secret |

5. Click **Deploy Web Service**.
6. Copy your live backend URL (e.g. `https://helpji-api.onrender.com`).

---

## 🌐 5. Deploying Frontend on Vercel

Vercel provides global CDN hosting for Vite and React apps.

### Step 5.1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Select your GitHub repository.
3. In **Project Configuration**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontened`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 5.2: Add Environment Variable in Vercel
Under **Environment Variables**, add:
| Name | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://helpji-api.onrender.com/api` |

*(Note: Replace with your actual live Render URL from Step 4).*

### Step 5.3: Deploy & Verify
1. Click **Deploy**.
2. Once the build completes, Vercel will assign a production URL (e.g. `https://helpji.vercel.app`).
3. Open the Render backend settings and update `FRONTEND_URL` to match this exact Vercel URL to allow CORS.

---

## 🧪 6. Testing & Verifying the Deployed Platform

1. **Visit Frontend**: Open your live Vercel URL.
2. **Customer Journey**:
   - Click **Demo Customer** on `/auth` (or log in).
   - Select **Steam Ironing** -> Customize package -> Click **Book & Match**.
   - Verify task is created and Task Pulse timeline starts tracking.
3. **Helper Journey**:
   - Switch to **Partner Portal** in the header.
   - Toggle **Online / Accepting** mode.
   - Check the **Help Radar** and accept open tasks.
