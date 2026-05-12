import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "@/components/StatusBadge";

export function ProjectCard({
  project,
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    role: "ADMIN" | "MEMBER";
    taskCount: number;
    memberCount: number;
  };
}) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="p-5 h-full group-hover:border-slate-300 group-hover:shadow transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">
            {project.name}
          </h3>
          <RoleBadge role={project.role} />
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {project.description || (
            <span className="italic text-slate-400">No description</span>
          )}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
          <span>
            {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {project.memberCount}{" "}
            {project.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </Card>
    </Link>
  );
}
