"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { RoleBadge } from "@/components/StatusBadge";

type Member = {
  id: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: { id: string; name: string; email: string };
};

export function ProjectMembersTab({
  projectId,
  members,
  viewerRole,
  viewerUserId,
}: {
  projectId: string;
  members: Member[];
  viewerRole: "ADMIN" | "MEMBER";
  viewerUserId: string;
}) {
  const isAdmin = viewerRole === "ADMIN";
  return (
    <div className="space-y-4 max-w-3xl">
      {isAdmin && <InviteForm projectId={projectId} />}
      <Card>
        <ul className="divide-y divide-slate-200">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              projectId={projectId}
              member={m}
              isAdmin={isAdmin}
              isSelf={m.userId === viewerUserId}
            />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function InviteForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "VALIDATION_ERROR" && data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        } else {
          setError(data.error || "Failed to add member");
        }
        return;
      }
      setEmail("");
      setRole("MEMBER");
      setInfo("Member added.");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">
        Add member
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Add an existing user by their email address. They&apos;ll appear in the
        list right away.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Label htmlFor="invite-email" className="sr-only">
            Email
          </Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            invalid={!!fieldErrors.email}
          />
        </div>
        <div className="sm:w-36">
          <Label htmlFor="invite-role" className="sr-only">
            Role
          </Label>
          <Select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
            disabled={loading}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <Button type="submit" loading={loading}>
          Add
        </Button>
      </form>
      {fieldErrors.email && (
        <p className="mt-2 text-xs text-red-600">{fieldErrors.email[0]}</p>
      )}
      {error && (
        <div
          role="alert"
          className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}
      {info && (
        <p className="mt-3 text-sm text-green-700">{info}</p>
      )}
    </Card>
  );
}

function MemberRow({
  projectId,
  member,
  isAdmin,
  isSelf,
}: {
  projectId: string;
  member: Member;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(newRole: "ADMIN" | "MEMBER") {
    if (newRole === member.role) return;
    setError(null);
    setUpdating(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${member.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to change role");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    if (
      !confirm(
        isSelf
          ? "Leave this project? You'll lose access immediately."
          : `Remove ${member.user.name} from this project?`
      )
    )
      return;
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${member.userId}`,
        { method: "DELETE" }
      );
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to remove");
        return;
      }
      if (isSelf) {
        router.push("/projects");
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <li className="px-4 sm:px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {member.user.name}
            {isSelf && (
              <span className="ml-2 text-xs text-slate-500 font-normal">
                (you)
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
        </div>
        {isAdmin ? (
          <Select
            value={member.role}
            onChange={(e) =>
              changeRole(e.target.value as "ADMIN" | "MEMBER")
            }
            disabled={updating || removing}
            className="w-28"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
        ) : (
          <RoleBadge role={member.role} />
        )}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={remove}
            loading={removing}
            disabled={updating}
            className="text-red-600 hover:bg-red-50"
          >
            Remove
          </Button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
