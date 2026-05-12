import { Badge, type BadgeVariant } from "@/components/ui/Badge";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: BadgeVariant }
> = {
  TODO: { label: "To Do", variant: "slate" },
  IN_PROGRESS: { label: "In Progress", variant: "blue" },
  DONE: { label: "Done", variant: "green" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const c = statusConfig[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: BadgeVariant }
> = {
  LOW: { label: "Low", variant: "slate" },
  MEDIUM: { label: "Medium", variant: "amber" },
  HIGH: { label: "High", variant: "red" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = priorityConfig[priority];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export function RoleBadge({ role }: { role: "ADMIN" | "MEMBER" }) {
  return (
    <Badge variant={role === "ADMIN" ? "indigo" : "slate"}>
      {role === "ADMIN" ? "Admin" : "Member"}
    </Badge>
  );
}
