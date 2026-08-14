"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbIssue =
    /database|prisma|postgres|connection refused|ECONNREFUSED|P1001|P1000/i.test(
      error.message
    );

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl">
        <span className="text-amber-600">!</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-900">
        {isDbIssue ? "Database not connected yet" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {isDbIssue
          ? "This page needs a database. Add the DATABASE_URL environment variable in Vercel (Settings → Environment Variables) and redeploy — or set up your local PostgreSQL."
          : "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Try again
      </button>
    </div>
  );
}
