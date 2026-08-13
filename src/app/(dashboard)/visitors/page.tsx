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
import { VisitorForm } from "@/components/forms/visitor-form";

export const metadata = { title: "Visitors" };

export default async function VisitorsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "visitors.view")) redirect("/dashboard");

  const [visitors, pendingCount] = await Promise.all([
    prisma.visitor.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { visitedDate: "desc" },
      take: 100,
      include: { assignedTo: true },
    }),
    prisma.visitor.count({
      where: { churchId: ctx.churchId, status: { in: ["NEW", "FOLLOW_UP"] } },
    }),
  ]);

  const canManage = can(session.role, "visitors.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Visitors" description="Track first-time visitors and guests." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total visitors" value={formatNumber(visitors.length)} icon="visitors" />
        <StatCard label="Need follow-up" value={formatNumber(pendingCount)} icon="followups" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Add visitor" />
            <div className="p-5">
              <VisitorForm />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All visitors" />
          {visitors.length === 0 ? (
            <EmptyState title="No visitors yet" description="Add your first visitor." />
          ) : (
            <Table head={["Name", "Visited", "Phone", "Assigned to", "Status"]}>
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{v.name}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(v.visitedDate)}</td>
                  <td className="px-5 py-3 text-slate-500">{v.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{v.assignedTo?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor(v.status)}>{titleCase(v.status)}</Badge>
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
