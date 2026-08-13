import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your church.">
      <LoginForm />
    </AuthShell>
  );
}
