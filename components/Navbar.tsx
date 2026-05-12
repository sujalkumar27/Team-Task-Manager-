"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function navLinkClass(href: string) {
    const isActive =
      href === "/dashboard"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);
    return `px-3 py-1.5 text-sm rounded-md transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            <Link
              href="/dashboard"
              className="font-semibold text-slate-900 text-base whitespace-nowrap"
            >
              Team Tasks
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/projects" className={navLinkClass("/projects")}>
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span
              className="hidden sm:inline text-sm text-slate-600 truncate max-w-[160px]"
              title={user.email}
            >
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "..." : "Log out"}
            </button>
          </div>
        </div>
        <div className="sm:hidden flex items-center gap-1 pb-2 -mt-1">
          <Link href="/dashboard" className={navLinkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/projects" className={navLinkClass("/projects")}>
            Projects
          </Link>
        </div>
      </div>
    </nav>
  );
}
