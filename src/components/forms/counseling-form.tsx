"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function CounselingForm({
  members,
  pastors,
}: {
  members: { id: string; name: string }[];
  pastors: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({ memberId: "", pastorId: "", date: "", notes: "" });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/counseling", {
      memberId: form.memberId || null,
      pastorId: form.pastorId,
      date: form.date,
      notes: form.notes,
    });
    if (ok) setForm({ ...form, notes: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Member">
          <Select value={form.memberId} onChange={(e) => update("memberId", e.target.value)}>
            <option value="">None</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pastor" htmlFor="pastorId">
          <Select
            id="pastorId"
            required
            value={form.pastorId}
            onChange={(e) => update("pastorId", e.target.value)}
          >
            <option value="">Select...</option>
            {pastors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Date & time" htmlFor="date">
        <Input
          id="date"
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </Field>
      <Field label="Notes">
        <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Schedule appointment
      </Button>
    </form>
  );
}
