"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/adminApi";
import { Badge, Button, Empty, Modal, PageTitle, Panel, SecretModal, fmtDate, inputStyle, td, th } from "@/components/admin/ui";

type A = { id: string; name: string; email: string; role: "super" | "sub"; status: "active" | "disabled"; mustChangePassword: boolean; lastLoginAt: string | null; createdAt: string };

export default function AdminsClient() {
  const [admins, setAdmins] = useState<A[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<{ title: string; email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setAdmins((await adminFetch<{ admins: A[] }>("/admins")).admins);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0); // after mount, so state updates aren't synchronous in the effect
    return () => clearTimeout(t);
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await adminFetch<{ admin: A; password: string }>("/admins", { method: "POST", body: { name, email } });
      setCreating(false);
      setName("");
      setEmail("");
      setSecret({ title: "Sub-admin created", email: r.admin.email, password: r.password });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (a: A) => {
    const next = a.status === "active" ? "disabled" : "active";
    try {
      await adminFetch(`/admins/${a.id}`, { method: "PATCH", body: { status: next } });
      toast.success(next === "disabled" ? `${a.name} disabled and signed out` : `${a.name} enabled`);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const reset = async (a: A) => {
    if (!confirm(`Reset the password for ${a.email}? They'll be signed out and must choose a new one.`)) return;
    try {
      const r = await adminFetch<{ password: string; email: string }>(`/admins/${a.id}/reset-password`, { method: "POST", body: {} });
      setSecret({ title: "Password reset", email: r.email, password: r.password });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (a: A) => {
    if (!confirm(`Delete the sub-admin ${a.email}? This can't be undone.`)) return;
    try {
      await adminFetch(`/admins/${a.id}`, { method: "DELETE" });
      toast.success("Sub-admin deleted");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageTitle
        title="Admins"
        subtitle="Sub-admins can view analytics, users and cards — nothing else."
        action={<Button variant="primary" onClick={() => setCreating(true)}>Add sub-admin</Button>}
      />

      <Panel style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr><th style={th}>Admin</th><th style={th}>Role</th><th style={th}>Status</th><th style={th}>Last sign-in</th><th style={th}>Actions</th></tr></thead>
          <tbody>
            {(admins ?? []).map((a) => (
              <tr key={a.id}>
                <td style={td}><div style={{ fontWeight: 700 }}>{a.name}</div><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{a.email}</div></td>
                <td style={td}><Badge tone={a.role === "super" ? "accent" : "neutral"}>{a.role === "super" ? "super admin" : "sub-admin"}</Badge></td>
                <td style={td}>
                  <Badge tone={a.status === "active" ? "good" : "bad"}>{a.status}</Badge>{" "}
                  {a.mustChangePassword && <Badge tone="warn">temp password</Badge>}
                </td>
                <td style={td}>{fmtDate(a.lastLoginAt)}</td>
                <td style={td}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.role === "sub" ? (
                    <>
                      <Button small onClick={() => setStatus(a)}>{a.status === "active" ? "Disable" : "Enable"}</Button>
                      <Button small onClick={() => reset(a)}>Reset password</Button>
                      <Button small variant="danger" onClick={() => remove(a)}>Delete</Button>
                    </>
                  ) : <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins === null && <Empty>Loading…</Empty>}
      </Panel>

      {creating && (
        <Modal title="Add sub-admin" onClose={() => setCreating(false)}>
          <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
            <input style={inputStyle} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              A one-time temporary password is generated. They must choose their own at first sign-in.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {secret && <SecretModal {...secret} onClose={() => setSecret(null)} />}
    </>
  );
}
