import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can, canManageOnline } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Table,
  StatCard,
} from "@/components/ui";
import { formatDate, formatNumber } from "@/lib/utils";
import { OnlineAttendanceForm } from "@/components/forms/online-attendance-form";

export const metadata = { title: "Online Services" };

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function StreamEmbed({ url }: { url: string }) {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Live stream"
        />
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
    >
      Open stream in new tab
    </a>
  );
}

const platformColors: Record<string, string> = {
  ZOOM: "bg-blue-100 text-blue-700",
  GOOGLE_MEET: "bg-green-100 text-green-700",
  MICROSOFT_TEAMS: "bg-indigo-100 text-indigo-700",
  YOUTUBE_LIVE: "bg-red-100 text-red-700",
  FACEBOOK_LIVE: "bg-blue-100 text-blue-800",
  OTHER: "bg-slate-100 text-slate-700",
};

function platformLabel(p: string | null) {
  if (!p) return null;
  const labels: Record<string, string> = {
    ZOOM: "Zoom",
    GOOGLE_MEET: "Google Meet",
    MICROSOFT_TEAMS: "Teams",
    YOUTUBE_LIVE: "YouTube Live",
    FACEBOOK_LIVE: "Facebook Live",
    OTHER: "Other",
  };
  return labels[p] ?? p;
}

export default async function OnlineServicesPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "online.view")) redirect("/dashboard");

  const now = new Date();

  const [onlineEvents, onlineGroups, recentAttendance, todayCount, totalCount, members] = await Promise.all([
    prisma.event.findMany({
      where: {
        churchId: ctx.churchId,
        isOnline: true,
        startDate: { gte: now },
      },
      orderBy: { startDate: "asc" },
      include: { _count: { select: { onlineAttendances: true } } },
    }),
    prisma.smallGroup.findMany({
      where: { churchId: ctx.churchId, isOnline: true },
      orderBy: { name: "asc" },
      include: {
        leader: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.onlineAttendance.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { joinedAt: "desc" },
      take: 20,
      include: { member: true, event: true },
    }),
    prisma.onlineAttendance.count({
      where: {
        churchId: ctx.churchId,
        joinedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    }),
    prisma.onlineAttendance.count({
      where: { churchId: ctx.churchId },
    }),
    prisma.member.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const canManage = canManageOnline(session.role);
  const liveEvent = onlineEvents.find((e) => {
    const end = e.endDate ?? new Date(e.startDate.getTime() + 2 * 60 * 60 * 1000);
    return e.streamUrl && now >= e.startDate && now <= end;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Services"
        description="Live streams, virtual meetings and online attendance."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Live now"
          value={liveEvent ? "1" : "0"}
          sub={liveEvent ? liveEvent.name : "No active streams"}
          icon="online"
        />
        <StatCard
          label="Today"
          value={formatNumber(todayCount)}
          sub="online check-ins"
          icon="attendance"
        />
        <StatCard
          label="All time"
          value={formatNumber(totalCount)}
          sub="total online visits"
          icon="groups"
        />
      </div>

      {liveEvent?.streamUrl && (
        <Card>
          <CardHeader title={`Live: ${liveEvent.name}`} />
          <div className="p-5">
            <StreamEmbed url={liveEvent.streamUrl} />
            {liveEvent.meetingUrl && (
              <div className="mt-4">
                <a
                  href={liveEvent.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Join meeting
                  {liveEvent.meetingPlatform && (
                    <Badge color="indigo">{platformLabel(liveEvent.meetingPlatform)}</Badge>
                  )}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Upcoming online services" />
            {onlineEvents.length === 0 ? (
              <EmptyState
                title="No online services"
                description="Create an event and mark it as online to see it here."
              />
            ) : (
              <Table head={["Service", "Platform", "Starts", "Attending", "Links"]}>
                {onlineEvents.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{e.name}</td>
                    <td className="px-5 py-3">
                      {e.meetingPlatform ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${platformColors[e.meetingPlatform] ?? "bg-slate-100 text-slate-700"}`}>
                          {platformLabel(e.meetingPlatform)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(e.startDate)}</td>
                    <td className="px-5 py-3 text-slate-500">{e._count.onlineAttendances}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {e.streamUrl && (
                          <a
                            href={e.streamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-emerald-600 hover:underline"
                          >
                            Stream
                          </a>
                        )}
                        {e.meetingUrl && (
                          <a
                            href={e.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Meeting
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <Card>
            <CardHeader title="Online small groups" />
            {onlineGroups.length === 0 ? (
              <EmptyState
                title="No online groups"
                description="Mark a group as online to see it here."
              />
            ) : (
              <Table head={["Group", "Platform", "Leader", "Meets", "Members", "Link"]}>
                {onlineGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{g.name}</td>
                    <td className="px-5 py-3">
                      {g.meetingPlatform ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${platformColors[g.meetingPlatform] ?? "bg-slate-100 text-slate-700"}`}>
                          {platformLabel(g.meetingPlatform)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{g.leader?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {g.meetingDay ? `${g.meetingDay}${g.meetingTime ? ` · ${g.meetingTime}` : ""}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge color="emerald">{formatNumber(g._count.members)}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {g.meetingUrl ? (
                        <a
                          href={g.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Join
                        </a>
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

        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader title="Record online attendance" />
              <div className="p-5">
                <OnlineAttendanceForm
                  events={onlineEvents.map((e) => ({ id: e.id, name: e.name, isOnline: e.isOnline }))}
                  members={members}
                />
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Recent online check-ins" />
            {recentAttendance.length === 0 ? (
              <EmptyState title="No check-ins yet" description="Online attendance will appear here." />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAttendance.map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {a.member ? `${a.member.firstName} ${a.member.lastName}` : a.guestName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.event?.name ?? "No event"} · {a.platform ?? "Unknown platform"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
