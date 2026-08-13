import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const settingsSchema = z.object({
  name: z.string().min(2).optional(),
  motto: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  website: z.string().optional().nullable(),
  currency: z.string().min(3).max(3).optional(),
});

export async function PATCH(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "settings.manage");

    const body = await parseJson(request);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid settings." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const church = await prisma.church.update({
      where: { id: ctx.churchId },
      data: {
        name: d.name,
        motto: d.motto ?? undefined,
        description: d.description ?? undefined,
        address: d.address ?? undefined,
        phone: d.phone ?? undefined,
        email: d.email ?? undefined,
        website: d.website ?? undefined,
        currency: d.currency,
      },
    });

    await logAudit(ctx, "UPDATE", "Church", church.id, { name: church.name });

    return ok({ church });
  } catch (error) {
    return fail(error);
  }
}
