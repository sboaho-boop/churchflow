"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

const initial = { name: "", phone: "", address: "", invitedBy: "", notes: "" };

export function VisitorForm() {
  const [form, setForm] = useState(initial);
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof initial, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/visitors", form);
    if (ok) setForm(initial);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Visitor name" htmlFor="name">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Address">
          <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
        <Field label="Invited by">
          <Input value={form.invitedBy} onChange={(e) => update("invitedBy", e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Add visitor
      </Button>
    </form>
  );
}
