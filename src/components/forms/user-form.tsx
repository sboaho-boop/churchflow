"use client";

import { useState } from "react";
import { Button, Field, Input, Select, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

const initial = { name: "", email: "", password: "", role: "MEMBER", phone: "" };

export function UserForm() {
  const [form, setForm] = useState(initial);
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof initial, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/users", form);
    if (ok) setForm(initial);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Role">
          <Select value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="DEPARTMENT_LEADER">Department leader</option>
            <option value="PASTOR">Pastor</option>
            <option value="CHURCH_ADMIN">Church admin</option>
          </Select>
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
      </div>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create user
      </Button>
    </form>
  );
}
