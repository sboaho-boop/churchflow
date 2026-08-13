import type { Role } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  CHURCH_ADMIN: "Church Admin",
  PASTOR: "Pastor",
  DEPARTMENT_LEADER: "Department Leader",
  MEMBER: "Member",
};

const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"],
  CHURCH_ADMIN: [
    "dashboard.view",
    "members.manage",
    "members.view",
    "families.manage",
    "families.view",
    "departments.manage",
    "departments.view",
    "attendance.manage",
    "attendance.view",
    "finance.manage",
    "finance.view",
    "events.manage",
    "events.view",
    "groups.manage",
    "groups.view",
    "visitors.manage",
    "visitors.view",
    "followups.manage",
    "followups.view",
    "prayer.manage",
    "prayer.view",
    "counseling.manage",
    "sermons.manage",
    "sermons.view",
    "reports.view",
    "settings.manage",
    "users.manage",
    "communication.manage",
  ],
  PASTOR: [
    "dashboard.view",
    "members.view",
    "attendance.view",
    "finance.view",
    "prayer.manage",
    "prayer.view",
    "counseling.manage",
    "sermons.manage",
    "sermons.view",
    "followups.manage",
    "followups.view",
    "visitors.view",
    "reports.view",
    "events.view",
  ],
  DEPARTMENT_LEADER: [
    "dashboard.view",
    "members.view",
    "attendance.manage",
    "attendance.view",
    "groups.view",
    "events.view",
  ],
  MEMBER: [
    "dashboard.view",
    "members.view.self",
    "prayer.create",
    "events.view",
    "sermons.view",
  ],
};

export function can(
  role: Role | null | undefined,
  permission: string
): boolean {
  if (!role) return false;
  const granted = PERMISSIONS[role];
  return granted.includes("*") || granted.includes(permission);
}

export function canManageMembers(role?: Role | null) {
  return can(role, "members.manage");
}

export function canManageAttendance(role?: Role | null) {
  return can(role, "attendance.manage");
}

export function canManageFinance(role?: Role | null) {
  return can(role, "finance.manage");
}

export function canManageEvents(role?: Role | null) {
  return can(role, "events.manage");
}

export function canManageVisitors(role?: Role | null) {
  return can(role, "visitors.manage");
}

export function canManagePrayer(role?: Role | null) {
  return can(role, "prayer.manage");
}

export function canManageSermons(role?: Role | null) {
  return can(role, "sermons.manage");
}

export function canManageGroups(role?: Role | null) {
  return can(role, "groups.manage");
}

export function canManageDepartments(role?: Role | null) {
  return can(role, "departments.manage");
}

export function canManageFollowUps(role?: Role | null) {
  return can(role, "followups.manage");
}
