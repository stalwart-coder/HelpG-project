# Helpजी — Hyperlocal Micro-Task & On-Demand Help Platform

> **MCA Major Project (2025–2026)**  
> **Presented By:** Bipin Kumar Pal  
> **Core Concept:** Connecting local neighborhood needs with nearby verified helpers for small, fast, everyday tasks.

---

## 📂 Project Organization

```text
├── backend/                  # Express 5 REST API & Socket.IO server
├── frontened/                # React 19 + Vite 8 SPA frontend
├── presentation/             # College presentation deliverables
│   ├── HelpJi_MCA_Major_Project.pptx   # Native PowerPoint presentation
│   └── index.html                      # Interactive web presentation deck
├── scripts/                  # Project maintenance & generator scripts
│   ├── generate_pptx.js      # PowerPoint deck generator script
│   ├── fix_profile.js        # Profile maintenance script
│   └── fix_profile_v2.js     # Profile UI refinement script
├── docs/                     # Comprehensive documentation
│   ├── CLOUD_DEPLOYMENT_GUIDE.md  # Cloudinary, Firebase, Render, Vercel setup
│   ├── API_DOCUMENTATION.md       # Complete REST API specifications
│   └── SETUP.md                   # Local setup instructions
├── package.json              # Workspace root scripts
└── README.md
```

---

## ⚡ Quick Start (Running Locally)

### 1. Run Frontend Development Server
```bash
npm run dev
```
Accessible at: **`http://localhost:5173/`**

### 2. Run Backend Server
```bash
npm run dev:backend
```
Accessible at: **`http://localhost:5000/`**

### 3. Run Backend & Frontend Simultaneously
```bash
npm run dev:all
```

### 4. Run Backend Test Suite
```bash
npm run test:backend
```
*(Runs all 10 unit and integration test suites / 107 tests)*

### 5. Build Production Bundle
```bash
npm run build
```

---

## 🎓 College Presentation Deliverables

- **PowerPoint File (.pptx)**: [`presentation/HelpJi_MCA_Major_Project.pptx`](./presentation/HelpJi_MCA_Major_Project.pptx)
- **Interactive Web Slides**: Open [`presentation/index.html`](./presentation/index.html) in any browser (Press **`F`** for fullscreen).
- **Deployment & Cloud Setup Guide**: [`docs/CLOUD_DEPLOYMENT_GUIDE.md`](./docs/CLOUD_DEPLOYMENT_GUIDE.md)
