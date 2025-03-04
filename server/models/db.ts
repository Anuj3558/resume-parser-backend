import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const MONGO_URI = process.env.MONGO_URI || "your-fallback-uri-here";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 MongoDB Connected to Atlas");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;
