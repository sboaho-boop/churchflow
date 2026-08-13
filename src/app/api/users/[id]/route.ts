import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["CHURCH_ADMIN", "PASTOR", "DEPARTMENT_LEADER", "MEMBER"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "users.manage");

    const { id } = await params;

    const existing = await prisma.user.findFirst({
      where: { id, churchId: ctx.churchId },
    });
    if (!existing) return Response.json({ error: "User not found." }, { status: 404 });
    if (id === ctx.session.sub && !existing.active) {
      return Response.json({ error: "You cannot deactivate your own account." }, { status: 400 });
    }

    const body = await parseJson(request);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid update." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        active: parsed.data.active,
        role: parsed.data.role,
      },
    });

    await logAudit(ctx, "UPDATE", "User", id, {
      active: user.active,
      role: user.role,
    });

    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}
