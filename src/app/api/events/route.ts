import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required."),
  type: z.enum([
    "CONFERENCE",
    "WEDDING",
    "FUNERAL",
    "RETREAT",
    "CRUSADE",
    "CONVENTION",
    "CAMP",
    "BAPTISM",
    "COMMUNION",
    "SEMINAR",
    "OTHER",
  ]).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  fee: z.coerce.number().optional().nullable(),
  registrationEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "events.view");

    const [upcoming, past] = await Promise.all([
      prisma.event.findMany({
        where: { churchId: ctx.churchId, startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        include: { _count: { select: { registrations: true } } },
      }),
      prisma.event.findMany({
        where: { churchId: ctx.churchId, startDate: { lt: new Date() } },
        orderBy: { startDate: "desc" },
        take: 20,
        include: { _count: { select: { registrations: true } } },
      }),
    ]);

    return ok({ upcoming, past });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "events.manage");

    const body = await parseJson(request);
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid event details." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const event = await prisma.event.create({
      data: {
        churchId: ctx.churchId,
        name: d.name,
        type: d.type ?? "CONFERENCE",
        description: d.description || null,
        startDate: new Date(d.startDate),
        endDate: d.endDate ? new Date(d.endDate) : null,
        location: d.location || null,
        fee: d.fee ?? null,
        registrationEnabled: d.registrationEnabled ?? true,
      },
    });

    await logAudit(ctx, "CREATE", "Event", event.id, { name: event.name });

    return ok({ event }, 201);
  } catch (error) {
    return fail(error);
  }
}
