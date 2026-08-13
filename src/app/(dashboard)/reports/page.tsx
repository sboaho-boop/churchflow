import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Table } from "@/components/ui";
import { formatCurrency, formatDate, formatNumber, titleCase, toNumber } from "@/lib/utils";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "reports.view")) redirect("/dashboard");

  const currency = ctx.church.currency ?? "GHS";

  const [byStatus, byGender, attendanceByType, givingByCategory, topGivers, birthdays] =
    await Promise.all([
      prisma.member.groupBy({
        by: ["status"],
        where: { churchId: ctx.churchId },
        _count: { _all: true },
      }),
      prisma.member.groupBy({
        by: ["gender"],
        where: { churchId: ctx.churchId },
        _count: { _all: true },
      }),
      prisma.attendance.groupBy({
        by: ["type"],
        where: { churchId: ctx.churchId },
        _count: { _all: true },
      }),
      prisma.financeTransaction.groupBy({
        by: ["categoryId"],
        where: { churchId: ctx.churchId, type: "INCOME" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      prisma.financeTransaction.groupBy({
        by: ["memberId"],
        where: { churchId: ctx.churchId, type: "INCOME", memberId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      prisma.member.findMany({
        where: {
          churchId: ctx.churchId,
          dob: { not: null },
        },
        select: { id: true, firstName: true, lastName: true, dob: true },
      }),
    ]);

  const categories = await prisma.financeCategory.findMany({
    where: { churchId: ctx.churchId, id: { in: givingByCategory.map((g) => g.categoryId) } },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const topMemberIds = topGivers
    .map((t) => t.memberId)
    .filter((id): id is string => id !== null);
  const topMembers = await prisma.member.findMany({
    where: { id: { in: topMemberIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const memberMap = new Map(topMembers.map((m) => [m.id, m]));

  const now = new Date();
  const upcomingBirthdays = birthdays
    .filter((b) => {
      if (!b.dob) return false;
      const month = b.dob.getMonth();
      const day = b.dob.getDate();
      return month === now.getMonth() && day >= now.getDate();
    })
    .sort((a, b) => (a.dob!.getDate() - b.dob!.getDate()))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Summary statistics across your church." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Members by status" />
          <Table head={["Status", "Count"]}>
            {byStatus.map((s) => (
              <tr key={s.status}>
                <td className="px-5 py-3 text-slate-900">
                  <Badge>{titleCase(s.status)}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-900">{formatNumber(s._count._all)}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Attendance by type" />
          <Table head={["Type", "Records"]}>
            {attendanceByType.map((a) => (
              <tr key={a.type}>
                <td className="px-5 py-3 text-slate-900">{titleCase(a.type)}</td>
                <td className="px-5 py-3 text-slate-900">{formatNumber(a._count._all)}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Giving by category" />
          {givingByCategory.length === 0 ? (
            <EmptyState title="No giving recorded" />
          ) : (
            <Table head={["Category", "Total"]}>
              {givingByCategory.map((g) => (
                <tr key={g.categoryId}>
                  <td className="px-5 py-3 text-slate-900">
                    {categoryMap.get(g.categoryId) ?? "Other"}
                  </td>
                  <td className="px-5 py-3 font-medium text-emerald-700">
                    {formatCurrency(toNumber(g._sum.amount), currency)}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Top givers" />
          {topGivers.length === 0 ? (
            <EmptyState title="No giving recorded" />
          ) : (
            <Table head={["Member", "Total"]}>
              {topGivers.map((t) => {
                const m = memberMap.get(t.memberId!);
                return (
                  <tr key={t.memberId}>
                    <td className="px-5 py-3 text-slate-900">
                      {m ? `${m.firstName} ${m.lastName}` : "Member"}
                    </td>
                    <td className="px-5 py-3 font-medium text-emerald-700">
                      {formatCurrency(toNumber(t._sum.amount), currency)}
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Members by gender" />
          <Table head={["Gender", "Count"]}>
            {byGender.map((g) => (
              <tr key={g.gender}>
                <td className="px-5 py-3 text-slate-900">{titleCase(g.gender)}</td>
                <td className="px-5 py-3 text-slate-900">{formatNumber(g._count._all)}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Upcoming birthdays this month" />
          {upcomingBirthdays.length === 0 ? (
            <EmptyState title="No birthdays this month" />
          ) : (
            <Table head={["Name", "Birthday"]}>
              {upcomingBirthdays.map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-3 text-slate-900">
                    {b.firstName} {b.lastName}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(new Date(b.dob!.getTime() + 86400000))}
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
