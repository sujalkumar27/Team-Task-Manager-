import Link from "next/link";

const TABS = [
  { id: "tasks", label: "Tasks", adminOnly: false },
  { id: "members", label: "Members", adminOnly: false },
  { id: "settings", label: "Settings", adminOnly: true },
] as const;

export function ProjectTabsNav({
  projectId,
  active,
  role,
}: {
  projectId: string;
  active: "tasks" | "members" | "settings";
  role: "ADMIN" | "MEMBER";
}) {
  const visibleTabs = TABS.filter((t) => !t.adminOnly || role === "ADMIN");
  return (
    <nav className="border-b border-slate-200 mb-6 overflow-x-auto">
      <ul className="flex gap-1 min-w-max">
        {visibleTabs.map((t) => {
          const isActive = active === t.id;
          const href =
            t.id === "tasks"
              ? `/projects/${projectId}`
              : `/projects/${projectId}?tab=${t.id}`;
          return (
            <li key={t.id}>
              <Link
                href={href}
                className={`inline-block px-3 sm:px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
