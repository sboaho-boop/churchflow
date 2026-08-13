"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

const initial = {
  name: "",
  type: "CONFERENCE",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  fee: "",
};

export function EventForm() {
  const [form, setForm] = useState(initial);
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof initial, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/events", {
      ...form,
      fee: form.fee ? parseFloat(form.fee) : null,
    });
    if (ok) setForm(initial);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Event name" htmlFor="name">
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="CONFERENCE">Conference</option>
            <option value="SEMINAR">Seminar</option>
            <option value="RETREAT">Retreat</option>
            <option value="CRUSADE">Crusade</option>
            <option value="CONVENTION">Convention</option>
            <option value="CAMP">Camp</option>
            <option value="BAPTISM">Baptism</option>
            <option value="COMMUNION">Communion</option>
            <option value="WEDDING">Wedding</option>
            <option value="FUNERAL">Funeral</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
        <Field label="Fee (optional)">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.fee}
            onChange={(e) => update("fee", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            type="datetime-local"
            required
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
        </Field>
        <Field label="End date">
          <Input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Location">
        <Input
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create event
      </Button>
    </form>
  );
}
