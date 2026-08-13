import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Table,
  Badge,
} from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { DepartmentForm } from "@/components/forms/department-form";

export const metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "departments.view")) redirect("/dashboard");

  const departments = await prisma.department.findMany({
    where: { churchId: ctx.churchId },
    orderBy: { name: "asc" },
    include: {
      leader: true,
      _count: { select: { members: true, staff: true } },
    },
  });

  const canManage = can(session.role, "departments.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Organise ministries and departments." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Create department" />
            <div className="p-5">
              <DepartmentForm />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All departments" />
          {departments.length === 0 ? (
            <EmptyState title="No departments yet" description="Create your first department." />
          ) : (
            <Table head={["Department", "Leader", "Members", "Meets"]}>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="px-5 py-3 text-slate-500">{d.leader?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge color="emerald">{formatNumber(d._count.members)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {d.meetingDay ? `${d.meetingDay}${d.meetingTime ? ` · ${d.meetingTime}` : ""}` : "—"}
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
