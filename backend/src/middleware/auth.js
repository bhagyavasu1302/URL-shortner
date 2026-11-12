import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export function requireAuth(req, _res, next) {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "A valid access token is required"));
  }

  try {
    const payload = jwt.verify(authorization.slice(7), env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next(new ApiError(401, "INVALID_TOKEN", "The access token is invalid or expired"));
  }
}
