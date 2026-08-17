import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const onlineAttendanceSchema = z.object({
  eventId: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "online.view");

    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId");

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [recent, todayCount, totalCount] = await Promise.all([
      prisma.onlineAttendance.findMany({
        where: {
          churchId: ctx.churchId,
          ...(eventId ? { eventId } : {}),
        },
        orderBy: { joinedAt: "desc" },
        take: 50,
        include: { member: true, event: true },
      }),
      prisma.onlineAttendance.count({
        where: { churchId: ctx.churchId, joinedAt: { gte: start } },
      }),
      prisma.onlineAttendance.count({
        where: { churchId: ctx.churchId },
      }),
    ]);

    return ok({ attendance: recent, todayCount, totalCount });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "online.manage");

    const body = await parseJson(request);
    const parsed = onlineAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid online attendance details." },
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
    if (d.eventId) {
      const event = await prisma.event.findFirst({
        where: { id: d.eventId, ...tenantScope(ctx.churchId) },
      });
      if (!event) return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const record = await prisma.onlineAttendance.create({
      data: {
        churchId: ctx.churchId,
        eventId: d.eventId || null,
        memberId: d.memberId || null,
        guestName: d.guestName || null,
        platform: d.platform || null,
        notes: d.notes || null,
      },
    });

    await logAudit(ctx, "CREATE", "OnlineAttendance", record.id, {
      memberId: d.memberId ?? null,
      eventId: d.eventId ?? null,
    });

    return ok({ record }, 201);
  } catch (error) {
    return fail(error);
  }
}
