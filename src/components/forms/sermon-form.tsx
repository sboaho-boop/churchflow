"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function SermonForm({
  preachers,
}: {
  preachers: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    title: "",
    topic: "",
    series: "",
    date: "",
    preacherId: "",
    audioUrl: "",
    videoUrl: "",
    notes: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/sermons", {
      ...form,
      preacherId: form.preacherId || null,
      date: form.date || undefined,
    });
    if (ok) {
      setForm({ ...form, title: "", topic: "", audioUrl: "", videoUrl: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Sermon title" htmlFor="title">
        <Input
          id="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Topic">
          <Input value={form.topic} onChange={(e) => update("topic", e.target.value)} />
        </Field>
        <Field label="Series">
          <Input value={form.series} onChange={(e) => update("series", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date">
          <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
        </Field>
        <Field label="Preacher">
          <Select value={form.preacherId} onChange={(e) => update("preacherId", e.target.value)}>
            <option value="">Unassigned</option>
            {preachers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Audio URL">
          <Input value={form.audioUrl} onChange={(e) => update("audioUrl", e.target.value)} />
        </Field>
        <Field label="Video URL">
          <Input value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Add sermon
      </Button>
    </form>
  );
}
