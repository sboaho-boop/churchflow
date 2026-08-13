import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const attendanceSchema = z.object({
  memberId: z.string().optional().nullable(),
  serviceTypeId: z.string().optional().nullable(),
  type: z.enum([
    "SUNDAY",
    "MIDWEEK",
    "PRAYER_MEETING",
    "BIBLE_STUDY",
    "YOUTH_MEETING",
    "CHOIR_PRACTICE",
    "DEPARTMENT_MEETING",
    "OTHER",
  ]).optional(),
  date: z.string().optional(),
  method: z.enum(["QR_CODE", "NFC", "BARCODE", "MANUAL", "MOBILE_APP", "FACE_RECOGNITION"]).optional(),
});

export async function GET(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "attendance.view");

    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "";

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [recent, todayCount, byType] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          churchId: ctx.churchId,
          ...(type ? { type: type as never } : {}),
        },
        orderBy: { date: "desc" },
        take: 50,
        include: { member: true, serviceType: true },
      }),
      prisma.attendance.count({
        where: { churchId: ctx.churchId, date: { gte: start } },
      }),
      prisma.attendance.groupBy({
        by: ["type"],
        where: { churchId: ctx.churchId },
        _count: { _all: true },
      }),
    ]);

    return ok({ attendance: recent, todayCount, byType });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "attendance.manage");

    const body = await parseJson(request);
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid attendance details." },
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
    if (d.serviceTypeId) {
      const st = await prisma.serviceType.findFirst({
        where: { id: d.serviceTypeId, ...tenantScope(ctx.churchId) },
      });
      if (!st) return Response.json({ error: "Service type not found." }, { status: 404 });
    }

    const record = await prisma.attendance.create({
      data: {
        churchId: ctx.churchId,
        memberId: d.memberId || null,
        serviceTypeId: d.serviceTypeId || null,
        type: d.type ?? "SUNDAY",
        date: d.date ? new Date(d.date) : new Date(),
        method: d.method ?? "MANUAL",
        recordedById: ctx.session.sub,
      },
    });

    await logAudit(ctx, "CREATE", "Attendance", record.id, {
      type: record.type,
      memberId: d.memberId ?? null,
    });

    return ok({ record }, 201);
  } catch (error) {
    return fail(error);
  }
}
