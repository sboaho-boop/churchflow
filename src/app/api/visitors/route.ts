import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const visitorSchema = z.object({
  name: z.string().min(1, "Visitor name is required."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  invitedBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "visitors.view");

    const visitors = await prisma.visitor.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { visitedDate: "desc" },
      take: 100,
      include: { assignedTo: true },
    });

    return ok({ visitors });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "visitors.manage");

    const body = await parseJson(request);
    const parsed = visitorSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid visitor details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const visitor = await prisma.visitor.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        phone: d.phone || null,
        address: d.address || null,
        invitedBy: d.invitedBy || null,
        notes: d.notes || null,
      },
    });

    await logAudit(ctx, "CREATE", "Visitor", visitor.id, { name: visitor.name });

    return ok({ visitor }, 201);
  } catch (error) {
    return fail(error);
  }
}
