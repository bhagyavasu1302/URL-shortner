import { describe, expect, test } from "@jest/globals";
import { validateAlias, validateDestination } from "../src/utils/validateDestination.js";

describe("validateDestination", () => {
  test("normalizes valid HTTP and HTTPS URLs", () => {
    expect(validateDestination("https://example.com/a b").value).toBe("https://example.com/a%20b");
    expect(validateDestination("http://example.org").value).toBe("http://example.org/");
  });

  test.each([
    ["javascript:alert(1)", "Only HTTP and HTTPS"],
    ["file:///etc/passwd", "Only HTTP and HTTPS"],
    ["http://localhost:3000/admin", "Local and private"],
    ["http://127.0.0.1/test", "Local and private"],
    ["http://user:pass@example.com", "embedded credentials"],
    ["https://links.example/abc1234", "point back"],
  ])("rejects unsafe destination %s", (value, message) => {
    expect(validateDestination(value).error).toContain(message);
  });
});

describe("validateAlias", () => {
  test("accepts a safe alias", () => {
    expect(validateAlias("campus-event_2026")).toBeNull();
  });

  test("rejects invalid and reserved aliases", () => {
    expect(validateAlias("no")).toContain("3–32");
    expect(validateAlias("api")).toContain("reserved");
    expect(validateAlias("has space")).toContain("3–32");
  });
});
