import "dotenv/config";
export const env = {
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ngo_portal",
  JWT_SECRET: process.env.JWT_SECRET || "development-secret-change-this-before-production",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};