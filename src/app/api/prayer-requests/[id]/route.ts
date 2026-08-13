import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const prayerPatchSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "ANSWERED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "prayer.manage");

    const { id } = await params;

    const existing = await prisma.prayerRequest.findFirst({
      where: { id, ...tenantScope(ctx.churchId) },
    });
    if (!existing) {
      return Response.json({ error: "Prayer request not found." }, { status: 404 });
    }

    const body = await parseJson(request);
    const parsed = prayerPatchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    const prayer = await prisma.prayerRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        answeredAt: parsed.data.status === "ANSWERED" ? new Date() : null,
        answeredById: parsed.data.status === "ANSWERED" ? ctx.session.sub : null,
      },
    });

    await logAudit(ctx, "UPDATE", "PrayerRequest", id, { status: prayer.status });

    return ok({ prayer });
  } catch (error) {
    return fail(error);
  }
}
