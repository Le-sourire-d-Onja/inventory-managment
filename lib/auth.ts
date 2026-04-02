import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";

export function getJwtSecretKey(): Uint8Array | null {
  const raw = process.env.AUTH_JWT_SECRET?.trim();
  if (!raw) {
    return null;
  }
  if (raw.length < 32) {
    return null;
  }
  return new TextEncoder().encode(raw);
}

export async function signSessionToken(): Promise<string> {
  const key = getJwtSecretKey();
  if (!key) {
    throw new Error(
      "AUTH_JWT_SECRET must be set and be at least 32 characters long",
    );
  }
  return new SignJWT({ sub: "app" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<void> {
  const key = getJwtSecretKey();
  if (!key) {
    throw new Error("AUTH_JWT_SECRET is not configured");
  }
  await jwtVerify(token, key);
}
