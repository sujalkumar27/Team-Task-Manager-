"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { NewProjectModal } from "@/components/NewProjectModal";

export function ProjectsHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between mb-6 gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Workspaces you own or belong to.
        </p>
      </div>
      <Button onClick={() => setOpen(true)}>New project</Button>
      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
