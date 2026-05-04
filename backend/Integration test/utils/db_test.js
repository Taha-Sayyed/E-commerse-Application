import mongoose from "mongoose";
import { ENV } from "../../lib/env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI_TEST);
    console.log(`✅ Connected to MONGODB: ${conn.connection.host}`);
  } catch (error) {
    console.error("💥 MONGODB connection error",error.message);
    throw error; // let Jest handle it
  }
};