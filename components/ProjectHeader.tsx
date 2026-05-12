import { RoleBadge } from "@/components/StatusBadge";

export function ProjectHeader({
  project,
  role,
}: {
  project: { name: string; description: string | null };
  role: "ADMIN" | "MEMBER";
}) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-slate-900">
          {project.name}
        </h1>
        <RoleBadge role={role} />
      </div>
      {project.description && (
        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
          {project.description}
        </p>
      )}
    </div>
  );
}
