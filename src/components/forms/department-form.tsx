"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

const initial = { name: "", description: "", meetingDay: "", meetingTime: "" };

export function DepartmentForm() {
  const [form, setForm] = useState(initial);
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof initial, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/departments", form);
    if (ok) setForm(initial);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Department name" htmlFor="name">
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Meeting day">
          <Input
            value={form.meetingDay}
            placeholder="e.g. Sundays"
            onChange={(e) => update("meetingDay", e.target.value)}
          />
        </Field>
        <Field label="Meeting time">
          <Input
            value={form.meetingTime}
            placeholder="e.g. 9:00 AM"
            onChange={(e) => update("meetingTime", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create department
      </Button>
    </form>
  );
}
