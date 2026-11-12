import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { redirect } from "./controllers/urlController.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export const app = express();

if (env.TRUST_PROXY) app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL.split(",").map((origin) => origin.trim()),
  }),
);
app.use(compression());
app.use(express.json({ limit: "10kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/urls", createLimiter, urlRoutes);
app.get("/:shortCode", redirectLimiter, asyncHandler(redirect));
app.use(notFoundHandler);
app.use(errorHandler);
