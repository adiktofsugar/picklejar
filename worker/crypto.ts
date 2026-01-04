// AES-GCM encryption for photo tokens
// Tokens contain source credentials + photo key, encrypted with ENCRYPTION_KEY

export interface PhotoTokenPayload {
  sourceId: number;
  key: string;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3ApiKey: string;
  s3ApiKeySecret: string;
}

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("picklejar-photo-token"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPhotoToken(
  payload: PhotoTokenPayload,
  secret: string,
): Promise<string> {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data,
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Base64url encode for URL safety
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function decryptPhotoToken(
  token: string,
  secret: string,
): Promise<PhotoTokenPayload> {
  // Base64url decode
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padding);
  const combined = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);

  const key = await getKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted,
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}
