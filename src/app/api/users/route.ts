import { hash } from "bcryptjs";
import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const userSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["CHURCH_ADMIN", "PASTOR", "DEPARTMENT_LEADER", "MEMBER"]),
  phone: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "users.manage");

    const users = await prisma.user.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { createdAt: "desc" },
      include: { member: true },
    });

    return ok({ users });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "users.manage");

    const body = await parseJson(request);
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid user details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const email = d.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "A user with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(d.password, 10);

    const user = await prisma.user.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        email,
        passwordHash,
        role: d.role,
        phone: d.phone || null,
      },
    });

    await logAudit(ctx, "CREATE", "User", user.id, { name: user.name, role: user.role });

    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (error) {
    return fail(error);
  }
}
