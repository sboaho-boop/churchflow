import { notFound, redirect } from "next/navigation";
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

export const metadata = { title: "Church" };

export default async function AdminChurchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getChurchContext();
  if (!ctx?.isSuperAdmin) redirect("/dashboard");

  const { id } = await params;

  const church = await prisma.church.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          members: true,
          users: true,
          events: true,
          attendances: true,
          financeTransactions: true,
          visitors: true,
          prayerRequests: true,
        },
      },
    },
  });

  if (!church) notFound();

  const [recentMembers, recentUsers, recentActivity] = await Promise.all([
    prisma.member.findMany({
      where: { churchId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.user.findMany({
      where: { churchId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.auditLog.findMany({
      where: { churchId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={church.name}
        description={`${church.slug}.churchflow.app · created ${formatDate(church.createdAt)}`}
        action={<ChurchAdminActions id={church.id} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Members" value={formatNumber(church._count.members)} icon="members" />
        <StatCard label="Users" value={formatNumber(church._count.users)} icon="settings" />
        <StatCard label="Attendance" value={formatNumber(church._count.attendances)} icon="attendance" />
        <StatCard label="Transactions" value={formatNumber(church._count.financeTransactions)} icon="finance" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Church profile" />
          <div className="divide-y divide-slate-100 px-5 py-2 text-sm">
            <AdminRow label="Motto" value={church.motto ?? "—"} />
            <AdminRow label="Address" value={church.address ?? "—"} />
            <AdminRow label="Phone" value={church.phone ?? "—"} />
            <AdminRow label="Email" value={church.email ?? "—"} />
            <AdminRow label="Website" value={church.website ?? "—"} />
            <AdminRow label="Currency" value={church.currency} />
            <AdminRow label="Member limit" value={String(church.memberLimit)} />
            <AdminRow
              label="Plan / Status"
              value={
                <span className="flex gap-2">
                  <Badge color="blue">{titleCase(church.plan)}</Badge>
                  <Badge color={statusColor(church.status)}>{titleCase(church.status)}</Badge>
                </span>
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          {recentActivity.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">No activity logged yet.</p>
          ) : (
            <Table head={["Action", "Entity", "User", "When"]}>
              {recentActivity.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 text-slate-900">{a.action}</td>
                  <td className="px-5 py-3 text-slate-500">{a.entity}</td>
                  <td className="px-5 py-3 text-slate-500">{a.user?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent members" />
          <Table head={["Name", "ID", "Status"]}>
            {recentMembers.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3 text-slate-900">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{m.memberId}</td>
                <td className="px-5 py-3">
                  <Badge color={statusColor(m.status)}>{titleCase(m.status)}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Users" />
          <Table head={["Name", "Email", "Role"]}>
            {recentUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 text-slate-900">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge color="blue">{titleCase(u.role)}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}

function AdminRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
