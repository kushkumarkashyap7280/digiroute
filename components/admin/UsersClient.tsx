"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminApiError, adminFetch } from "@/components/admin/adminApi";
import { Badge, Button, Empty, Modal, PageTitle, Panel, SecretModal, fmtDate, fmtDay, inputStyle, td, th } from "@/components/admin/ui";

type U = { id: string; name: string; email: string; status: "active" | "suspended"; createdAt: string; lastLoginAt: string | null; cardCount: number };
type Page = { users: U[]; nextCursor: string | null; hasMore: boolean; total?: number };

export default function UsersClient({ isSuper }: { isSuper: boolean }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<U[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null);
  const [del, setDel] = useState<U | null>(null);
  const [typed, setTyped] = useState("");
  const reqId = useRef(0);

  const load = useCallback(async (reset: boolean, from?: string | null) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (!reset && from) params.set("cursor", from);
      const page = await adminFetch<Page>(`/users?${params}`);
      if (id !== reqId.current) return;
      setRows((r) => (reset ? page.users : [...r, ...page.users]));
      setCursor(page.nextCursor);
      if (reset) setTotal(page.total);
    } catch (e) {
      if (id === reqId.current) toast.error((e as Error).message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [q, status]);

  // Search runs on the server (all pages) after a short pause in typing.
  useEffect(() => {
    const t = setTimeout(() => load(true), 300);
    return () => clearTimeout(t);
  }, [load]);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      load(true);
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Failed.");
    }
  };

  const toggle = (u: U) =>
    act(() => adminFetch(`/users/${u.id}`, { method: "PATCH", body: { status: u.status === "active" ? "suspended" : "active" } }),
      u.status === "active" ? `${u.email} suspended and signed out` : `${u.email} reactivated`);

  const reset = async (u: U) => {
    if (!confirm(`Reset the password for ${u.email}? They will be signed out everywhere.`)) return;
    try {
      const r = await adminFetch<{ password: string; email: string }>(`/users/${u.id}/reset-password`, { method: "POST", body: {} });
      setSecret({ email: r.email, password: r.password });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async () => {
    if (!del) return;
    await act(() => adminFetch(`/users/${del.id}`, { method: "DELETE", body: { confirmEmail: typed } }), "User and all their data deleted");
    setDel(null);
    setTyped("");
  };

  return (
    <>
      <PageTitle title="Users" subtitle={total != null ? `${total} ${q || status ? "matching" : "total"}` : undefined} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input style={{ ...inputStyle, maxWidth: 340 }} placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputStyle, width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Panel style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th}>User</th><th style={th}>Cards</th><th style={th}>Status</th>
              <th style={th}>Joined</th><th style={th}>Last sign-in</th>{isSuper && <th style={th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td style={td}><div style={{ fontWeight: 700 }}>{u.name}</div><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{u.email}</div></td>
                <td style={td}>{u.cardCount}</td>
                <td style={td}><Badge tone={u.status === "active" ? "good" : "bad"}>{u.status}</Badge></td>
                <td style={td}>{fmtDay(u.createdAt)}</td>
                <td style={td}>{fmtDate(u.lastLoginAt)}</td>
                {isSuper && (
                  <td style={td}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Button small onClick={() => toggle(u)}>{u.status === "active" ? "Suspend" : "Reactivate"}</Button>
                    <Button small onClick={() => reset(u)}>Reset password</Button>
                    <Button small variant="danger" onClick={() => { setDel(u); setTyped(""); }}>Delete</Button>
                  </div></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <Empty>No users found.</Empty>}
        {loading && <Empty>Loading…</Empty>}
      </Panel>

      {cursor && !loading && (
        <div style={{ textAlign: "center", marginTop: 14 }}><Button onClick={() => load(false, cursor)}>Load more</Button></div>
      )}

      {secret && <SecretModal title="Password reset" email={secret.email} password={secret.password} onClose={() => setSecret(null)} />}

      {del && (
        <Modal title="Delete user" onClose={() => setDel(null)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>
            This permanently deletes <b>{del.email}</b>, their <b>{del.cardCount}</b> card(s), every photo and their avatar. It can&apos;t be undone.
            Type the email to confirm.
          </p>
          <input style={inputStyle} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={del.email} autoFocus />
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setDel(null)}>Cancel</Button>
            <Button variant="danger" disabled={typed.trim().toLowerCase() !== del.email} onClick={remove}>Delete forever</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
