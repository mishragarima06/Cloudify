const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "utf8"); // must be 32 chars

// Encrypt file buffer before uploading to Firebase
const encryptFile = (buffer) => {
  const iv = crypto.randomBytes(16); // random IV for each file
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    encryptedBuffer: encrypted,
    iv: iv.toString("hex"), // save this in MongoDB
  };
};

// Decrypt file buffer when downloading
const decryptFile = (encryptedBuffer, ivHex) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return decrypted;
};

module.exports = { encryptFile, decryptFile };
