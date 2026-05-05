import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors";
import path from "path"

import authRoutes from './routes/auth.route.js'
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import { csrfErrorHandler } from "./middleware/csrf.middleware.js"
import { ENV } from './lib/env.js'

const app = express();

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(ENV.COOKIE_SECRET));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Routes
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

export default app;