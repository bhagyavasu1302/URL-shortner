import { describe, expect, test } from "@jest/globals";
import { generateShortCode } from "../src/utils/shortCode.js";

describe("generateShortCode", () => {
  test("returns a seven-character Base62 code by default", () => {
    expect(generateShortCode()).toMatch(/^[0-9A-Za-z]{7}$/);
  });

  test("supports a requested valid length", () => {
    expect(generateShortCode(12)).toMatch(/^[0-9A-Za-z]{12}$/);
  });

  test("rejects invalid lengths", () => {
    expect(() => generateShortCode(0)).toThrow(RangeError);
    expect(() => generateShortCode(33)).toThrow(RangeError);
  });
});
