# HelpJi — Production Deployment Guide (Vercel + Render + MongoDB Atlas)

This guide provides exact step-by-step instructions to deploy HelpJi in production:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite SPA)
- **Backend API**: [Render](https://render.com) (Node.js Express + Socket.IO)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

```
User (Browser) ──HTTPS──> Vercel Frontend (helpji.vercel.app)
                               │
                          API Requests
                               │
                               ▼
                   Render Backend (helpji-api.onrender.com)
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        MongoDB Atlas      Firebase FCM     Razorpay Gateway
```

---

## Part 1: Backend Deployment on Render

### Step 1.1: Push Repository to GitHub
Ensure all latest code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Production ready HelpJi stack"
git push origin main
```

### Step 1.2: Create a Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Configure service settings:
   - **Name**: `helpji-backend` (or your chosen name)
   - **Region**: Singapore or Frankfurt (closest to your primary users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free or Starter (Starter recommended for persistent WebSocket connections)

### Step 1.3: Set Environment Variables on Render
Under the **Environment** tab, add the following variables:

| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `10000` (or leave default, Render sets `PORT` automatically) | `10000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/helpji?retryWrites=true&w=majority` |
| `JWT_ACCESS_SECRET` | 64-character random string | `e4f9b8c7...` |
| `JWT_REFRESH_SECRET` | 64-character random string | `a1b2c3d4...` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://helpji.vercel.app` |
| `RATE_LIMIT_MAX` | Max requests per IP per 15 min | `150` |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window in ms | `900000` |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key | *(From Firebase Console)* |
| `FCM_PROJECT_ID` | Firebase project ID | `helpji-production` |
| `RAZORPAY_KEY_ID` | Razorpay live or test key | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `...` |

### Step 1.4: Verify Render Deployment
1. Wait for build to complete. The logs will display:
   ```
   Server running in production mode on port 10000
   Frontend URL: https://helpji.vercel.app
   Connected to MongoDB database
   ```
2. Test the public health check endpoint in browser or curl:
   ```bash
   curl https://helpji-backend.onrender.com/api/health
   ```
   **Expected Response:**
   ```json
   { "status": "ok", "uptime": 12, "timestamp": "...", "database": "connected" }
   ```

---

## Part 2: Frontend Deployment on Vercel

### Step 2.1: Import Project into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.

### Step 2.2: Configure Framework & Root Directory
- **Framework Preset**: `Vite`
- **Root Directory**: Click Edit → select `frontened`
- **Build Command**: `npm run build` (or `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 2.3: Configure Vercel Environment Variables
Add the following in Vercel **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://helpji-backend.onrender.com/api` | Full URL to your Render API |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `helpji-production.firebaseapp.com` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `helpji-production` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `helpji-production.appspot.com` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:123456789012:web:...` | Firebase Web App ID |

### Step 2.4: SPA Routing Confirmation
The repository already contains `frontened/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This guarantees that all React Router direct URLs (e.g. `/admin/dashboard`, `/customer/home`, `/helper/kyc`) resolve smoothly without 404 errors on page reload.

### Step 2.5: Deploy
Click **Deploy**. Vercel will build the frontend assets with tree-shaking and minification. Once finished, you receive your production URL (e.g. `https://helpji.vercel.app`).

---

## Part 3: Vercel + Render Production Connection Verification

To confirm the full end-to-end pipeline:

1. **CORS Handshake**:
   - Open browser developer tools → Network tab on your Vercel URL.
   - Any request to `https://helpji-backend.onrender.com/api/...` should succeed with status `200` or `201` and header `access-control-allow-origin: https://helpji.vercel.app`.
   - `backend/server.js` dynamically recognizes any `*.vercel.app` origin or the explicit `FRONTEND_URL` variable.

2. **Reverse Proxy Trust**:
   - `backend/server.js` specifies `app.set('trust proxy', 1);`.
   - Client IPs are properly resolved across Render's Cloudflare / AWS edge routing, ensuring genuine users never get blocked by rate limiting.

3. **Authentication & Session Tokens**:
   - Cookie attributes (`SameSite`, `Secure`, `HttpOnly`) operate over HTTPS in production.
   - JWT tokens persist in session/local storage across page refreshes and route transitions.

4. **Firebase Domain Whitelist**:
   - In Firebase Console → Authentication → Settings → Authorized domains: ensure your Vercel domain (`*.vercel.app`) is listed.
