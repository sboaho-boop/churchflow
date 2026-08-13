import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  otherNames: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dob: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional(),
  bloodGroup: z.string().optional().nullable(),
  membershipClass: z.string().optional(),
  dateJoined: z.string().optional().nullable(),
  previousChurch: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "members.manage");

    const { id } = await params;

    const existing = await prisma.member.findFirst({
      where: { id, ...tenantScope(ctx.churchId) },
    });
    if (!existing) return Response.json({ error: "Member not found." }, { status: 404 });

    const body = await parseJson(request);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid member details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        otherNames: d.otherNames ?? undefined,
        gender: d.gender,
        dob: d.dob ? new Date(d.dob) : d.dob === null ? null : undefined,
        phone: d.phone ?? undefined,
        email: d.email ?? undefined,
        address: d.address ?? undefined,
        occupation: d.occupation ?? undefined,
        maritalStatus: d.maritalStatus,
        bloodGroup: d.bloodGroup as never,
        membershipClass: d.membershipClass as never,
        dateJoined: d.dateJoined
          ? new Date(d.dateJoined)
          : d.dateJoined === null
            ? null
            : undefined,
        previousChurch: d.previousChurch ?? undefined,
        status: d.status as never,
        notes: d.notes ?? undefined,
      },
    });

    await logAudit(ctx, "UPDATE", "Member", id, { memberId: existing.memberId });

    return ok({ member });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "members.manage");

    const { id } = await params;

    const existing = await prisma.member.findFirst({
      where: { id, ...tenantScope(ctx.churchId) },
    });
    if (!existing) return Response.json({ error: "Member not found." }, { status: 404 });

    await prisma.member.delete({ where: { id } });
    await logAudit(ctx, "DELETE", "Member", id, { memberId: existing.memberId });

    return ok({});
  } catch (error) {
    return fail(error);
  }
}
