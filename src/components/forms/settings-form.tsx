"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

interface ChurchSettings {
  name: string;
  motto?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  currency?: string | null;
}

export function SettingsForm({ initial }: { initial: ChurchSettings }) {
  const [form, setForm] = useState<ChurchSettings>(initial);
  const { submit, loading, error } = useSubmit();

  function update(key: keyof ChurchSettings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit("/api/settings", {
      ...form,
      email: form.email || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Church name" htmlFor="name">
          <Input
            id="name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Motto">
          <Input value={form.motto ?? ""} onChange={(e) => update("motto", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Website">
          <Input value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} />
        </Field>
        <Field label="Currency (ISO code)">
          <Input
            value={form.currency ?? "GHS"}
            maxLength={3}
            onChange={(e) => update("currency", e.target.value.toUpperCase())}
          />
        </Field>
      </div>
      <Field label="Address">
        <Input value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Save settings
      </Button>
    </form>
  );
}
