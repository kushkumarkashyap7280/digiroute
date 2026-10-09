"use client";

import { useState } from "react";
import { Button, Panel, inputStyle } from "@/components/admin/ui";

type Db = { host: string; name: string; local: boolean };

export default function SetupAdminForm({ database }: { database: Db }) {
  const [reset, setReset] = useState(false);
  const [f, setF] = useState({ token: "", name: "", email: "", password: "", again: "", confirmDatabase: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (f.password !== f.again) return setError("The passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch("/api/dev/bootstrap-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, reset }),
      });
      if (res.status === 404 && !(await res.clone().text())) throw new Error("Wrong setup token.");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setDone(data.email);
      setF({ ...f, password: "", again: "", token: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: "0 16px" }}>
      <Panel>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.4rem" }}>{reset ? "Reset super-admin password" : "Create the super admin"}</h1>
        <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--text-secondary)" }}>
          Local setup page. Database:{" "}
          <b style={{ color: database.local ? "var(--text)" : "#dc2626" }}>
            {database.name} on {database.host} {database.local ? "(local)" : "(REMOTE)"}
          </b>
        </p>

        {done ? (
          <div role="status" style={{ lineHeight: 1.6 }}>
            ✅ Done for <b>{done}</b>. Sign in on the website with <b>Ctrl + Shift + K</b>.
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              Now lock this up: delete <code>SUPER_ADMIN_BOOTSTRAP_TOKEN</code> from <code>.env.local</code> and put your normal
              <code> MONGODB_URI</code> back. This page and route can no longer be used.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 11 }} autoComplete="off">
            <input style={inputStyle} type="password" placeholder="Setup token (SUPER_ADMIN_BOOTSTRAP_TOKEN)" value={f.token} onChange={set("token")} required autoComplete="off" />
            {!reset && (
              <>
                <input style={inputStyle} placeholder="Your name" value={f.name} onChange={set("name")} required />
                <input style={inputStyle} type="email" placeholder="Your email (used to sign in)" value={f.email} onChange={set("email")} required />
              </>
            )}
            <input style={inputStyle} type="password" placeholder="Password (12+ chars, letters and numbers)" value={f.password} onChange={set("password")} required minLength={12} autoComplete="new-password" />
            <input style={inputStyle} type="password" placeholder="Repeat password" value={f.again} onChange={set("again")} required autoComplete="new-password" />
            {!database.local && (
              <input style={inputStyle} placeholder={`Type the database name to confirm: ${database.name}`} value={f.confirmDatabase} onChange={set("confirmDatabase")} required />
            )}
            {error && <div role="alert" style={{ color: "#dc2626", fontSize: 13.5 }}>{error}</div>}
            <Button type="submit" variant="primary" disabled={busy}>{busy ? "Working…" : reset ? "Reset password" : "Create super admin"}</Button>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} /> I forgot my password — reset the existing super admin
            </label>
          </form>
        )}
      </Panel>
    </main>
  );
}
