"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, ErrorText } from "@/components/ui";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    churchName: "",
    churchSlug: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Church name" htmlFor="churchName">
        <Input
          id="churchName"
          required
          minLength={2}
          placeholder="Grace Community Church"
          value={form.churchName}
          onChange={(e) => update("churchName", e.target.value)}
        />
      </Field>
      <Field label="Church ID" htmlFor="churchSlug">
        <Input
          id="churchSlug"
          required
          minLength={2}
          pattern="[a-z0-9-]+"
          placeholder="grace-community"
          value={form.churchSlug}
          onChange={(e) =>
            update("churchSlug", e.target.value.toLowerCase())
          }
        />
        <p className="mt-1 text-xs text-slate-500">
          A unique identifier for your church (lowercase, no spaces)
        </p>
      </Field>
      <Field label="Your name" htmlFor="adminName">
        <Input
          id="adminName"
          required
          minLength={2}
          placeholder="Pastor John Doe"
          value={form.adminName}
          onChange={(e) => update("adminName", e.target.value)}
        />
      </Field>
      <Field label="Email address" htmlFor="adminEmail">
        <Input
          id="adminEmail"
          type="email"
          required
          autoComplete="email"
          placeholder="you@church.org"
          value={form.adminEmail}
          onChange={(e) => update("adminEmail", e.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="adminPassword">
        <Input
          id="adminPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.adminPassword}
          onChange={(e) => update("adminPassword", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create my church account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
