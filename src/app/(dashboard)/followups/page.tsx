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
import { FollowUpForm } from "@/components/forms/followup-form";
import { FollowUpStatus } from "@/components/actions/followup-status";

export const metadata = { title: "Follow-ups" };

export default async function FollowUpsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "followups.view")) redirect("/dashboard");

  const [followUps, visitors, members] = await Promise.all([
    prisma.followUp.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { date: "desc" },
      take: 100,
      include: { visitor: true, member: true, assignedTo: true },
    }),
    prisma.visitor.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.member.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
  ]);

  const pending = followUps.filter((f) => f.status === "PENDING").length;
  const canManage = can(session.role, "followups.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Follow-ups" description="Follow up on visitors and members." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={formatNumber(followUps.length)} icon="followups" />
        <StatCard label="Pending" value={formatNumber(pending)} icon="followups" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="New follow-up" />
            <div className="p-5">
              <FollowUpForm
                visitors={visitors.map((v) => ({ id: v.id, label: v.name }))}
                members={members.map((m) => ({
                  id: m.id,
                  label: `${m.firstName} ${m.lastName}`,
                }))}
              />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All follow-ups" />
          {followUps.length === 0 ? (
            <EmptyState title="No follow-ups yet" />
          ) : (
            <Table head={["Person", "Type", "Date", "Status", ""]}>
              {followUps.map((f) => (
                <tr key={f.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {f.visitor?.name ?? (f.member ? `${f.member.firstName} ${f.member.lastName}` : "—")}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{titleCase(f.type)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(f.date)}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor(f.status)}>{titleCase(f.status)}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    {canManage && <FollowUpStatus id={f.id} current={f.status} />}
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
