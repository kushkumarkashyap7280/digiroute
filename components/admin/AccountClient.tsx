"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/adminApi";
import { Button, PageTitle, Panel, inputStyle } from "@/components/admin/ui";

export default function AccountClient({ name, email, role, mustChange }: { name: string; email: string; role: string; mustChange: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== again) return setError("The new passwords don't match.");
    setBusy(true);
    try {
      await adminFetch("/auth/password", { method: "POST", body: { currentPassword: current, newPassword: next } });
      toast.success("Password changed. Other sessions were signed out.");
      setCurrent(""); setNext(""); setAgain("");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="My account" subtitle={`${name} · ${email} · ${role === "super" ? "Super admin" : "Sub-admin"}`} />
      <Panel style={{ maxWidth: 460 }}>
        <h3 style={{ margin: "0 0 12px" }}>{mustChange ? "Choose your own password" : "Change password"}</h3>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }} autoComplete="off">
          <input style={inputStyle} type="password" placeholder={mustChange ? "Temporary password" : "Current password"} value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="off" />
          <input style={inputStyle} type="password" placeholder="New password (12+ chars, letters and numbers)" value={next} onChange={(e) => setNext(e.target.value)} required minLength={12} autoComplete="new-password" />
          <input style={inputStyle} type="password" placeholder="Repeat new password" value={again} onChange={(e) => setAgain(e.target.value)} required autoComplete="new-password" />
          {error && <div role="alert" style={{ color: "#dc2626", fontSize: 13.5 }}>{error}</div>}
          <Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
        </form>
      </Panel>
    </>
  );
}
