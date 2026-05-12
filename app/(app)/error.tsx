"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-600 mb-6">
        We hit a snag loading this page. Try again, or head back to the
        dashboard.
      </p>
      <div className="flex gap-3 justify-center items-center">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
