import 'dotenv/config'
import express from 'express'
import { connectDB } from "../backend/lib/db.js"
import { ENV } from './lib/env.js'
import cookieParser from 'cookie-parser'
import path from "path"
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

const app = express();
const PORT = ENV.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
/**
 * It parses cookies sent by the browser
 * And adds them to req.cookies
 */
app.use(cookieParser());

//Routes




app.listen(PORT, () => {
    console.log("Server is running on port 5000 ");
    connectDB();
})