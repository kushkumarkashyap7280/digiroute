"use client";

import { useState } from "react";
import { Button, Panel, inputStyle } from "@/components/admin/ui";

type Db = { host: string; name: string; local: boolean };

export default function SetupAdminForm({ database }: { database: Db }) {
  const [reset, setReset] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "", again: "" });
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
      if (res.status === 404) throw new Error("Setup isn't available here. Run the site locally with `npm run dev` and open it on localhost.");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setDone(data.email);
      setF({ ...f, password: "", again: "" });
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
        {!database.local && !done && (
          <div role="note" style={{ margin: "0 0 14px", padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", fontSize: 13.5 }}>
            This will write to a <b>remote</b> database. Check the name above is the one you mean.
          </div>
        )}

        {done ? (
          <div role="status" style={{ lineHeight: 1.6 }}>
            ✅ Done for <b>{done}</b>. Sign in on the website with <b>Ctrl + Shift + K</b>.
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              Now put your normal <code>MONGODB_URI</code> back in <code>.env.local</code> and restart the dev server. A second super admin can&apos;t be created anyway, and this page doesn&apos;t exist on the live site.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 11 }} autoComplete="off">
            {!reset && (
              <>
                <input style={inputStyle} placeholder="Your name" value={f.name} onChange={set("name")} required />
                <input style={inputStyle} type="email" placeholder="Your email (used to sign in)" value={f.email} onChange={set("email")} required />
              </>
            )}
            <input style={inputStyle} type="password" placeholder="Password (12+ chars, letters and numbers)" value={f.password} onChange={set("password")} required minLength={12} autoComplete="new-password" />
            <input style={inputStyle} type="password" placeholder="Repeat password" value={f.again} onChange={set("again")} required autoComplete="new-password" />
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
