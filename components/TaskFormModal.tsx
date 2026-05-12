"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { dateInputToIso, toIsoDateInputValue } from "@/lib/dates";

export type TaskFormMember = {
  userId: string;
  user: { id: string; name: string };
};

type TaskFields = {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  assigneeId: string;
};

const emptyFields: TaskFields = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assigneeId: "",
};

export type ExistingTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | Date | null;
  assigneeId: string | null;
};

function fieldsFromTask(task: ExistingTask | undefined): TaskFields {
  if (!task) return emptyFields;
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: toIsoDateInputValue(task.dueDate),
    assigneeId: task.assigneeId ?? "",
  };
}

export function TaskFormModal({
  onClose,
  projectId,
  members,
  task,
}: {
  onClose: () => void;
  projectId: string;
  members: TaskFormMember[];
  task?: ExistingTask;
}) {
  const router = useRouter();
  const isEdit = Boolean(task);
  const [fields, setFields] = useState<TaskFields>(() => fieldsFromTask(task));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update<K extends keyof TaskFields>(key: K, value: TaskFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: fields.title,
        description: fields.description || null,
        status: fields.status,
        priority: fields.priority,
        dueDate: dateInputToIso(fields.dueDate),
        assigneeId: fields.assigneeId || null,
      };

      const url = isEdit
        ? `/api/tasks/${task!.id}`
        : `/api/projects/${projectId}/tasks`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "VALIDATION_ERROR" && data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        } else {
          setError(data.error || "Failed to save task");
        }
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => !loading && onClose()}
      title={isEdit ? "Edit task" : "New task"}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={fields.title}
            onChange={(e) => update("title", e.target.value)}
            required
            maxLength={200}
            disabled={loading}
            invalid={!!fieldErrors.title}
            autoFocus
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            maxLength={2000}
            disabled={loading}
            invalid={!!fieldErrors.description}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.description[0]}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="task-status">Status</Label>
            <Select
              id="task-status"
              value={fields.status}
              onChange={(e) =>
                update("status", e.target.value as TaskFields["status"])
              }
              disabled={loading}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <Select
              id="task-priority"
              value={fields.priority}
              onChange={(e) =>
                update("priority", e.target.value as TaskFields["priority"])
              }
              disabled={loading}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={fields.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              disabled={loading}
              invalid={!!fieldErrors.dueDate}
            />
            {fieldErrors.dueDate && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.dueDate[0]}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="task-assignee">Assignee</Label>
            <Select
              id="task-assignee"
              value={fields.assigneeId}
              onChange={(e) => update("assigneeId", e.target.value)}
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          >
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
