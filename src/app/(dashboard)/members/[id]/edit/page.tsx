import { notFound, redirect } from "next/navigation";
import { getChurchContext } from "@/lib/tenant";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { Card, PageHeader } from "@/components/ui";
import { MemberForm } from "@/components/forms/member-form";

export const metadata = { title: "Edit member" };

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const ctx = await getChurchContext();
  if (!ctx?.church) redirect("/login");
  if (!can(session.role, "members.manage")) redirect("/dashboard");

  const { id } = await params;

  const member = await prisma.member.findFirst({
    where: { id, ...tenantScope(ctx.churchId) },
  });
  if (!member) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={`Edit ${member.firstName} ${member.lastName}`}
        description="Update member details."
      />
      <Card className="p-6">
        <MemberForm
          memberId={member.id}
          initial={{
            firstName: member.firstName,
            lastName: member.lastName,
            otherNames: member.otherNames ?? "",
            gender: member.gender,
            dob: member.dob,
            phone: member.phone ?? "",
            email: member.email ?? "",
            address: member.address ?? "",
            occupation: member.occupation ?? "",
            maritalStatus: member.maritalStatus,
            bloodGroup: member.bloodGroup ?? "",
            membershipClass: member.membershipClass,
            dateJoined: member.dateJoined,
            previousChurch: member.previousChurch ?? "",
            status: member.status,
            notes: member.notes ?? "",
          }}
        />
      </Card>
    </div>
  );
}
