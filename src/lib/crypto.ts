import crypto from "crypto";

// A chave deve ser base64 e ter 32 bytes quando decodificada
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

export function decrypt(text: string) {
  const [ivHex, content] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return decipher.update(content, "hex", "utf8") + decipher.final("utf8");
}
