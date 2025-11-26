// Script de teste para verificar a encriptação de wallets

import crypto from "crypto";

// Simula a função encrypt
function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

// Simula a função decrypt
function decrypt(text: string, key: Buffer): string {
  const [ivHex, content] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return decipher.update(content, "hex", "utf8") + decipher.final("utf8");
}

// Teste
console.log("🔐 Testando encriptação de wallet...\n");

// Gera uma chave de teste (32 bytes)
const testKey = crypto.randomBytes(32);
console.log("Chave (base64):", testKey.toString("base64"));
console.log("");

// Simula uma chave privada de wallet
const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
console.log("Private Key Original:", privateKey);

// Encripta
const encrypted = encrypt(privateKey, testKey);
console.log("Encrypted:", encrypted);

// Decripta
const decrypted = decrypt(encrypted, testKey);
console.log("Decrypted:", decrypted);

// Valida
if (privateKey === decrypted) {
  console.log("\n✅ Encriptação funcionando corretamente!");
} else {
  console.log("\n❌ Erro na encriptação/decriptação");
}
