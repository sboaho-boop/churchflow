import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const financeSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK", "CARD"]).optional(),
  date: z.string().optional(),
  reference: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "finance.view");

    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "";

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [transactions, categories, monthIncome, monthExpense, allIncome, allExpense] =
      await Promise.all([
        prisma.financeTransaction.findMany({
          where: {
            churchId: ctx.churchId,
            ...(type ? { type: type as never } : {}),
          },
          orderBy: { date: "desc" },
          take: 100,
          include: { category: true, member: true },
        }),
        prisma.financeCategory.findMany({
          where: tenantScope(ctx.churchId),
          orderBy: { name: "asc" },
        }),
        prisma.financeTransaction.aggregate({
          where: {
            churchId: ctx.churchId,
            type: "INCOME",
            date: { gte: monthStart, lt: nextMonth },
          },
          _sum: { amount: true },
        }),
        prisma.financeTransaction.aggregate({
          where: {
            churchId: ctx.churchId,
            type: "EXPENSE",
            date: { gte: monthStart, lt: nextMonth },
          },
          _sum: { amount: true },
        }),
        prisma.financeTransaction.aggregate({
          where: { churchId: ctx.churchId, type: "INCOME" },
          _sum: { amount: true },
        }),
        prisma.financeTransaction.aggregate({
          where: { churchId: ctx.churchId, type: "EXPENSE" },
          _sum: { amount: true },
        }),
      ]);

    return ok({
      transactions,
      categories,
      totals: {
        monthIncome: monthIncome._sum.amount,
        monthExpense: monthExpense._sum.amount,
        allIncome: allIncome._sum.amount,
        allExpense: allExpense._sum.amount,
      },
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "finance.manage");

    const body = await parseJson(request);
    const parsed = financeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid transaction details." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const category = await prisma.financeCategory.findFirst({
      where: { id: d.categoryId, ...tenantScope(ctx.churchId) },
    });
    if (!category) return Response.json({ error: "Category not found." }, { status: 404 });

    const type = d.type ?? category.type;

    if (d.memberId) {
      const member = await prisma.member.findFirst({
        where: { id: d.memberId, ...tenantScope(ctx.churchId) },
      });
      if (!member) return Response.json({ error: "Member not found." }, { status: 404 });
    }

    const tx = await prisma.financeTransaction.create({
      data: {
        churchId: ctx.churchId,
        categoryId: d.categoryId,
        memberId: d.memberId || null,
        amount: d.amount,
        type,
        method: d.method ?? "CASH",
        date: d.date ? new Date(d.date) : new Date(),
        reference: d.reference || null,
        notes: d.notes || null,
        recordedById: ctx.session.sub,
      },
    });

    await logAudit(ctx, "CREATE", "FinanceTransaction", tx.id, {
      type,
      amount: d.amount,
      category: category.name,
    });

    return ok({ transaction: tx }, 201);
  } catch (error) {
    return fail(error);
  }
}
