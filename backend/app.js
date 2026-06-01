import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors";
import path from "path"
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js'
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import { csrfErrorHandler } from "./middleware/csrf.middleware.js"
import { ENV } from './lib/env.js'

const app = express();

// Reliable __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(ENV.COOKIE_SECRET));

// CORS only needed in development (same-origin in production)
if (ENV.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ENV.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }));
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(csrfErrorHandler);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Serve frontend in production
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  
  // React Router catch-all (must be LAST)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

export default app;