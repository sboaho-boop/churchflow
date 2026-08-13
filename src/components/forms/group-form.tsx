"use client";

import { useState } from "react";
import { Button, Field, Input, Select, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function GroupForm({
  departments,
  leaders,
}: {
  departments: { id: string; name: string }[];
  leaders: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    name: "",
    departmentId: "",
    leaderId: "",
    meetingLocation: "",
    meetingDay: "",
    meetingTime: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/groups", {
      ...form,
      departmentId: form.departmentId || null,
      leaderId: form.leaderId || null,
    });
    if (ok) setForm({ ...form, name: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Group name" htmlFor="name">
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Department (optional)">
          <Select
            value={form.departmentId}
            onChange={(e) => update("departmentId", e.target.value)}
          >
            <option value="">None</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Leader (optional)">
          <Select value={form.leaderId} onChange={(e) => update("leaderId", e.target.value)}>
            <option value="">None</option>
            {leaders.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Location">
          <Input
            value={form.meetingLocation}
            onChange={(e) => update("meetingLocation", e.target.value)}
          />
        </Field>
        <Field label="Day">
          <Input
            value={form.meetingDay}
            placeholder="e.g. Wednesdays"
            onChange={(e) => update("meetingDay", e.target.value)}
          />
        </Field>
        <Field label="Time">
          <Input
            value={form.meetingTime}
            placeholder="e.g. 6:30 PM"
            onChange={(e) => update("meetingTime", e.target.value)}
          />
        </Field>
      </div>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create group
      </Button>
    </form>
  );
}
