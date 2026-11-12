import { isIP } from "node:net";
import { env } from "../config/env.js";

const RESERVED_CODES = new Set([
  "api",
  "login",
  "register",
  "dashboard",
  "analytics",
  "health",
  "favicon.ico",
  "robots.txt",
]);

export function validateAlias(alias) {
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(alias)) {
    return "Alias must be 3–32 letters, numbers, hyphens, or underscores";
  }
  if (RESERVED_CODES.has(alias.toLowerCase())) {
    return "That alias is reserved";
  }
  return null;
}

function isPrivateIpv4(hostname) {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => part < 0 || part > 255)) return false;
  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 169 && octets[1] === 254) ||
    octets[0] === 0
  );
}

function isLocalOrPrivateHost(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return true;
  }

  const ipVersion = isIP(normalized);
  if (ipVersion === 4) return isPrivateIpv4(normalized);
  if (ipVersion === 6) {
    return (
      normalized === "::1" ||
      normalized.startsWith("::ffff:") ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }
  return false;
}

export function validateDestination(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return { error: "URL must be a string no longer than 2048 characters" };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { error: "Enter a valid absolute URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { error: "Only HTTP and HTTPS URLs are allowed" };
  }
  if (parsed.username || parsed.password) {
    return { error: "URLs containing embedded credentials are not allowed" };
  }
  if (isLocalOrPrivateHost(parsed.hostname)) {
    return { error: "Local and private network destinations are not allowed" };
  }

  const shortHost = new URL(env.PUBLIC_SHORT_URL_BASE).host.toLowerCase();
  if (parsed.host.toLowerCase() === shortHost) {
    return { error: "A short link cannot point back to this shortener" };
  }

  return { value: parsed.toString() };
}
