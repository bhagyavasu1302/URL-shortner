import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

function createAccessToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function register(req, res) {
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  try {
    const user = await User.create({ email: req.body.email, passwordHash });
    res.status(201).json({
      data: { user: { id: user.id, email: user.email }, accessToken: createAccessToken(user) },
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "EMAIL_IN_USE", "An account with that email already exists");
    }
    throw error;
  }
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
  const passwordMatches = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  res.json({
    data: { user: { id: user.id, email: user.email }, accessToken: createAccessToken(user) },
  });
}

export async function currentUser(req, res) {
  const user = await User.findById(req.userId).select("email");
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "The account for this token no longer exists");
  res.json({ data: { user: { id: user.id, email: user.email } } });
}
