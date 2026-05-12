import { EmptyState } from "@/components/ui/EmptyState";
import { TaskCard, type TaskCardTask } from "@/components/TaskCard";
import {
  TasksTabHeader,
  type TaskFilter,
} from "@/components/TasksTabHeader";
import type { TaskFormMember } from "@/components/TaskFormModal";

export function ProjectTasksTab({
  projectId,
  tasks,
  members,
  viewerUserId,
  viewerRole,
  activeFilter,
}: {
  projectId: string;
  tasks: TaskCardTask[];
  members: TaskFormMember[];
  viewerUserId: string;
  viewerRole: "ADMIN" | "MEMBER";
  activeFilter: TaskFilter;
}) {
  return (
    <div>
      <TasksTabHeader
        projectId={projectId}
        active={activeFilter}
        members={members}
      />
      {tasks.length === 0 ? (
        <EmptyState
          title={
            activeFilter === "all"
              ? "No tasks yet"
              : "No tasks match this filter"
          }
          description={
            activeFilter === "all"
              ? "Create your first task to get started."
              : "Try a different filter, or create a new task."
          }
        />
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={t.id}>
              <TaskCard
                task={t}
                projectId={projectId}
                members={members}
                viewerUserId={viewerUserId}
                viewerRole={viewerRole}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
