import { z } from "zod";
import { getSession } from "@/lib/session";
import { can } from "@/lib/rbac";
import { ApiError, fail, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TRIAL"]).optional(),
  plan: z.enum(["FREE", "BASIC", "STANDARD", "PREMIUM"]).optional(),
  memberLimit: z.coerce.number().int().min(1).optional(),
});

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Not authenticated.");
  if (!can(session.role, "*")) throw new ApiError(403, "Super admin access required.");
  return session;
}

export async function GET() {
  try {
    await requireSuperAdmin();

    const churches = await prisma.church.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true, users: true } },
      },
    });

    return ok({ churches });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();

    const { id } = await params;

    const existing = await prisma.church.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Church not found." }, { status: 404 });

    const body = await parseJson(request);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid update." }, { status: 400 });
    }

    const church = await prisma.church.update({
      where: { id },
      data: {
        status: parsed.data.status,
        plan: parsed.data.plan,
        memberLimit: parsed.data.memberLimit,
      },
    });

    return ok({ church });
  } catch (error) {
    return fail(error);
  }
}
