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
import { formatDate, formatCurrency, titleCase } from "@/lib/utils";
import { EventForm } from "@/components/forms/event-form";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "events.view")) redirect("/dashboard");

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { churchId: ctx.churchId, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.event.findMany({
      where: { churchId: ctx.churchId, startDate: { lt: new Date() } },
      orderBy: { startDate: "desc" },
      take: 10,
      include: { _count: { select: { registrations: true } } },
    }),
  ]);

  const canManage = can(session.role, "events.manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Plan and manage church events." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-1">
            <CardHeader title="Create event" />
            <div className="p-5">
              <EventForm />
            </div>
          </Card>
        )}

        <div className={canManage ? "space-y-6 lg:col-span-2" : "lg:col-span-3 space-y-6"}>
          <Card>
            <CardHeader title="Upcoming events" />
            {upcoming.length === 0 ? (
              <EmptyState title="No upcoming events" description="Create your first event to get started." />
            ) : (
              <Table head={["Event", "Type", "Starts", "Location", "Regs", "Fee"]}>
                {upcoming.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {e.name}
                      {e.isOnline && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
                          Online
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge color="indigo">{titleCase(e.type)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(e.startDate)}</td>
                    <td className="px-5 py-3 text-slate-500">{e.location ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{e._count.registrations}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {e.fee ? formatCurrency(e.fee) : "Free"}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          {past.length > 0 && (
            <Card>
              <CardHeader title="Past events" />
              <Table head={["Event", "Type", "Started", "Regs"]}>
                {past.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3 text-slate-900">
                      {e.name}
                      {e.isOnline && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          Online
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge color="slate">{titleCase(e.type)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(e.startDate)}</td>
                    <td className="px-5 py-3 text-slate-500">{e._count.registrations}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
