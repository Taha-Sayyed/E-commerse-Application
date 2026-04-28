import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV:process.env.NODE_ENV,
  UPSTASH_REDIS_URL:process.env.UPSTASH_REDIS_URL,
  ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET,
  CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET,
};