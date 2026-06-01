# Ecommerce Application

A full-stack ecommerce platform built with Node.js/Express and React. Deployed as a unified service on Railway.

---

## Architecture 

**Authentication**
- Access token: short-lived JWT stored in memory (Redux state)
- Refresh token: long-lived JWT stored in httpOnly cookie
- Axios interceptors auto-refresh expired access tokens via `/api/auth/refresh-token`
- CSRF tokens required on all mutating requests

**Payment Flow**
1. Frontend calls `/api/payments/create-checkout-session`
2. Backend creates a Stripe Checkout Session with metadata (userId, products, coupon)
3. Stripe redirects to `CLIENT_URL/purchase-success?session_id=...`
4. Frontend calls `/api/payments/checkout-success` to verify and create the order

**Image Handling**
Product images are uploaded to Cloudinary. URLs are stored in MongoDB and served directly from Cloudinary.

---
## Security 

- **CSRF:** Uses the double-submit cookie pattern. The CSRF token is fetched on app mount before any mutating request.
- **CORS:** Disabled in production (same-origin only). Enabled in development environments.
- **Validation:** All request bodies are validated with Joi using `stripUnknown: true`.
---
## API Overview
| Method | Endpoint | Auth | CSRF | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/signup` | No | Yes | Register |
| POST | `/api/auth/login` | No | Yes | Login |
| POST | `/api/auth/logout` | No | Yes | Clear cookies |
| POST | `/api/auth/refresh-token` | No | Yes | Rotate access token |
| GET | `/api/auth/profile` | Yes | No | Current user |
| GET | `/api/auth/csrf-token` | No | No | Fetch CSRF token |
| GET | `/api/products` | No | No | List products |
| POST | `/api/payments/create-checkout-session` | Yes | Yes | Stripe checkout |
| POST | `/api/payments/checkout-success` | Yes | Yes | Verify & create order |
| POST | `/api/payments/webhook` | No | No | Stripe events (raw body) |
| GET | `/api/health` | No | No | Healthcheck |
---
## Project Structure
```text
├── backend/
│   ├── app.js              # Express app config
│   ├── server.js           # Entry point
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions
│   ├── middleware/         # Auth, CSRF, validation
│   ├── service/            # Business logic layer
│   ├── models/             # Mongoose schemas
│   ├── lib/                # Config (env, db, stripe, redis, cloudinary)
│   └── validations/        # Joi schemas
├── frontend/
│   ├── src/
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Route-level components
│   │   ├── components/     # Shared UI
│   │   └── lib/axios.js    # API client with interceptors
│   └── dist/               # Production build (generated)
├── package.json            # Root config + build script
└── railway.json            # Railway deployment config
```
## Environment Variables
```env
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://...
MONGO_URI_TEST=mongodb+srv://...      # for test suite

# Redis
UPSTASH_REDIS_URL=rediss://...

# Auth
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
COOKIE_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...    # embedded at build time
STRIPE_WEBHOOK_SECRET=whsec_...       # production only

# CORS / Redirects
CLIENT_URL=http://localhost:5173

#Frontend .env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Local Development
```text
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start backend (with nodemon)
npm run dev

# Start frontend (in a new terminal)
cd frontend && npm run dev
```
