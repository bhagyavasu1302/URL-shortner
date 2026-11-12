import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  PUBLIC_SHORT_URL_BASE: z.string().url().default("http://localhost:4000"),
  TRUST_PROXY: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:", result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
