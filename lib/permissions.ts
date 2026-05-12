import { prisma } from "@/lib/db";
import { Forbidden, NotFound, Unauthorized } from "@/lib/api-helpers";
import { getCurrentUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw Unauthorized();
  return user;
}

export async function requireMember(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) throw NotFound("Project not found");
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  if (!membership) throw NotFound("Project not found");
  return membership;
}

export async function requireAdmin(projectId: string, userId: string) {
  const membership = await requireMember(projectId, userId);
  if (membership.role !== "ADMIN") throw Forbidden("Admin access required");
  return membership;
}

export async function loadTaskWithAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      assigneeId: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!task) throw NotFound("Task not found");
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
    select: { role: true },
  });
  if (!membership) throw NotFound("Task not found");
  const isAdmin = membership.role === "ADMIN";
  const canEdit =
    isAdmin || task.assigneeId === userId || task.createdById === userId;
  const canDelete = isAdmin || task.createdById === userId;
  return { task, role: membership.role, canEdit, canDelete };
}
