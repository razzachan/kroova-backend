import { test, expect, describe } from "vitest";

describe("🔥 Kroova Smoke Tests", () => {
  test("environment is working", () => {
    expect(true).toBe(true);
  });

  test("node environment is set", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test("basic math works", () => {
    expect(2 + 2).toBe(4);
  });
});
