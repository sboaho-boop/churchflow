import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  PageHeader,
  Table,
  statusColor,
} from "@/components/ui";
import { formatDate, titleCase } from "@/lib/utils";
import { SettingsForm } from "@/components/forms/settings-form";
import { UserForm } from "@/components/forms/user-form";
import { UserActions } from "@/components/actions/user-actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "settings.manage")) redirect("/dashboard");

  const church = ctx.church;
  const users = await prisma.user.findMany({
    where: { churchId: ctx.churchId },
    orderBy: { createdAt: "desc" },
    include: { member: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Church profile and account management." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Church profile" />
          <div className="p-5">
            <SettingsForm
              initial={{
                name: church.name,
                motto: church.motto,
                description: church.description,
                address: church.address,
                phone: church.phone,
                email: church.email,
                website: church.website,
                currency: church.currency,
              }}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Account details" />
          <div className="divide-y divide-slate-100 px-5 py-4 text-sm">
            <Row label="Church address" value={`${church.slug}.churchflow.app`} />
            <Row label="Plan" value={titleCase(church.plan)} />
            <Row label="Status" value={<Badge color={statusColor(church.status)}>{titleCase(church.status)}</Badge>} />
            <Row label="Member limit" value={String(church.memberLimit)} />
            <Row label="Created" value={formatDate(church.createdAt)} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Team members" description="People with access to this church workspace." />
        <Table head={["Name", "Email", "Role", "Member", "Last login", "Status", ""]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
              <td className="px-5 py-3 text-slate-500">{u.email}</td>
              <td className="px-5 py-3">
                <Badge color="blue">{ROLE_LABELS[u.role]}</Badge>
              </td>
              <td className="px-5 py-3 text-slate-500">
                {u.member ? `${u.member.firstName} ${u.member.lastName}` : "—"}
              </td>
              <td className="px-5 py-3 text-slate-500">{formatDate(u.lastLoginAt)}</td>
              <td className="px-5 py-3">
                <Badge color={u.active ? "emerald" : "red"}>{u.active ? "Active" : "Inactive"}</Badge>
              </td>
              <td className="px-5 py-3 text-right">
                <UserActions id={u.id} self={u.id === session.sub} active={u.active} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHeader title="Invite team member" description="Create a login for a pastor, leader or staff member." />
        <div className="max-w-xl p-5">
          <UserForm />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
