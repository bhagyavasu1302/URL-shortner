import mongoose from "mongoose";
import { app } from "../backend/src/app.js";
import { connectDatabase } from "../backend/src/config/database.js";

let connectionPromise;

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connectDatabase().finally(() => {
      connectionPromise = undefined;
    });
  }

  await connectionPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDatabaseConnection();
    app(req, res);
  } catch (error) {
    console.error("Vercel API could not connect to MongoDB:", error);
    res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The service is temporarily unavailable",
      },
    });
  }
}
