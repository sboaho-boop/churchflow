import { redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { Card, PageHeader } from "@/components/ui";
import { MemberForm } from "@/components/forms/member-form";

export const metadata = { title: "Add member" };

export default async function NewMemberPage() {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "members.manage")) redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Add member" description="Add a new member to your church records." />
      <Card className="p-6">
        <MemberForm />
      </Card>
    </div>
  );
}
