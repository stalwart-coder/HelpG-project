# HelpJi — Production Deployment Architecture & Guide

## Deployment Architecture

```
                      [Cloudflare CDN / SSL]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Frontend (Vercel/S3)]         [API / Socket (Render/EC2)]
       React 19 SPA + Vite            Node.js Cluster + PM2 / Docker
                                                 │
                                 ┌───────────────┴───────────────┐
                                 ▼                               ▼
                      [MongoDB Atlas (Replica Set)]    [Redis (Sessions/Sockets)]
```

---

## 1. Environment Checklist for Production

Ensure the following environment variables are securely set in your hosting platform (Render, AWS, DigitalOcean, Railway):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<dbuser>:<dbpassword>@helpji-cluster.mongodb.net/helpji?retryWrites=true&w=majority

JWT_ACCESS_SECRET=secure-64-byte-hex-string
JWT_REFRESH_SECRET=secure-64-byte-hex-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=https://helpji.app

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=live_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=live_webhook_secret

PLATFORM_COMMISSION_PERCENT=0.10

AI_PROVIDER=openai
AI_API_KEY=sk-live-production-openai-key
AI_MODEL=gpt-4o-mini
```

---

## 2. Dockerizing the Application

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile / Nginx (`frontened/Dockerfile`)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Reverse Proxy Nginx Configuration

```nginx
server {
    listen 80;
    server_name helpji.app www.helpji.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name helpji.app www.helpji.app;

    ssl_certificate /etc/letsencrypt/live/helpji.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/helpji.app/privkey.pem;

    # Frontend SPA
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO Realtime WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 4. Health Checks & Uptime Monitoring
* **Liveness Probe**: `GET /api/health` — Returns HTTP 200 `{ status: "ok", timestamp: "..." }`.
* **Database Readiness**: Check MongoDB connection state in health ping.
* **PM2 Process Manager**:
  ```bash
  pm2 start server.js --name "helpji-backend" -i max
  pm2 monit
  ```
