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
import { formatDate, titleCase } from "@/lib/utils";
import { SermonForm } from "@/components/forms/sermon-form";

export const metadata = { title: "Sermons" };

export default async function SermonsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "sermons.view")) redirect("/dashboard");

  const [sermons, preachers] = await Promise.all([
    prisma.sermon.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { date: "desc" },
      take: 100,
      include: { preacher: true },
    }),
    prisma.user.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canManage = can(session.role, "sermons.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Sermons" description="Archive of preached messages." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Add sermon" />
            <div className="p-5">
              <SermonForm preachers={preachers.map((p) => ({ id: p.id, name: p.name }))} />
            </div>
          </Card>
        )}

        <Card className={canManage ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader title="All sermons" />
          {sermons.length === 0 ? (
            <EmptyState title="No sermons yet" description="Add your first sermon." />
          ) : (
            <Table head={["Title", "Topic", "Preacher", "Date", "Links"]}>
              {sermons.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{s.title}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {s.topic ? <Badge color="indigo">{s.topic}</Badge> : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.preacher?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(s.date)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 text-xs">
                      {s.audioUrl && (
                        <a className="text-emerald-600 hover:underline" href={s.audioUrl} target="_blank" rel="noreferrer">
                          Audio
                        </a>
                      )}
                      {s.videoUrl && (
                        <a className="text-emerald-600 hover:underline" href={s.videoUrl} target="_blank" rel="noreferrer">
                          Video
                        </a>
                      )}
                      {s.series && <span className="text-slate-400">{titleCase(s.series)}</span>}
                    </div>
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
