import 'dotenv/config'
import express from 'express'
import { connectDB } from "../backend/lib/db.js"
import { ENV } from './lib/env.js'
import cookieParser from 'cookie-parser'
import path from "path"
import dns from "node:dns/promises";
import authRoutes from './routes/auth.route.js'
import cors from "cors";
import productRoutes from "./routes/product.route.js"
dns.setServers(["1.1.1.1"]);

const app = express();
const PORT = ENV.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json()); // allows you to parse the body of the request
/**
 * It parses cookies sent by the browser
 * And adds them to req.cookies
 */
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes)


app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});
app.listen(PORT, () => {
    console.log("Server is running on port 5000 ");
    connectDB();
})