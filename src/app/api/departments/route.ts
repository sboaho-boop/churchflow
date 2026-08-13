import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required."),
  description: z.string().optional().nullable(),
  meetingDay: z.string().optional().nullable(),
  meetingTime: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "departments.view");

    const departments = await prisma.department.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { name: "asc" },
      include: {
        leader: true,
        _count: { select: { members: true, staff: true } },
      },
    });

    return ok({ departments });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "departments.manage");

    const body = await parseJson(request);
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid department details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const department = await prisma.department.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        description: d.description || null,
        meetingDay: d.meetingDay || null,
        meetingTime: d.meetingTime || null,
      },
    });

    await logAudit(ctx, "CREATE", "Department", department.id, { name: department.name });

    return ok({ department }, 201);
  } catch (error) {
    return fail(error);
  }
}
