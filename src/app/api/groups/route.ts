import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required."),
  departmentId: z.string().optional().nullable(),
  leaderId: z.string().optional().nullable(),
  meetingLocation: z.string().optional().nullable(),
  meetingDay: z.string().optional().nullable(),
  meetingTime: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "groups.view");

    const groups = await prisma.smallGroup.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { name: "asc" },
      include: {
        department: true,
        leader: true,
        _count: { select: { members: true } },
      },
    });

    return ok({ groups });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "groups.manage");

    const body = await parseJson(request);
    const parsed = groupSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid group details." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (d.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: d.departmentId, ...tenantScope(ctx.churchId) },
      });
      if (!dept) return Response.json({ error: "Department not found." }, { status: 404 });
    }
    if (d.leaderId) {
      const user = await prisma.user.findFirst({
        where: { id: d.leaderId, churchId: ctx.churchId },
      });
      if (!user) return Response.json({ error: "Leader not found." }, { status: 404 });
    }

    const group = await prisma.smallGroup.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        departmentId: d.departmentId || null,
        leaderId: d.leaderId || null,
        meetingLocation: d.meetingLocation || null,
        meetingDay: d.meetingDay || null,
        meetingTime: d.meetingTime || null,
      },
    });

    await logAudit(ctx, "CREATE", "SmallGroup", group.id, { name: group.name });

    return ok({ group }, 201);
  } catch (error) {
    return fail(error);
  }
}
