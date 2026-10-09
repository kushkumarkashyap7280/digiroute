"use client";

/**
 * Hidden admin sign-in. There is deliberately no link, button or hint to it
 * anywhere in the UI: press Ctrl + Shift + K and this modal opens.
 *
 * The shortcut is only a convenience — it is NOT the security. The protection is
 * the server: separate admin accounts, strong passwords, rate limiting, lockout,
 * and a session cookie nobody can forge.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AdminApiError, adminFetch } from "@/components/admin/adminApi";
import { Button, Modal, inputStyle } from "@/components/admin/ui";

type Me = { name: string; email: string; role: string; mustChangePassword: boolean };

export default function AdminLoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPassword("");
    setError(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.code === "KeyK") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When opened, see whether this browser already has an admin session.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/admin/auth/me", { headers: { "x-admin-request": "1" }, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && setMe(d?.admin ?? null))
      .catch(() => !cancelled && setMe(null));
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch<{ admin: Me }>("/auth/login", { method: "POST", body: { email, password } });
      close();
      router.push(res.admin.mustChangePassword ? "/admin/account" : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not sign in.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await adminFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
  }

  if (!open) return null;

  return (
    <Modal title="Admin" onClose={close} width={400}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, color: "var(--text-secondary)", fontSize: 14 }}>
        <ShieldCheck size={20} style={{ color: "var(--orange)" }} />
        {me ? `Signed in as ${me.name}` : "Restricted area. Sign in to continue."}
      </div>

      {me ? (
        <div style={{ display: "grid", gap: 10 }}>
          <Button variant="primary" onClick={() => { close(); router.push(me.mustChangePassword ? "/admin/account" : "/admin"); }}>
            Open dashboard
          </Button>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }} autoComplete="off">
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
            autoComplete="off"
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
          {error && <div role="alert" style={{ color: "#dc2626", fontSize: 13.5 }}>{error}</div>}
          <Button type="submit" variant="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      )}
    </Modal>
  );
}
