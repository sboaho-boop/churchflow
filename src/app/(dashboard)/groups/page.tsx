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
  Table,
} from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { GroupForm } from "@/components/forms/group-form";

export const metadata = { title: "Groups" };

const platformLabels: Record<string, string> = {
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  MICROSOFT_TEAMS: "Teams",
  WHATSAPP: "WhatsApp",
  DISCORD: "Discord",
  OTHER: "Other",
};

export default async function GroupsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "groups.view")) redirect("/dashboard");

  const [groups, departments, leaders] = await Promise.all([
    prisma.smallGroup.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { name: "asc" },
      include: {
        department: true,
        leader: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.department.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canManage = can(session.role, "groups.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Small groups" description="Cells, fellowships and small groups." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Create group" />
            <div className="p-5">
              <GroupForm departments={departments} leaders={leaders} />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All groups" />
          {groups.length === 0 ? (
            <EmptyState title="No groups yet" description="Create your first small group." />
          ) : (
            <Table head={["Group", "Department", "Leader", "Meets", "Members", "Online"]}>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{g.name}</td>
                  <td className="px-5 py-3 text-slate-500">{g.department?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{g.leader?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {g.meetingDay ? `${g.meetingDay}${g.meetingTime ? ` · ${g.meetingTime}` : ""}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color="emerald">{formatNumber(g._count.members)}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    {g.isOnline ? (
                      <div className="flex items-center gap-2">
                        <Badge color="blue">
                          {g.meetingPlatform ? platformLabels[g.meetingPlatform] ?? "Online" : "Online"}
                        </Badge>
                        {g.meetingUrl && (
                          <a
                            href={g.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-emerald-600 hover:underline"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
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
