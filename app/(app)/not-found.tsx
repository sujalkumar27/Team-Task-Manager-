import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">Not found</h1>
      <p className="text-slate-600 mb-6">
        That page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard"
        className="text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
