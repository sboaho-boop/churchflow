"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function PrayerForm({ members }: { members: { id: string; name: string }[] }) {
  const [form, setForm] = useState({ name: "", request: "", memberId: "" });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/prayer-requests", {
      name: form.name,
      request: form.request,
      memberId: form.memberId || null,
    });
    if (ok) setForm({ ...form, request: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Member (optional)">
          <Select
            value={form.memberId}
            onChange={(e) => update("memberId", e.target.value)}
          >
            <option value="">Not a member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Prayer request" htmlFor="request">
        <Textarea
          id="request"
          required
          rows={3}
          value={form.request}
          onChange={(e) => update("request", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Submit request
      </Button>
    </form>
  );
}
