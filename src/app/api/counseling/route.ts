import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const appointmentSchema = z.object({
  memberId: z.string().optional().nullable(),
  pastorId: z.string().min(1, "A pastor must be selected."),
  date: z.string().min(1, "Date is required."),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "counseling.manage");

    const appointments = await prisma.counselingAppointment.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { date: "desc" },
      take: 100,
      include: { member: true, pastor: true },
    });

    return ok({ appointments });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "counseling.manage");

    const body = await parseJson(request);
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid appointment details." },
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

    const pastor = await prisma.user.findFirst({
      where: { id: d.pastorId, churchId: ctx.churchId },
    });
    if (!pastor) return Response.json({ error: "Pastor not found." }, { status: 404 });

    const appointment = await prisma.counselingAppointment.create({
      data: {
        churchId: ctx.churchId,
        memberId: d.memberId || null,
        pastorId: d.pastorId,
        date: new Date(d.date),
        notes: d.notes || null,
      },
    });

    await logAudit(ctx, "CREATE", "CounselingAppointment", appointment.id);

    return ok({ appointment }, 201);
  } catch (error) {
    return fail(error);
  }
}
