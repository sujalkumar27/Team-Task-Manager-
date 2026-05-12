"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  PriorityBadge,
  StatusBadge,
  type TaskPriority,
  type TaskStatus,
} from "@/components/StatusBadge";
import {
  TaskFormModal,
  type ExistingTask,
  type TaskFormMember,
} from "@/components/TaskFormModal";
import { formatDueDate, isOverdue } from "@/lib/dates";

export type TaskCardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | Date | null;
  assigneeId: string | null;
  createdById: string;
  assignee: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string };
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TaskCard({
  task,
  projectId,
  members,
  viewerUserId,
  viewerRole,
}: {
  task: TaskCardTask;
  projectId: string;
  members: TaskFormMember[];
  viewerUserId: string;
  viewerRole: "ADMIN" | "MEMBER";
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = viewerRole === "ADMIN";
  const canEdit =
    isAdmin || task.assigneeId === viewerUserId || task.createdById === viewerUserId;
  const canDelete = isAdmin || task.createdById === viewerUserId;
  const overdue = isOverdue(task.dueDate, task.status);
  const dueLabel = formatDueDate(task.dueDate);

  async function onDelete() {
    if (!confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  const editTask: ExistingTask = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assigneeId: task.assigneeId,
  };

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-medium text-slate-900">{task.title}</h3>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description && (
              <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
              {dueLabel && (
                <span
                  className={
                    overdue ? "text-red-600 font-medium" : ""
                  }
                >
                  Due {dueLabel}
                  {overdue && " (overdue)"}
                </span>
              )}
              {task.assignee ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium">
                    {initials(task.assignee.name)}
                  </span>
                  {task.assignee.name}
                </span>
              ) : (
                <span className="italic">Unassigned</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:ml-3 self-end sm:self-start">
            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                loading={deleting}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </Card>
      {canEdit && editOpen && (
        <TaskFormModal
          onClose={() => setEditOpen(false)}
          projectId={projectId}
          members={members}
          task={editTask}
        />
      )}
    </>
  );
}
