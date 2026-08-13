"use client";

import { useState } from "react";
import { Button, Field, Input, Select, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function AttendanceForm({
  members,
  serviceTypes,
}: {
  members: MemberOption[];
  serviceTypes: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    memberId: "",
    serviceTypeId: "",
    type: "SUNDAY",
    date: "",
    method: "MANUAL",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit("/api/attendance", {
      ...form,
      memberId: form.memberId || null,
      serviceTypeId: form.serviceTypeId || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Member (optional)">
        <Select value={form.memberId} onChange={(e) => update("memberId", e.target.value)}>
          <option value="">Guest / walk-in</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Service type (optional)">
          <Select
            value={form.serviceTypeId}
            onChange={(e) => update("serviceTypeId", e.target.value)}
          >
            <option value="">General</option>
            {serviceTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Attendance type" htmlFor="type">
          <Select id="type" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="SUNDAY">Sunday service</option>
            <option value="MIDWEEK">Midweek</option>
            <option value="PRAYER_MEETING">Prayer meeting</option>
            <option value="BIBLE_STUDY">Bible study</option>
            <option value="YOUTH_MEETING">Youth meeting</option>
            <option value="CHOIR_PRACTICE">Choir practice</option>
            <option value="DEPARTMENT_MEETING">Department meeting</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Field>
        <Field label="Method">
          <Select value={form.method} onChange={(e) => update("method", e.target.value)}>
            <option value="MANUAL">Manual</option>
            <option value="QR_CODE">QR code</option>
            <option value="MOBILE_APP">Mobile app</option>
          </Select>
        </Field>
      </div>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Record attendance
      </Button>
    </form>
  );
}
