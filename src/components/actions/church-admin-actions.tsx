"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function ChurchAdminActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(patch: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/churches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        disabled={loading}
        onChange={(e) => e.target.value && update({ status: e.target.value })}
        defaultValue=""
        className="block rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        <option value="">Status...</option>
        <option value="PENDING">Set pending</option>
        <option value="ACTIVE">Activate</option>
        <option value="TRIAL">Set trial</option>
        <option value="SUSPENDED">Suspend</option>
      </select>
      <select
        disabled={loading}
        onChange={(e) => e.target.value && update({ plan: e.target.value })}
        defaultValue=""
        className="block rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        <option value="">Plan...</option>
        <option value="FREE">Free</option>
        <option value="BASIC">Basic</option>
        <option value="STANDARD">Standard</option>
        <option value="PREMIUM">Premium</option>
      </select>
      <Button size="sm" variant="outline" loading={loading} onClick={() => router.push(`/admin/churches/${id}`)}>
        View
      </Button>
    </div>
  );
}
