"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

interface NamedOption {
  id: string;
  label: string;
}

export function FollowUpForm({
  visitors,
  members,
}: {
  visitors: NamedOption[];
  members: NamedOption[];
}) {
  const [form, setForm] = useState({
    visitorId: "",
    memberId: "",
    type: "FIRST_VISIT",
    date: "",
    notes: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/followups", {
      visitorId: form.visitorId || null,
      memberId: form.memberId || null,
      type: form.type,
      date: form.date || undefined,
      notes: form.notes,
    });
    if (ok) {
      setForm({ ...form, notes: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Visitor">
          <Select value={form.visitorId} onChange={(e) => update("visitorId", e.target.value)}>
            <option value="">None</option>
            {visitors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Member">
          <Select value={form.memberId} onChange={(e) => update("memberId", e.target.value)}>
            <option value="">None</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="FIRST_VISIT">First visit</option>
            <option value="PHONE_CALL">Phone call</option>
            <option value="HOME_VISIT">Home visit</option>
            <option value="COUNSELING">Counseling</option>
            <option value="MEMBERSHIP_CLASS">Membership class</option>
            <option value="BAPTISM">Baptism</option>
            <option value="DEPARTMENT_INTEGRATION">Department integration</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create follow-up
      </Button>
    </form>
  );
}
