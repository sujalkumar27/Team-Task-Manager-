"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  TaskFormModal,
  type TaskFormMember,
} from "@/components/TaskFormModal";

export type TaskFilter =
  | "all"
  | "todo"
  | "in_progress"
  | "done"
  | "overdue"
  | "mine";

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "overdue", label: "Overdue" },
  { id: "mine", label: "Assigned to me" },
];

export function TasksTabHeader({
  projectId,
  active,
  members,
}: {
  projectId: string;
  active: TaskFilter;
  members: TaskFormMember[];
}) {
  const [open, setOpen] = useState(false);
  function hrefFor(f: TaskFilter) {
    return f === "all"
      ? `/projects/${projectId}`
      : `/projects/${projectId}?filter=${f}`;
  }
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
        <Button onClick={() => setOpen(true)}>New task</Button>
      </div>
      <nav aria-label="Task filters" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const isActive = active === f.id;
          return (
            <Link
              key={f.id}
              href={hrefFor(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>
      {open && (
        <TaskFormModal
          onClose={() => setOpen(false)}
          projectId={projectId}
          members={members}
        />
      )}
    </div>
  );
}
