import crypto from "crypto";

const SIGNING_SECRET = process.env.AWS_SECRET_KEY_S3 || "fallback-secret-wekraft-key-2026";

/**
 * Generates a SHA-256 HMAC signature for a given S3 key/URL and expiration time.
 */
export function generateSignature(key: string, expires: number): string {
  const data = `${key}:${expires}`;
  return crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
}

/**
 * Verifies a SHA-256 HMAC signature against a given S3 key/URL and expiration time.
 * Returns true if valid and not expired, false otherwise.
 */
export function verifySignature(key: string, expires: number, signature: string): boolean {
  if (Date.now() > expires) {
    return false;
  }
  const expected = generateSignature(key, expires);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}
