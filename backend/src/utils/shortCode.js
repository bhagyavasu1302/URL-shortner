import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateShortCode(length = 7) {
  if (!Number.isInteger(length) || length < 1 || length > 32) {
    throw new RangeError("Short-code length must be an integer between 1 and 32");
  }

  let code = "";
  while (code.length < length) {
    for (const byte of randomBytes(Math.max(length, 16))) {
      // Discard the top 8 byte values so each Base62 character has equal probability.
      if (byte < 248) {
        code += ALPHABET[byte % ALPHABET.length];
        if (code.length === length) break;
      }
    }
  }

  return code;
}
