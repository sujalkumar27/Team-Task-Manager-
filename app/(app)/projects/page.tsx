import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsHeader } from "@/components/ProjectsHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    orderBy: { project: { updatedAt: "desc" } },
    select: {
      role: true,
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });

  const projects = memberships.map((m) => ({
    id: m.project.id,
    name: m.project.name,
    description: m.project.description,
    role: m.role,
    taskCount: m.project._count.tasks,
    memberCount: m.project._count.members,
  }));

  return (
    <div>
      <ProjectsHeader />
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks for your team."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
