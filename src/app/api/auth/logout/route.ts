import { destroySessionCookie } from "@/lib/session";

export async function POST() {
  await destroySessionCookie();
  return Response.json({ ok: true });
}
