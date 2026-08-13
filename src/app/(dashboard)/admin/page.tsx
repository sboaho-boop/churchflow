import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  PageHeader,
  StatCard,
  statusColor,
  Table,
} from "@/components/ui";
import { formatDate, formatNumber, titleCase } from "@/lib/utils";
import { ChurchAdminActions } from "@/components/actions/church-admin-actions";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const ctx = await getChurchContext();
  if (!ctx?.isSuperAdmin) redirect("/dashboard");

  const [churches, activeChurches, pendingChurches, totalMembers] =
    await Promise.all([
      prisma.church.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { members: true, users: true } } },
      }),
      prisma.church.count({ where: { status: "ACTIVE" } }),
      prisma.church.count({ where: { status: "PENDING" } }),
      prisma.member.count(),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Panel"
        description="Manage all churches on the platform."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Churches" value={formatNumber(churches.length)} icon="shield" />
        <StatCard label="Active" value={formatNumber(activeChurches)} icon="departments" />
        <StatCard label="Pending" value={formatNumber(pendingChurches)} icon="followups" />
        <StatCard label="Total members" value={formatNumber(totalMembers)} icon="members" />
      </div>

      <Card>
        <CardHeader title="All churches" description={`${churches.length} churches on ChurchFlow`} />
        <Table head={["Church", "Slug", "Plan", "Status", "Members", "Users", "Created", "Actions"]}>
          {churches.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
              <td className="px-5 py-3 font-mono text-xs text-slate-500">{c.slug}</td>
              <td className="px-5 py-3">
                <Badge color="blue">{titleCase(c.plan)}</Badge>
              </td>
              <td className="px-5 py-3">
                <Badge color={statusColor(c.status)}>{titleCase(c.status)}</Badge>
              </td>
              <td className="px-5 py-3 text-slate-500">{c._count.members}</td>
              <td className="px-5 py-3 text-slate-500">{c._count.users}</td>
              <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
              <td className="px-5 py-3">
                <ChurchAdminActions id={c.id} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
