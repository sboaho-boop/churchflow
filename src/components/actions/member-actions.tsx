"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function MemberActions({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onDeleted?.();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/members/${id}/edit`)}
      >
        Edit
      </Button>
      <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
