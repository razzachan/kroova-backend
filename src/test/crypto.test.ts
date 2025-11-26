import { test, expect, describe } from "vitest";
import { encrypt, decrypt } from "../lib/crypto.js";

describe("🔐 Crypto Module", () => {
  test("should encrypt text", () => {
    const plainText = "my-secret-wallet-key";
    const encrypted = encrypt(plainText);

    expect(encrypted).toBeDefined();
    expect(encrypted).toContain(":");
    expect(encrypted).not.toBe(plainText);
  });

  test("should decrypt text correctly", () => {
    const plainText = "my-secret-wallet-key";
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(plainText);
  });

  test("encrypted text should be different each time (random IV)", () => {
    const plainText = "same-text";
    const encrypted1 = encrypt(plainText);
    const encrypted2 = encrypt(plainText);

    expect(encrypted1).not.toBe(encrypted2);
  });

  test("should handle wallet private key format", () => {
    const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const encrypted = encrypt(privateKey);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(privateKey);
  });
});
