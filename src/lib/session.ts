import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  sessionCookieOptions,
  verifySessionToken,
  type SessionUser,
} from "./auth";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieOptions.name)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookieOptions.maxAge,
  });
}

export async function destroySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieOptions.name);
}
