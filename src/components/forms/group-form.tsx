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
    isOnline: false,
    meetingUrl: "",
    meetingPlatform: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/groups", {
      ...form,
      departmentId: form.departmentId || null,
      leaderId: form.leaderId || null,
      meetingUrl: form.meetingUrl || null,
      meetingPlatform: form.meetingPlatform || null,
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

      <div className="border-t border-slate-200 pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isOnline}
            onChange={(e) => update("isOnline", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          This group meets online
        </label>
      </div>

      {form.isOnline && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Meeting platform">
              <Select value={form.meetingPlatform} onChange={(e) => update("meetingPlatform", e.target.value)}>
                <option value="">None</option>
                <option value="ZOOM">Zoom</option>
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="DISCORD">Discord</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="Meeting link">
              <Input
                placeholder="https://zoom.us/j/..."
                value={form.meetingUrl}
                onChange={(e) => update("meetingUrl", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Create group
      </Button>
    </form>
  );
}
