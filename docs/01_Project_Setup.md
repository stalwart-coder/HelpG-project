# 01 — Project Setup

> **Document Version:** 1.0  
> **Project:** HelpJi — Kaam ka Bharosa  
> **Audience:** New developers joining the project

---

## 1. Project Overview

### Purpose

HelpJi is a two-sided marketplace mobile-first web application that connects **customers** with **verified local helpers** for small household and personal tasks. Customers can post tasks (ironing, vehicle wash, guard duty, event staff) and get matched with nearby helpers. Helpers can browse available tasks, accept bookings, manage their schedule, and track earnings.

### High-Level Architecture

The application follows a **client-server architecture** with a **React frontend** communicating with an **Express REST API** over HTTP/JSON. The backend connects to **MongoDB** for data persistence. Real-time chat is handled via **Socket.IO** WebSocket connections.

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (helpji-fixed/)                    │
│       React 19 + Vite + Tailwind CSS + Framer Motion         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    API Client (fetch)                    │  │
│  │           Automatic JWT refresh on 401 responses         │  │
│  └─────────────────────────┬───────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP REST (JSON) — Port 5000
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (backend/)                       │
│                 Express 5 + Socket.IO 4                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                Middleware Pipeline                        │  │
│  │  Helmet → CORS → Compression → Morgan → RateLimit       │  │
│  │  → Auth (JWT) → Validator → Controller → Service        │  │
│  └─────────────────────────┬───────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Socket.IO Server                         │  │
│  │           Real-time chat + typing + read receipts        │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │ Mongoose ODM v8
                             ▼
              ┌───────────────────────────────┐
              │           MongoDB 7+           │
              │  Atlas (production) or Local   │
              └───────────────────────────────┘
