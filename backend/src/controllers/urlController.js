import { Click } from "../models/Click.js";
import { Url } from "../models/Url.js";
import { createUrl, buildAnalytics } from "../services/urlService.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { validateAlias, validateDestination } from "../utils/validateDestination.js";

function publicUrl(shortCode) {
  return new URL(`/${encodeURIComponent(shortCode)}`, env.PUBLIC_SHORT_URL_BASE).toString();
}

export async function create(req, res) {
  const destination = validateDestination(req.body.originalUrl);
  if (destination.error) throw new ApiError(400, "INVALID_DESTINATION", destination.error);

  if (req.body.customAlias) {
    const aliasError = validateAlias(req.body.customAlias);
    if (aliasError) throw new ApiError(400, "INVALID_ALIAS", aliasError);
  }

  const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
  if (expiresAt && expiresAt <= new Date()) {
    throw new ApiError(400, "INVALID_EXPIRY", "Expiry must be a future date");
  }

  const url = await createUrl({
    owner: req.userId,
    originalUrl: destination.value,
    customAlias: req.body.customAlias,
    expiresAt,
  });
  if (!url) throw new ApiError(409, "ALIAS_TAKEN", "That custom alias is already in use");

  res.status(201).json({ data: { url: { ...url.toJSON(), shortUrl: publicUrl(url.shortCode) } } });
}

export async function list(req, res) {
  const urls = await Url.find({ owner: req.userId }).sort({ createdAt: -1 }).lean();
  const counts = await Click.aggregate([
    { $match: { url: { $in: urls.map(({ _id }) => _id) } } },
    { $group: { _id: "$url", clicks: { $sum: 1 } } },
  ]);
  const clickCounts = new Map(counts.map(({ _id, clicks }) => [_id.toString(), clicks]));
  res.json({
    data: {
      urls: urls.map((url) => ({
        ...url,
        id: url._id.toString(),
        shortUrl: publicUrl(url.shortCode),
        totalClicks: clickCounts.get(url._id.toString()) ?? 0,
      })),
    },
  });
}

export async function checkAlias(req, res) {
  const aliasError = validateAlias(req.validatedQuery.code);
  if (aliasError) throw new ApiError(400, "INVALID_ALIAS", aliasError);
  const available = !(await Url.exists({ shortCode: req.validatedQuery.code }));
  res.json({ data: { available } });
}

async function findOwnedUrl(req) {
  const url = await Url.findOne({ _id: req.params.id, owner: req.userId });
  if (!url) throw new ApiError(404, "URL_NOT_FOUND", "Link not found");
  return url;
}

export async function analytics(req, res) {
  const url = await findOwnedUrl(req);
  res.json({
    data: {
      url: { id: url.id, shortCode: url.shortCode, shortUrl: publicUrl(url.shortCode) },
      analytics: await buildAnalytics(url.id, req.validatedQuery.days),
    },
  });
}

export async function update(req, res) {
  const url = await findOwnedUrl(req);
  if (req.body.originalUrl !== undefined) {
    const destination = validateDestination(req.body.originalUrl);
    if (destination.error) throw new ApiError(400, "INVALID_DESTINATION", destination.error);
    url.originalUrl = destination.value;
  }
  if (req.body.isActive !== undefined) url.isActive = req.body.isActive;
  if (req.body.expiresAt !== undefined) {
    const expiresAt = req.body.expiresAt === null ? null : new Date(req.body.expiresAt);
    if (expiresAt && expiresAt <= new Date()) {
      throw new ApiError(400, "INVALID_EXPIRY", "Expiry must be a future date");
    }
    url.expiresAt = expiresAt;
  }
  await url.save();
  res.json({ data: { url: { ...url.toJSON(), shortUrl: publicUrl(url.shortCode) } } });
}

export async function remove(req, res) {
  const url = await findOwnedUrl(req);
  await Promise.all([url.deleteOne(), Click.deleteMany({ url: url._id })]);
  res.status(204).end();
}

export async function redirect(req, res) {
  const url = await Url.findOne({ shortCode: req.params.shortCode }).lean();
  if (!url || !url.isActive)
    throw new ApiError(404, "LINK_UNAVAILABLE", "This short link is unavailable");
  if (url.expiresAt && url.expiresAt <= new Date()) {
    throw new ApiError(410, "LINK_EXPIRED", "This short link has expired");
  }

  const { UAParser } = await import("ua-parser-js");
  const parsedAgent = new UAParser(req.get("user-agent") ?? "").getResult();
  const browser = parsedAgent.browser.name ?? "Unknown";
  const device = parsedAgent.device.type
    ? `${parsedAgent.device.vendor ?? ""} ${parsedAgent.device.model ?? parsedAgent.device.type}`.trim()
    : "Desktop";
  const referrer = req.get("referer")?.slice(0, 2048) ?? "Direct";

  await Click.create({ url: url._id, browser, device, referrer });
  res.redirect(302, url.originalUrl);
}
