# HelpJi — Setup & Local Development Guide

## Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **MongoDB**: v6.0 or higher running locally on port 27017, or a MongoDB Atlas connection string.
* **npm**: v9.0.0+

---

## 1. Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your local settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/helpji

JWT_ACCESS_SECRET=your-64-character-random-secret-key-here-for-access-tokens
JWT_REFRESH_SECRET=your-64-character-random-secret-key-here-for-refresh-tokens
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

# Optional: Razorpay Test Keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Optional: AI Provider Keys (OpenAI, Gemini, Anthropic)
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-4o-mini
```

### Step 3: Run the Backend Server
```bash
# Development with auto-reload
npm run dev

# Or standard start
npm start
```
The backend will be running at `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).

---

## 2. Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontened
npm install
```

### Step 2: Configure Environment Variables (Optional)
By default, the frontend points to `http://localhost:5000/api`. To customize:
Create `.env` inside `frontened/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start the Vite Dev Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 3. Running Verification & Builds

### Backend Lint & Unit Tests
```bash
cd backend
npm test
```

### Frontend Production Build
```bash
cd frontened
npm run build
```
The optimized production bundle will be generated in `frontened/dist`.
