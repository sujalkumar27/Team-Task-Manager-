"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function ProjectSettingsTab({
  project,
}: {
  project: { id: string; name: string; description: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const dirty =
    name.trim() !== project.name ||
    (description.trim() || null) !== (project.description ?? null);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "VALIDATION_ERROR" && data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        } else {
          setSaveError(data.error || "Failed to save");
        }
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete");
        return;
      }
      router.push("/projects");
      router.refresh();
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Project details
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Update your project&apos;s name and description.
        </p>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              disabled={saving}
              invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="settings-description">Description</Label>
            <Textarea
              id="settings-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={saving}
              invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
          {saveError && (
            <div
              role="alert"
              className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              {saveError}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving} disabled={!dirty}>
              Save changes
            </Button>
            {savedAt && !saving && (
              <span className="text-xs text-slate-500">Saved</span>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5 sm:p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-700 mb-1">Danger zone</h2>
        <p className="text-sm text-slate-600 mb-4">
          Deleting a project permanently removes all of its tasks and members.
          This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete project
        </Button>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (deleting) return;
          setConfirmOpen(false);
          setConfirmText("");
          setDeleteError(null);
        }}
        title="Delete project?"
      >
        <p className="text-sm text-slate-600 mb-3">
          This will permanently delete{" "}
          <span className="font-medium text-slate-900">{project.name}</span> and
          all of its tasks. Type the project name to confirm.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={project.name}
          disabled={deleting}
        />
        {deleteError && (
          <div
            role="alert"
            className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          >
            {deleteError}
          </div>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setConfirmOpen(false);
              setConfirmText("");
              setDeleteError(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            disabled={confirmText !== project.name}
            loading={deleting}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
