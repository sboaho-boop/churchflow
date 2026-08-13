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
import { formatDate, formatNumber, titleCase } from "@/lib/utils";
import { AttendanceForm } from "@/components/forms/attendance-form";

export const metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "attendance.view")) redirect("/dashboard");

  const [attendance, todayCount, weekCount, members, serviceTypes, byType] =
    await Promise.all([
      prisma.attendance.findMany({
        where: { churchId: ctx.churchId },
        orderBy: { date: "desc" },
        take: 50,
        include: { member: true, serviceType: true },
      }),
      prisma.attendance.count({
        where: { churchId: ctx.churchId, date: { gte: startOfDay() } },
      }),
      prisma.attendance.count({
        where: {
          churchId: ctx.churchId,
          date: { gte: new Date(startOfDay().getTime() - 6 * 86400000) },
        },
      }),
      prisma.member.findMany({
        where: { churchId: ctx.churchId, status: { in: ["ACTIVE", "ATTENDEE"] } },
        orderBy: { firstName: "asc" },
        take: 500,
      }),
      prisma.serviceType.findMany({
        where: { churchId: ctx.churchId },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.groupBy({
        by: ["type"],
        where: { churchId: ctx.churchId },
        _count: { _all: true },
      }),
    ]);

  const canManage = can(session.role, "attendance.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Record and review attendance for services and meetings."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today" value={formatNumber(todayCount)} icon="attendance" />
        <StatCard label="Last 7 days" value={formatNumber(weekCount)} icon="attendance" />
        <StatCard label="Total records" value={formatNumber(attendance.length)} icon="attendance" />
        <StatCard label="Service types" value={formatNumber(serviceTypes.length)} icon="departments" />
      </div>

      {byType.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">By service type</h3>
          <div className="flex flex-wrap gap-2">
            {byType.map((b) => (
              <span
                key={b.type}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
              >
                {titleCase(b.type)}
                <span className="font-semibold text-slate-900">{b._count._all}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Record attendance" />
            <div className="p-5">
              <AttendanceForm members={members} serviceTypes={serviceTypes} />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="Recent attendance" />
          {attendance.length === 0 ? (
            <EmptyState title="No attendance recorded yet" description="Record your first service attendance." />
          ) : (
            <Table head={["Member", "Type", "Date", "Method"]}>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {a.member ? `${a.member.firstName} ${a.member.lastName}` : "Guest / walk-in"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color="indigo">{titleCase(a.type)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(a.date)}</td>
                  <td className="px-5 py-3 text-slate-500">{titleCase(a.method)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

function startOfDay() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
