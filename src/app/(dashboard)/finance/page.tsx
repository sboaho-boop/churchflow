import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  StatCard,
  Table,
} from "@/components/ui";
import { formatCurrency, formatDate, toNumber, titleCase } from "@/lib/utils";
import { FinanceForm } from "@/components/forms/finance-form";

export const metadata = { title: "Finance" };

export default async function FinancePage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "finance.view")) redirect("/dashboard");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [transactions, categories, monthIncome, monthExpense, allIncome, allExpense] =
    await Promise.all([
      prisma.financeTransaction.findMany({
        where: { churchId: ctx.churchId },
        orderBy: { date: "desc" },
        take: 50,
        include: { category: true, member: true },
      }),
      prisma.financeCategory.findMany({
        where: { churchId: ctx.churchId },
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

  const incomeM = toNumber(monthIncome._sum.amount);
  const expenseM = toNumber(monthExpense._sum.amount);
  const incomeA = toNumber(allIncome._sum.amount);
  const expenseA = toNumber(allExpense._sum.amount);
  const currency = ctx.church.currency ?? "GHS";

  const canManage = can(session.role, "finance.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Track income and expenses for your church." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Income (month)" value={formatCurrency(incomeM, currency)} icon="finance" />
        <StatCard label="Expenses (month)" value={formatCurrency(expenseM, currency)} icon="finance" />
        <StatCard label="Net (month)" value={formatCurrency(incomeM - expenseM, currency)} icon="reports" />
        <StatCard label="Balance (all time)" value={formatCurrency(incomeA - expenseA, currency)} icon="shield" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Record transaction" />
            <div className="p-5">
              <FinanceForm categories={categories} currency={currency} />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="Recent transactions" />
          {transactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Record your first income or expense." />
          ) : (
            <Table head={["Date", "Category", "Member", "Type", "Amount"]}>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-5 py-3 text-slate-900">{t.category.name}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {t.member ? `${t.member.firstName} ${t.member.lastName}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={t.type === "INCOME" ? "emerald" : "red"}>
                      {titleCase(t.type)}
                    </Badge>
                  </td>
                  <td
                    className={`px-5 py-3 font-medium ${
                      t.type === "INCOME" ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(t.amount, currency)}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
