import { compare } from "bcryptjs";
import { z } from "zod";
import { createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please provide a valid email and password." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.active) {
    return Response.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return Response.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    id: user.id,
    churchId: user.churchId,
    role: user.role,
    name: user.name,
    email: user.email,
    memberId: user.memberId,
  });
  await setSessionCookie(token);

  return Response.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      churchId: user.churchId,
    },
    redirect: user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard",
  });
}
