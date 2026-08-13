"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserActions({
  id,
  self,
  active,
}: {
  id: string;
  self: boolean;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  if (self) {
    return <span className="text-xs text-slate-400">You</span>;
  }

  return (
    <button
      onClick={toggleActive}
      disabled={loading}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {active ? "Deactivate" : "Reactivate"}
    </button>
  );
}
