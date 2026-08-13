import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const statusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "followups.manage");

    const { id } = await params;

    const existing = await prisma.followUp.findFirst({
      where: { id, ...tenantScope(ctx.churchId) },
    });
    if (!existing) {
      return Response.json({ error: "Follow-up not found." }, { status: 404 });
    }

    const body = await parseJson(request);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    const followUp = await prisma.followUp.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await logAudit(ctx, "UPDATE", "FollowUp", id, { status: followUp.status });

    return ok({ followUp });
  } catch (error) {
    return fail(error);
  }
}
