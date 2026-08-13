import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const prayerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  request: z.string().min(1, "Prayer request is required."),
  memberId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "prayer.view");

    const requests = await prisma.prayerRequest.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { member: true, answeredBy: true },
    });

    return ok({ requests });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "prayer.manage");

    const body = await parseJson(request);
    const parsed = prayerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid prayer request." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (d.memberId) {
      const member = await prisma.member.findFirst({
        where: { id: d.memberId, ...tenantScope(ctx.churchId) },
      });
      if (!member) return Response.json({ error: "Member not found." }, { status: 404 });
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        request: d.request,
        memberId: d.memberId || null,
      },
    });

    await logAudit(ctx, "CREATE", "PrayerRequest", prayer.id);

    return ok({ prayer }, 201);
  } catch (error) {
    return fail(error);
  }
}
