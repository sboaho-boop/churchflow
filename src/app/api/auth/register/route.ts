import { hash } from "bcryptjs";
import { z } from "zod";
import { createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

const registerSchema = z.object({
  churchName: z.string().min(2),
  churchSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid registration details." },
      { status: 400 }
    );
  }

  const { churchName, churchSlug, adminName, adminEmail, adminPassword } =
    parsed.data;

  const slug = churchSlug.toLowerCase();
  const email = adminEmail.toLowerCase();

  const existingSlug = await prisma.church.findUnique({ where: { slug } });
  if (existingSlug) {
    return Response.json(
      { error: "That church address is already taken. Try another slug." },
      { status: 409 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return Response.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(adminPassword, 10);

  const church = await prisma.church.create({
    data: {
      name: churchName,
      slug,
      status: "ACTIVE",
      plan: "FREE",
      users: {
        create: {
          name: adminName,
          email,
          passwordHash,
          role: "CHURCH_ADMIN",
        },
      },
    },
    include: { users: true },
  });

  const admin = church.users[0];

  const token = await createSessionToken({
    id: admin.id,
    churchId: church.id,
    role: admin.role,
    name: admin.name,
    email: admin.email,
    memberId: admin.memberId,
  });
  await setSessionCookie(token);

  return Response.json(
    {
      ok: true,
      redirect: "/dashboard",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        churchId: church.id,
      },
    },
    { status: 201 }
  );
}
