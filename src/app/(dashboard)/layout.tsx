import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { Logo } from "@/components/logo";
import { Sidebar, type NavItem } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx) redirect("/login");

  const role = session.role;

  const items: NavItem[] = [];
  if (can(role, "dashboard.view")) {
    items.push({ href: "/dashboard", label: "Dashboard", icon: "dashboard" });
  }
  if (can(role, "members.view")) {
    items.push({ href: "/members", label: "Members", icon: "members" });
  }
  if (can(role, "departments.view")) {
    items.push({ href: "/departments", label: "Departments", icon: "departments" });
  }
  if (can(role, "attendance.view")) {
    items.push({ href: "/attendance", label: "Attendance", icon: "attendance" });
  }
  if (can(role, "finance.view")) {
    items.push({ href: "/finance", label: "Finance", icon: "finance" });
  }
  if (can(role, "events.view")) {
    items.push({ href: "/events", label: "Events", icon: "events" });
  }
  if (can(role, "groups.view")) {
    items.push({ href: "/groups", label: "Groups", icon: "groups" });
  }
  if (can(role, "visitors.view")) {
    items.push({ href: "/visitors", label: "Visitors", icon: "visitors" });
  }
  if (can(role, "followups.view")) {
    items.push({ href: "/followups", label: "Follow-ups", icon: "followups" });
  }
  if (can(role, "prayer.view")) {
    items.push({ href: "/prayer", label: "Prayer Requests", icon: "prayer" });
  }
  if (can(role, "counseling.manage")) {
    items.push({ href: "/counseling", label: "Counseling", icon: "counseling" });
  }
  if (can(role, "sermons.view")) {
    items.push({ href: "/sermons", label: "Sermons", icon: "sermons" });
  }
  if (can(role, "online.view")) {
    items.push({ href: "/online", label: "Online Services", icon: "online" });
  }
  if (can(role, "reports.view")) {
    items.push({ href: "/reports", label: "Reports", icon: "reports" });
  }
  if (can(role, "settings.manage")) {
    items.push({ href: "/settings", label: "Settings", icon: "settings" });
  }
  if (role === "SUPER_ADMIN") {
    items.push({ href: "/admin", label: "Admin Panel", icon: "shield" });
  }

  const churchName =
    ctx.church?.name ?? (ctx.isSuperAdmin ? "ChurchFlow Platform" : "My Church");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        churchName={churchName}
        roleLabel={ROLE_LABELS[role]}
        items={items}
        superAdmin={ctx.isSuperAdmin}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
