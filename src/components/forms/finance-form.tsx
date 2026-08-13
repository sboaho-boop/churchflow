"use client";

import { useState } from "react";
import { Button, Field, Input, Select, ErrorText } from "@/components/ui";
import { useSubmit } from "./use-submit";

export function FinanceForm({
  categories,
  currency,
}: {
  categories: { id: string; name: string; type: string }[];
  currency: string;
}) {
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    type: "INCOME",
    method: "CASH",
    date: "",
    reference: "",
    notes: "",
  });
  const { submit, loading, error } = useSubmit();

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/finance", {
      ...form,
      amount: parseFloat(form.amount),
      date: form.date || undefined,
    });
    if (ok) {
      setForm((f) => ({ ...f, categoryId: "", amount: "", reference: "", notes: "" }));
    }
  }

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const pool = form.type === "INCOME" ? incomeCategories : expenseCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={form.type}
            onChange={(e) => {
              update("type", e.target.value);
              update("categoryId", "");
            }}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select
            id="categoryId"
            required
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Select...</option>
            {pool.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={`Amount (${currency})`} htmlFor="amount">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </Field>
        <Field label="Method">
          <Select value={form.method} onChange={(e) => update("method", e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="BANK">Bank transfer</option>
            <option value="CARD">Card</option>
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
        <Field label="Reference">
          <Input
            value={form.reference}
            onChange={(e) => update("reference", e.target.value)}
          />
        </Field>
      </div>

      <ErrorText>{error}</ErrorText>

      <Button type="submit" loading={loading}>
        Record transaction
      </Button>
    </form>
  );
}
