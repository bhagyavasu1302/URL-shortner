import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(10).max(72);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

export const createUrlSchema = z.object({
  originalUrl: z.string().min(1).max(2048),
  customAlias: z.string().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

export const updateUrlSchema = z
  .object({
    originalUrl: z.string().min(1).max(2048).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

export const aliasQuerySchema = z.object({
  code: z.string().min(1).max(32),
});
