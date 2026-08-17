"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function OnlineAttendanceForm({
  events,
  members,
}: {
  events: { id: string; name: string; isOnline: boolean }[];
  members: { id: string; firstName: string; lastName: string }[];
}) {
  const [form, setForm] = useState({
    eventId: "",
    memberId: "",
    guestName: "",
    platform: "",
    notes: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/online-attendance", {
      ...form,
      eventId: form.eventId || null,
      memberId: form.memberId || null,
    });
    if (ok) setForm({ eventId: "", memberId: "", guestName: "", platform: "", notes: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Event (optional)">
        <Select value={form.eventId} onChange={(e) => update("eventId", e.target.value)}>
          <option value="">No specific event</option>
          {events.filter((e) => e.isOnline).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Member (optional)">
          <Select value={form.memberId} onChange={(e) => update("memberId", e.target.value)}>
            <option value="">Guest</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Guest name (if not a member)">
          <Input
            value={form.guestName}
            onChange={(e) => update("guestName", e.target.value)}
            placeholder="John Doe"
          />
        </Field>
      </div>
      <Field label="Platform">
        <Select value={form.platform} onChange={(e) => update("platform", e.target.value)}>
          <option value="">Unknown</option>
          <option value="ZOOM">Zoom</option>
          <option value="GOOGLE_MEET">Google Meet</option>
          <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
          <option value="YOUTUBE_LIVE">YouTube Live</option>
          <option value="FACEBOOK_LIVE">Facebook Live</option>
          <option value="OTHER">Other</option>
        </Select>
      </Field>
      <Field label="Notes">
        <Textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Record attendance
      </Button>
    </form>
  );
}
