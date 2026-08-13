import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
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
import { ageFromDate, formatDate, formatNumber, titleCase } from "@/lib/utils";
import { MemberActions } from "@/components/actions/member-actions";

export const metadata = { title: "Member" };

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "members.view")) redirect("/dashboard");

  const { id } = await params;

  const member = await prisma.member.findFirst({
    where: { id, ...tenantScope(ctx.churchId) },
    include: {
      departmentMembers: { include: { department: true } },
      family: true,
      user: true,
      _count: {
        select: {
          attendances: true,
          transactions: true,
          prayerRequests: true,
          eventRegistrations: true,
        },
      },
    },
  });

  if (!member) notFound();

  const name = `${member.firstName} ${member.lastName}`;
  const canManage = can(session.role, "members.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title={name}
        description={`Member ID ${member.memberId} · joined ${formatDate(member.dateJoined ?? member.createdAt)}`}
        action={
          canManage ? (
            <div className="flex gap-2">
              <MemberActions id={member.id} name={name} />
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={formatNumber(member._count.attendances)} icon="attendance" />
        <StatCard label="Giving records" value={formatNumber(member._count.transactions)} icon="finance" />
        <StatCard label="Prayer requests" value={formatNumber(member._count.prayerRequests)} icon="prayer" />
        <StatCard label="Event registrations" value={formatNumber(member._count.eventRegistrations)} icon="events" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm">
            <Info label="Gender" value={titleCase(member.gender)} />
            <Info label="Age" value={ageFromDate(member.dob)?.toString() ?? "—"} />
            <Info label="Phone" value={member.phone ?? "—"} />
            <Info label="Email" value={member.email ?? "—"} />
            <Info label="Marital status" value={titleCase(member.maritalStatus)} />
            <Info label="Occupation" value={member.occupation ?? "—"} />
            <Info label="Blood group" value={member.bloodGroup ? member.bloodGroup.replace("_", "+") : "—"} />
            <Info label="Membership" value={titleCase(member.membershipClass)} />
            <Info label="Date of birth" value={formatDate(member.dob)} />
            <Info label="Previous church" value={member.previousChurch ?? "—"} />
            <Info label="Family" value={member.family?.name ?? "—"} />
            <Info label="Status">
              <Badge color={statusColor(member.status)}>{titleCase(member.status)}</Badge>
            </Info>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Departments"
            action={
              canManage ? (
                <Link
                  href={`/members/${member.id}/edit`}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Edit member
                </Link>
              ) : undefined
            }
          />
          {member.departmentMembers.length === 0 ? (
            <EmptyState title="Not in any department" />
          ) : (
            <Table head={["Department", "Role"]}>
              {member.departmentMembers.map((dm) => (
                <tr key={dm.id}>
                  <td className="px-5 py-3 text-slate-900">{dm.department.name}</td>
                  <td className="px-5 py-3">
                    <Badge color="indigo">{titleCase(dm.role)}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      {member.notes && (
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Notes</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{member.notes}</p>
        </Card>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-slate-900">{value ?? children}</p>
    </div>
  );
}
