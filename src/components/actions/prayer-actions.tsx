"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PrayerActions({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: string) {
    setLoading(true);
    const res = await fetch(`/api/prayer-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <select
      value={current}
      disabled={loading}
      onChange={(e) => updateStatus(e.target.value)}
      className="block rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
    >
      <option value="PENDING">Pending</option>
      <option value="IN_PROGRESS">In progress</option>
      <option value="ANSWERED">Answered</option>
    </select>
  );
}
