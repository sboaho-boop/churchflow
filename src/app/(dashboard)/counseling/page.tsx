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
  statusColor,
  Table,
} from "@/components/ui";
import { formatDate, titleCase } from "@/lib/utils";
import { CounselingForm } from "@/components/forms/counseling-form";

export const metadata = { title: "Counseling" };

export default async function CounselingPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "counseling.manage")) redirect("/dashboard");

  const [appointments, members, pastors] = await Promise.all([
    prisma.counselingAppointment.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { date: "desc" },
      take: 100,
      include: { member: true, pastor: true },
    }),
    prisma.member.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
    prisma.user.findMany({
      where: { churchId: ctx.churchId, role: { in: ["PASTOR", "CHURCH_ADMIN"] } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Counseling" description="Schedule and manage counseling appointments." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Schedule appointment" />
          <div className="p-5">
            <CounselingForm
              members={members.map((m) => ({
                id: m.id,
                name: `${m.firstName} ${m.lastName}`,
              }))}
              pastors={pastors.map((p) => ({ id: p.id, name: p.name }))}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Appointments" />
          {appointments.length === 0 ? (
            <EmptyState title="No appointments yet" />
          ) : (
            <Table head={["Member", "Pastor", "Date", "Status", "Notes"]}>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {a.member ? `${a.member.firstName} ${a.member.lastName}` : "Walk-in"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{a.pastor.name}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(a.date)}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor(a.status)}>{titleCase(a.status)}</Badge>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-slate-600" title={a.notes ?? ""}>
                    {a.notes ?? "—"}
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
