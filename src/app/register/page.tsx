import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = { title: "Create your church" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(session.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");

  return (
    <AuthShell
      title="Create your church account"
      subtitle="Set up your church workspace in under a minute."
    >
      <RegisterForm />
    </AuthShell>
  );
}
