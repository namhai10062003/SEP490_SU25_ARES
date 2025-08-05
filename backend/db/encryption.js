// utils/encryption.js
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = Buffer.from(process.env.CCCD_SECRET_KEY, "hex"); // 32 bytes
const IV = Buffer.from(process.env.CCCD_IV, "hex"); // 16 bytes

export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, IV);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
