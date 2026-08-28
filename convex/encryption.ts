export type EncryptedData = {
  ciphertext: string;
  iv: string;
  tag: string;
};

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to string
function uint8ArrayToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Derive CryptoKey from key secret
async function getCryptoKey(): Promise<CryptoKey> {
  const keySecret = process.env.DB_ENCRYPTION_KEY || "wekraft_default_sec_key_32bytes!";
  const rawKey = stringToUint8Array(keySecret.padEnd(32, "0").slice(0, 32));
  return await crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext string using AES-256-GCM via Web Crypto API
 */
export async function encryptField(plaintext: string): Promise<EncryptedData> {
  if (!plaintext) {
    return { ciphertext: "", iv: "", tag: "" };
  }

  const key = await getCryptoKey();
  const ivBytes = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBytes as BufferSource },
    key,
    stringToUint8Array(plaintext) as BufferSource
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  // Web Crypto AES-GCM appends 16-byte auth tag at the end of ciphertext buffer
  const tagLength = 16;
  const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - tagLength);
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - tagLength);

  return {
    ciphertext: bytesToHex(ciphertextBytes),
    iv: bytesToHex(ivBytes),
    tag: bytesToHex(tagBytes),
  };
}

/**
 * Decrypts an encrypted field object, with fallback for legacy string data
 */
export async function decryptField(
  data: string | EncryptedData | undefined | null
): Promise<string | undefined> {
  if (!data) return undefined;

  // Legacy fallback: plain string in database
  if (typeof data === "string") {
    return data;
  }

  // Encrypted object structure check
  if (
    typeof data === "object" &&
    typeof data.ciphertext === "string" &&
    typeof data.iv === "string" &&
    typeof data.tag === "string"
  ) {
    if (!data.ciphertext && !data.iv && !data.tag) {
      return "";
    }
    try {
      const key = await getCryptoKey();
      const ivBytes = hexToBytes(data.iv);
      const ciphertextBytes = hexToBytes(data.ciphertext);
      const tagBytes = hexToBytes(data.tag);

      // Reconstruct buffer with ciphertext + auth tag as expected by Web Crypto API
      const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
      combined.set(ciphertextBytes, 0);
      combined.set(tagBytes, ciphertextBytes.length);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes as BufferSource },
        key,
        combined as BufferSource
      );

      return uint8ArrayToString(new Uint8Array(decryptedBuffer));
    } catch (err) {
      console.error("Failed to decrypt field:", err);
      return "[Encrypted Content - Decryption Failed]";
    }
  }

  return undefined;
}

/**
 * Generates an SHA-256 blind index hash (used for exact-match searches like email)
 */
export async function generateBlindIndex(value: string): Promise<string> {
  if (!value) return "";
  const salt = process.env.BLIND_INDEX_SALT || "wekraft_blind_index_salt_key";
  const data = stringToUint8Array(salt + ":" + value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return bytesToHex(new Uint8Array(hashBuffer));
}
