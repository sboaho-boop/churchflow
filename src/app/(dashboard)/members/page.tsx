import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  EmptyState,
  Input,
  PageHeader,
  Select,
  statusColor,
  Table,
  LinkButton,
} from "@/components/ui";
import { ageFromDate, formatDate, titleCase } from "@/lib/utils";
import { MemberActions } from "@/components/actions/member-actions";

export const metadata = { title: "Members" };

const statuses = [
  ["", "All statuses"],
  ["ACTIVE", "Active"],
  ["ATTENDEE", "Attendee"],
  ["INACTIVE", "Inactive"],
  ["TRANSFERRED", "Transferred"],
  ["DECEASED", "Deceased"],
];

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "members.view")) redirect("/dashboard");

  const { q = "", status = "" } = await searchParams;

  const members = await prisma.member.findMany({
    where: {
      churchId: ctx.churchId,
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { memberId: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { attendances: true } } },
  });

  const canManage = can(session.role, "members.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description={`${members.length} record${members.length === 1 ? "" : "s"} shown`}
        action={
          canManage ? <LinkButton href="/members/new">Add member</LinkButton> : undefined
        }
      />

      <form method="GET" className="flex flex-wrap gap-3">
        <div className="w-full max-w-xs">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by name, ID or phone..."
          />
        </div>
        <div className="w-44">
          <Select name="status" defaultValue={status}>
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {members.length === 0 ? (
          <EmptyState
            title="No members found"
            description="Try adjusting your search, or add your first member."
            action={
              canManage ? <LinkButton href="/members/new">Add member</LinkButton> : undefined
            }
          />
        ) : (
          <Table
            head={["ID", "Name", "Gender", "Age", "Phone", "Status", "Attendance", ""]}
          >
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">
                  {m.memberId}
                </td>
                <td className="px-5 py-3 font-medium text-slate-900">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-5 py-3 text-slate-500">{titleCase(m.gender)}</td>
                <td className="px-5 py-3 text-slate-500">
                  {ageFromDate(m.dob) ?? "—"}
                </td>
                <td className="px-5 py-3 text-slate-500">{m.phone ?? "—"}</td>
                <td className="px-5 py-3">
                  <Badge color={statusColor(m.status)}>{titleCase(m.status)}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {m._count.attendances}
                </td>
                <td className="px-5 py-3 text-right">
                  {canManage ? (
                    <MemberActions id={m.id} name={`${m.firstName} ${m.lastName}`} />
                  ) : (
                    <span className="text-slate-400">{formatDate(m.createdAt)}</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
