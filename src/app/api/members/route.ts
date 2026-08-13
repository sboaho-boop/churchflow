import { randomUUID } from "crypto";
import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  otherNames: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]),
  dob: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
  bloodGroup: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
    .optional()
    .nullable(),
  membershipClass: z
    .enum(["NONE", "NEW_CONVERT", "CANDIDATE", "FULL_MEMBER"])
    .optional(),
  dateJoined: z.string().optional().nullable(),
  previousChurch: z.string().optional().nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "TRANSFERRED", "DECEASED", "ATTENDEE"])
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "members.view");

    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const status = url.searchParams.get("status") ?? "";

    const members = await prisma.member.findMany({
      where: {
        churchId: ctx.churchId,
        ...(status
          ? { status: status as never }
          : {}),
        ...(q
          ? {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { memberId: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { _count: { select: { attendances: true } } },
    });

    return ok({ members });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "members.manage");

    const body = await parseJson(request);
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid member details." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const memberId = `M-${randomUUID().slice(0, 6).toUpperCase()}`;

    const member = await prisma.member.create({
      data: {
        churchId: ctx.churchId,
        memberId,
        firstName: data.firstName,
        lastName: data.lastName,
        otherNames: data.otherNames || null,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        occupation: data.occupation || null,
        maritalStatus: data.maritalStatus ?? "SINGLE",
        bloodGroup: data.bloodGroup || null,
        membershipClass: data.membershipClass ?? "NONE",
        dateJoined: data.dateJoined ? new Date(data.dateJoined) : null,
        previousChurch: data.previousChurch || null,
        status: data.status ?? "ACTIVE",
        notes: data.notes || null,
      },
    });

    return ok({ member }, 201);
  } catch (error) {
    return fail(error);
  }
}
