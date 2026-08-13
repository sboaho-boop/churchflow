import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma/enums";

const SESSION_COOKIE = "cf_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me-in-production";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  sub: string;
  churchId: string | null;
  role: Role;
  name: string;
  email: string;
  memberId: string | null;
}

interface TokenPayload {
  churchId: string | null;
  role: Role;
  name: string;
  email: string;
  memberId: string | null;
}

export async function createSessionToken(user: {
  id: string;
  churchId: string | null;
  role: Role;
  name: string;
  email: string;
  memberId: string | null;
}): Promise<string> {
  const payload: TokenPayload = {
    churchId: user.churchId,
    role: user.role,
    name: user.name,
    email: user.email,
    memberId: user.memberId,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      churchId: (payload.churchId as string | null) ?? null,
      role: payload.role as Role,
      name: payload.name as string,
      email: payload.email as string,
      memberId: (payload.memberId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE_SECONDS,
};
