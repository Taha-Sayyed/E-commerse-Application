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

app.listen(PORT, () => {
    console.log("Server is running on port 5000 ");
    connectDB();
})