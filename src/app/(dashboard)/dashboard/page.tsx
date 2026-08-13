import { redirect } from "next/navigation";
import Link from "next/link";
import { getChurchContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  StatCard,
  statusColor,
  Table,
} from "@/components/ui";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  titleCase,
  toNumber,
} from "@/lib/utils";

function todayStart() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function todayEnd() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
}
function weekStart() {
  return new Date(todayStart().getTime() - 6 * 24 * 60 * 60 * 1000);
}
function monthStart() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1);
}
function nextMonth() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth() + 1, 1);
}

async function ChurchDashboard({ churchId }: { churchId: string }) {
  const [
    totalMembers,
    activeMembers,
    attendanceToday,
    attendanceWeek,
    income,
    expenses,
    upcomingEvents,
    recentMembers,
    recentTransactions,
    recentPrayers,
    recentVisitors,
  ] = await Promise.all([
    prisma.member.count({ where: { churchId } }),
    prisma.member.count({ where: { churchId, status: "ACTIVE" } }),
    prisma.attendance.count({
      where: { churchId, date: { gte: todayStart(), lt: todayEnd() } },
    }),
    prisma.attendance.count({
      where: { churchId, date: { gte: weekStart(), lt: todayEnd() } },
    }),
    prisma.financeTransaction.aggregate({
      where: {
        churchId,
        type: "INCOME",
        date: { gte: monthStart(), lt: nextMonth() },
      },
      _sum: { amount: true },
    }),
    prisma.financeTransaction.aggregate({
      where: {
        churchId,
        type: "EXPENSE",
        date: { gte: monthStart(), lt: nextMonth() },
      },
      _sum: { amount: true },
    }),
    prisma.event.findMany({
      where: { churchId, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.member.findMany({
      where: { churchId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.financeTransaction.findMany({
      where: { churchId },
      orderBy: { date: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.prayerRequest.findMany({
      where: { churchId, status: { not: "ANSWERED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.visitor.findMany({
      where: { churchId, status: { in: ["NEW", "FOLLOW_UP"] } },
      orderBy: { visitedDate: "desc" },
      take: 5,
    }),
  ]);

  const incomeSum = toNumber(income._sum.amount);
  const expenseSum = toNumber(expenses._sum.amount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="An overview of what is happening at your church."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={formatNumber(totalMembers)}
          sub={`${formatNumber(activeMembers)} active`}
          icon="members"
        />
        <StatCard
          label="Attendance (7 days)"
          value={formatNumber(attendanceWeek)}
          sub={`${formatNumber(attendanceToday)} today`}
          icon="attendance"
        />
        <StatCard
          label="Income (month)"
          value={formatCurrency(incomeSum)}
          sub={`${formatCurrency(expenseSum)} expenses`}
          icon="finance"
        />
        <StatCard
          label="Upcoming Events"
          value={formatNumber(upcomingEvents.length)}
          icon="events"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent members"
            action={
              <Link
                href="/members"
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          {recentMembers.length === 0 ? (
            <EmptyState title="No members yet" description="Add your first member to get started." />
          ) : (
            <Table head={["Name", "Gender", "Joined"]}>
              {recentMembers.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{titleCase(m.gender)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent transactions"
            action={
              <Link
                href="/finance"
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          {recentTransactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Record your first offering or expense." />
          ) : (
            <Table head={["Category", "Type", "Amount"]}>
              {recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 text-slate-900">{t.category.name}</td>
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
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming events"
            action={
              <Link
                href="/events"
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          {upcomingEvents.length === 0 ? (
            <EmptyState title="No upcoming events" />
          ) : (
            <Table head={["Event", "Type", "Starts"]}>
              {upcomingEvents.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{e.name}</td>
                  <td className="px-5 py-3">
                    <Badge color="indigo">{titleCase(e.type)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(e.startDate)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Prayer requests" />
          {recentPrayers.length === 0 ? (
            <EmptyState title="No open prayer requests" />
          ) : (
            <Table head={["Name", "Status", "Requested"]}>
              {recentPrayers.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor(p.status)}>{titleCase(p.status)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      {recentVisitors.length > 0 && (
        <Card>
          <CardHeader
            title="Visitors awaiting follow-up"
            action={
              <Link
                href="/visitors"
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          <Table head={["Name", "Visited", "Status"]}>
            {recentVisitors.map((v) => (
              <tr key={v.id}>
                <td className="px-5 py-3 font-medium text-slate-900">{v.name}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(v.visitedDate)}</td>
                <td className="px-5 py-3">
                  <Badge color={statusColor(v.status)}>{titleCase(v.status)}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

async function PlatformDashboard() {
  const [churches, activeChurches, trialChurches, totalMembers, totalIncome, recentChurches] =
    await Promise.all([
      prisma.church.count(),
      prisma.church.count({ where: { status: "ACTIVE" } }),
      prisma.church.count({ where: { status: "TRIAL" } }),
      prisma.member.count(),
      prisma.financeTransaction.aggregate({
        where: { type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.church.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { _count: { select: { members: true } } },
      }),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Summary of all churches on ChurchFlow."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Churches" value={formatNumber(churches)} icon="shield" />
        <StatCard
          label="Active"
          value={formatNumber(activeChurches)}
          sub={`${formatNumber(trialChurches)} on trial`}
          icon="departments"
        />
        <StatCard label="Members (all)" value={formatNumber(totalMembers)} icon="members" />
        <StatCard
          label="Total income"
          value={formatCurrency(toNumber(totalIncome._sum.amount))}
          icon="finance"
        />
      </div>

      <Card>
        <CardHeader
          title="Recent churches"
          action={
            <Link
              href="/admin"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              Manage
            </Link>
          }
        />
        <Table head={["Church", "Slug", "Plan", "Status", "Members", "Created"]}>
          {recentChurches.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
              <td className="px-5 py-3 text-slate-500">{c.slug}</td>
              <td className="px-5 py-3">
                <Badge color="blue">{titleCase(c.plan)}</Badge>
              </td>
              <td className="px-5 py-3">
                <Badge color={statusColor(c.status)}>{titleCase(c.status)}</Badge>
              </td>
              <td className="px-5 py-3 text-slate-500">{c._count.members}</td>
              <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = await getChurchContext();
  if (!ctx) redirect("/login");

  if (ctx.isSuperAdmin && !ctx.church) {
    return <PlatformDashboard />;
  }

  if (!ctx.churchId || !ctx.church) redirect("/login");

  const church = ctx.church;
  if (church.status === "SUSPENDED") {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Church suspended
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This church account has been suspended. Contact support to restore
            access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {church.status === "PENDING" && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your church is pending approval. Some features may be limited until it
          is activated.
        </div>
      )}
      <ChurchDashboard churchId={ctx.churchId} />
    </div>
  );
}
