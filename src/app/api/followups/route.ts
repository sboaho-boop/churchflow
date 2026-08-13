import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const followUpSchema = z.object({
  visitorId: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  type: z.enum([
    "FIRST_VISIT",
    "PHONE_CALL",
    "HOME_VISIT",
    "COUNSELING",
    "MEMBERSHIP_CLASS",
    "BAPTISM",
    "DEPARTMENT_INTEGRATION",
    "OTHER",
  ]).optional(),
  date: z.string().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "followups.view");

    const followUps = await prisma.followUp.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { date: "desc" },
      take: 100,
      include: { visitor: true, member: true, assignedTo: true },
    });

    return ok({ followUps });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "followups.manage");

    const body = await parseJson(request);
    const parsed = followUpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid follow-up details." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (!d.visitorId && !d.memberId) {
      return Response.json(
        { error: "A visitor or member is required for a follow-up." },
        { status: 400 }
      );
    }

    const record = await prisma.followUp.create({
      data: {
        churchId: ctx.churchId,
        visitorId: d.visitorId || null,
        memberId: d.memberId || null,
        type: d.type ?? "FIRST_VISIT",
        date: d.date ? new Date(d.date) : new Date(),
        notes: d.notes || null,
        status: d.status ?? "PENDING",
        assignedToId: ctx.session.sub,
      },
    });

    await logAudit(ctx, "CREATE", "FollowUp", record.id);

    return ok({ followUp: record }, 201);
  } catch (error) {
    return fail(error);
  }
}
