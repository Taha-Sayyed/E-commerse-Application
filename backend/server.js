import 'dotenv/config'
import app from './app.js'
import { connectDB } from "./lib/db.js"
import { ENV } from './lib/env.js'
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1"]);

const PORT = ENV.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});