import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV:process.env.NODE_ENV,
  UPSTASH_REDIS_URL:process.env.UPSTASH_REDIS_URL
};