"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/adminApi";
import { Badge, Button, Empty, PageTitle, Panel, fmtDate, inputStyle, td, th } from "@/components/admin/ui";

type E = { id: string; at: string; admin: string; action: string; targetType: string | null; targetId: string | null; meta: Record<string, unknown> | null; ip: string | null };
const tone = (a: string) => (a.includes("failed") || a.includes("locked") || a.includes("blocked") || a.includes("delete") || a.includes("suspend") ? "bad" : a.startsWith("login") ? "good" : "neutral") as "bad" | "good" | "neutral";

export default function AuditClient() {
  const [entries, setEntries] = useState<E[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (reset: boolean, from?: string | null) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: "30" });
      if (action) p.set("action", action);
      if (!reset && from) p.set("cursor", from);
      const page = await adminFetch<{ entries: E[]; nextCursor: string | null }>(`/audit?${p}`);
      setEntries((e) => (reset ? page.entries : [...e, ...page.entries]));
      setCursor(page.nextCursor);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [action]);
  useEffect(() => {
    const t = setTimeout(() => load(true), 0);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <PageTitle title="Audit log" subtitle="Every sign-in and every change made by an admin. Append-only." />
      <select style={{ ...inputStyle, width: "auto", marginBottom: 14 }} value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter">
        <option value="">All activity</option>
        {["login", "password", "user", "card", "admin", "super"].map((a) => <option key={a} value={a}>{a}…</option>)}
      </select>
      <Panel style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead><tr><th style={th}>When</th><th style={th}>Admin</th><th style={th}>Action</th><th style={th}>Details</th><th style={th}>IP</th></tr></thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={td}>{fmtDate(e.at)}</td>
                <td style={td}>{e.admin}</td>
                <td style={td}><Badge tone={tone(e.action)}>{e.action}</Badge></td>
                <td style={{ ...td, fontSize: 12.5, color: "var(--text-secondary)", maxWidth: 320, wordBreak: "break-word" }}>
                  {e.targetType && <b>{e.targetType} </b>}
                  {e.meta ? JSON.stringify(e.meta) : ""}
                </td>
                <td style={{ ...td, fontFamily: "monospace", fontSize: 12.5 }}>{e.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && entries.length === 0 && <Empty>Nothing recorded yet.</Empty>}
        {loading && <Empty>Loading…</Empty>}
      </Panel>
      {cursor && !loading && <div style={{ textAlign: "center", marginTop: 14 }}><Button onClick={() => load(false, cursor)}>Load more</Button></div>}
    </>
  );
}
