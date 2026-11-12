import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", "The requested resource was not found"));
}

export function errorHandler(error, _req, res, _next) {
  let normalized = error;
  if (error instanceof mongoose.Error.ValidationError) {
    normalized = new ApiError(400, "VALIDATION_ERROR", "Stored data failed validation");
  } else if (error instanceof mongoose.Error.CastError) {
    normalized = new ApiError(404, "NOT_FOUND", "The requested resource was not found");
  } else if (error?.code === 11000) {
    normalized = new ApiError(409, "CONFLICT", "A resource with that value already exists");
  }

  const status = normalized.status ?? 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: {
      code: normalized.code ?? "INTERNAL_SERVER_ERROR",
      message:
        status >= 500 && env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : (normalized.message ?? "An unexpected error occurred"),
      ...(normalized.details ? { details: normalized.details } : {}),
    },
  });
}
