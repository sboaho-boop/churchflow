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
  statusColor,
  Table,
} from "@/components/ui";
import { formatDate, formatNumber, titleCase } from "@/lib/utils";
import { PrayerForm } from "@/components/forms/prayer-form";
import { PrayerActions } from "@/components/actions/prayer-actions";

export const metadata = { title: "Prayer Requests" };

export default async function PrayerPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "prayer.view")) redirect("/dashboard");

  const [requests, members, openCount] = await Promise.all([
    prisma.prayerRequest.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { member: true, answeredBy: true },
    }),
    prisma.member.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
    prisma.prayerRequest.count({
      where: { churchId: ctx.churchId, status: { not: "ANSWERED" } },
    }),
  ]);

  const canManage = can(session.role, "prayer.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Prayer requests" description="Collect and respond to prayer requests." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total requests" value={formatNumber(requests.length)} icon="prayer" />
        <StatCard label="Open" value={formatNumber(openCount)} icon="prayer" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Submit request" />
            <div className="p-5">
              <PrayerForm
                members={members.map((m) => ({
                  id: m.id,
                  name: `${m.firstName} ${m.lastName}`,
                }))}
              />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All requests" />
          {requests.length === 0 ? (
            <EmptyState title="No prayer requests yet" />
          ) : (
            <Table head={["Name", "Request", "Submitted", "Status", ""]}>
              {requests.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-slate-600" title={p.request}>
                    {p.request}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor(p.status)}>{titleCase(p.status)}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    {canManage && <PrayerActions id={p.id} current={p.status} />}
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