```

### Frontend Technology

| Aspect | Technology | Version |
|--------|-----------|---------|
| **Framework** | React | ^19.0.0 |
| **Build Tool** | Vite | ^6.x |
| **Language** | JavaScript (JSX) | ES2022+ |
| **CSS Framework** | Tailwind CSS | ^3.4.17 |
| **CSS Processing** | PostCSS + Autoprefixer | ^8.x / ^10.x |
| **Animation** | Framer Motion | ^12.5.0 |
| **Routing** | React Router DOM | ^7.1.0 |
| **Icons** | Lucide React | ^0.469.0 |
| **HTTP Client** | Native `fetch` (custom wrapper) | Built-in |
| **State Management** | React Context API | Built-in |
| **Internationalization** | Custom i18n context | Custom |
| **Module System** | ES Modules | Native |

### Backend Technology

| Aspect | Technology | Version |
|--------|-----------|---------|
| **Runtime** | Node.js | v20.x LTS |
| **Framework** | Express | ^5.1.0 |
| **Language** | JavaScript | ES2022+ |
| **Module System** | ES Modules (`"type": "module"`) | Native |
| **Database ODM** | Mongoose | ^8.13.1 |
| **Authentication** | jsonwebtoken + bcryptjs | ^9.0.2 / ^3.0.2 |
| **Payment Gateway** | Razorpay SDK | Latest |
| **File Upload** | Multer + Sharp | ^2.0.0 / ^0.34.1 |
| **Real-time** | Socket.IO | Latest |
| **Validation** | express-validator | ^7.2.1 |
| **Logging** | Winston + Morgan | ^3.17.0 / ^1.10.0 |
| **Security** | Helmet + express-rate-limit + XSS sanitize | ^8.1.0 / ^7.5.0 |
| **Testing** | Jest + MongoDB Memory Server | ^29.x / Latest |

### Database

| Aspect | Detail |
|--------|--------|
| **System** | MongoDB 7+ |
| **Driver** | Mongoose 8.13.1 |
| **Hosting** | MongoDB Atlas (recommended) or Local instance |
| **Connection Pool** | Max 10 connections, 5s server selection timeout, 45s socket timeout |
| **Models** | 18 Mongoose models in `backend/models/` |

### Folder Structure

```
helpji-web-fixed/
│
├── backend/                               # Express 5 API server
│   ├── config/                            # Database & env configuration
│   │   ├── database.js                    #   MongoDB connection via Mongoose
│   │   └── env.js                         #   Environment variable loader (dotenv)
│   ├── controllers/                       # Route handler functions
│   │   ├── authController.js              #   Signup, login, OTP, logout, refresh
│   │   ├── bookingController.js           #   Create, list, update, cancel, reschedule
│   │   ├── helperController.js            #   Profile, dashboard, tasks, earnings
│   │   ├── healthController.js            #   Health check endpoint
│   │   └── withdrawController.js          #   Withdrawal requests
│   ├── middleware/                        # Express middleware
│   │   ├── auth.js                        #   authenticate() + authorize() — JWT
│   │   ├── adminAuth.js                   #   authenticateAdmin() — admin-only JWT
│   │   ├── errorHandler.js                #   errorConverter + errorHandler
│   │   ├── rateLimiter.js                 #   Global, auth, admin rate limiters
│   │   ├── validate.js                    #   express-validator result checker
│   │   ├── upload.js                      #   Multer + Sharp configuration
│   │   └── sanitize.js                    #   XSS sanitization
│   ├── models/                            # 18 Mongoose schemas
│   │   ├── User.js                        #   User accounts (customer, helper, admin)
│   │   ├── Booking.js                     #   Service bookings with timeline
│   │   ├── HelperProfile.js               #   Helper details, skills, KYC, stats, bank
│   │   ├── Availability.js                #   Helper availability schedule
│   │   ├── ServiceArea.js                 #   Helper service areas with GeoJSON
│   │   ├── Otp.js                         #   OTP codes for phone verification
│   │   ├── Transaction.js                 #   Payment and withdrawal transactions
│   │   ├── Wallet.js                      #   User wallet balances
│   │   ├── Category.js                    #   Service categories
│   │   ├── Service.js                     #   Service offerings
│   │   ├── Review.js                      #   Customer reviews
│   │   ├── Notification.js                #   Push notification records
│   │   ├── Conversation.js                #   Chat conversations
│   │   ├── Message.js                     #   Chat messages
│   │   ├── Admin.js                       #   Admin accounts
│   │   ├── AuditLog.js                    #   Admin action audit trail
│   │   ├── SupportTicket.js               #   Customer support tickets
│   │   └── Coupon.js                      #   Discount coupons
│   ├── routes/                            # Express route definitions
│   │   ├── apiRoutes.js                   #   Central route aggregator
│   │   ├── authRoutes.js                  #   /api/auth/*
│   │   ├── bookingRoutes.js               #   /api/bookings/*
│   │   ├── helperRoutes.js                #   /api/helpers/*
│   │   ├── chatRoutes.js                  #   /api/chat/*
│   │   ├── adminRoutes.js                 #   /api/admin/*
│   │   ├── kycRoutes.js                   #   /api/kyc/*
│   │   └── healthRoutes.js                #   /api/health
│   ├── services/                          # Business logic layer
│   │   ├── authService.js                 #   Signup, login, OTP, password reset
│   │   ├── bookingService.js              #   Create, list, update, cancel, reschedule
│   │   ├── helperService.js               #   Profile, dashboard, tasks, earnings
│   │   ├── paymentService.js              #   Razorpay orders, verification, refunds
│   │   ├── withdrawService.js             #   Withdrawal requests and history
│   │   ├── chatService.js                 #   Conversations, messages, unread counts
│   │   ├── adminService.js                #   Admin dashboard, users, helpers, reports
│   │   ├── tokenService.js                #   JWT token generation and verification
│   │   ├── notificationService.js         #   Push notification stubs
│   │   ├── emailService.js                #   Email sending stubs
│   │   └── smsService.js                  #   SMS sending stubs
│   ├── validations/                       # express-validator rule sets
│   │   ├── index.js                       #   Common validation rules
│   │   ├── authValidation.js              #   Signup, login, OTP rules
│   │   ├── bookingValidation.js           #   Create, update, cancel rules
│   │   ├── helperValidation.js            #   Profile, availability, schedule, area rules
│   │   └── withdrawValidation.js          #   Withdrawal request rules
│   ├── utils/                             # Shared utilities
│   │   ├── ApiError.js                    #   Custom error class with status code
│   │   ├── ApiResponse.js                 #   Standardized response wrapper
│   │   ├── asyncHandler.js                #   Async route error catcher
│   │   └── logger.js                      #   Winston logger configuration
│   ├── seeds/                             # Database seed scripts
│   │   └── adminSeed.js                   #   Creates 5 admin accounts
│   ├── tests/                             # Jest test suites
│   │   ├── unit/                          #   7 unit test files
│   │   ├── api/                           #   2 API integration test files
│   │   ├── integration/                   #   1 flow integration test file
│   │   ├── helpers/                       #   Test utilities (db.js)
│   │   └── fixtures/                      #   Setup/teardown/factories
│   ├── uploads/                           # File upload directory (auto-created)
│   ├── server.js                          # Express app entry point
│   ├── socketServer.js                    # Socket.IO server initialization
│   └── package.json                       # Backend dependencies and scripts
│
├── helpji-fixed/                          # React 
