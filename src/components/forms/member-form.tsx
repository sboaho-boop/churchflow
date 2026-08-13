"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

const initialForm = {
  firstName: "",
  lastName: "",
  otherNames: "",
  gender: "MALE",
  dob: "",
  phone: "",
  email: "",
  address: "",
  occupation: "",
  maritalStatus: "SINGLE",
  bloodGroup: "",
  membershipClass: "NONE",
  dateJoined: "",
  previousChurch: "",
  status: "ACTIVE",
  notes: "",
};

export function MemberForm({
  initial,
  memberId,
  onDone,
}: {
  initial?: Record<string, unknown>;
  memberId?: string;
  onDone?: () => void;
}) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...initialForm };
    return {
      ...initialForm,
      ...initial,
      dob: initial.dob ? String(initial.dob).slice(0, 10) : "",
      dateJoined: initial.dateJoined ? String(initial.dateJoined).slice(0, 10) : "",
    };
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof initialForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit(
      memberId ? `/api/members/${memberId}` : "/api/members",
      form,
      memberId ? "PATCH" : "POST"
    );
    if (ok) onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Other names">
          <Input
            value={form.otherNames}
            onChange={(e) => update("otherNames", e.target.value)}
          />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select
            id="gender"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date of birth">
          <Input
            type="date"
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Occupation">
          <Input
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Address">
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </Field>
        <Field label="Marital status" htmlFor="maritalStatus">
          <Select
            id="maritalStatus"
            value={form.maritalStatus}
            onChange={(e) => update("maritalStatus", e.target.value)}
          >
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Blood group">
          <Select
            value={form.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
          >
            <option value="">Not set</option>
            <option value="A_POS">A+</option>
            <option value="A_NEG">A-</option>
            <option value="B_POS">B+</option>
            <option value="B_NEG">B-</option>
            <option value="AB_POS">AB+</option>
            <option value="AB_NEG">AB-</option>
            <option value="O_POS">O+</option>
            <option value="O_NEG">O-</option>
          </Select>
        </Field>
        <Field label="Membership class">
          <Select
            value={form.membershipClass}
            onChange={(e) => update("membershipClass", e.target.value)}
          >
            <option value="NONE">None</option>
            <option value="NEW_CONVERT">New convert</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="FULL_MEMBER">Full member</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date joined">
          <Input
            type="date"
            value={form.dateJoined}
            onChange={(e) => update("dateJoined", e.target.value)}
          />
        </Field>
        <Field label="Previous church">
          <Input
            value={form.previousChurch}
            onChange={(e) => update("previousChurch", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Status" htmlFor="status">
        <Select
          id="status"
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="ATTENDEE">Attendee</option>
          <option value="INACTIVE">Inactive</option>
          <option value="TRANSFERRED">Transferred</option>
          <option value="DECEASED">Deceased</option>
        </Select>
      </Field>
      <Field label="Notes">
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        {memberId ? "Save changes" : "Add member"}
      </Button>
    </form>
  );
}
