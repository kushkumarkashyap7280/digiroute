"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/adminApi";
import { Badge, Button, Empty, Modal, PageTitle, Panel, fmtDay, inputStyle, td, th } from "@/components/admin/ui";

type C = {
  id: string; title: string; digipin: string; category: string; sharingEnabled: boolean; expired: boolean;
  viewCount: number; photos: number; createdAt: string; owner: { id: string; name: string; email: string } | null;
};
type Page = { cards: C[]; nextCursor: string | null; total?: number };
type Detail = {
  id: string; title: string; digipin: string; humanAddress: string; category: string; deliveryNote: string;
  contactPhone: string; photoUrls: string[]; sharingEnabled: boolean; owner: { name: string; email: string } | null;
};

export default function CardsClient({ isSuper }: { isSuper: boolean }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sharing, setSharing] = useState("");
  const [rows, setRows] = useState<C[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [removing, setRemoving] = useState<C | null>(null);
  const [reason, setReason] = useState("");
  const reqId = useRef(0);

  const load = useCallback(async (reset: boolean, from?: string | null) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      if (sharing) params.set("sharing", sharing);
      if (!reset && from) params.set("cursor", from);
      const page = await adminFetch<Page>(`/cards?${params}`);
      if (id !== reqId.current) return;
      setRows((r) => (reset ? page.cards : [...r, ...page.cards]));
      setCursor(page.nextCursor);
      if (reset) setTotal(page.total);
    } catch (e) {
      if (id === reqId.current) toast.error((e as Error).message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [q, category, sharing]);

  useEffect(() => {
    const t = setTimeout(() => load(true), 300);
    return () => clearTimeout(t);
  }, [load]);

  const view = async (c: C) => {
    try {
      setDetail((await adminFetch<{ card: Detail }>(`/cards/${c.id}`)).card);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async () => {
    if (!removing) return;
    try {
      await adminFetch(`/cards/${removing.id}`, { method: "DELETE", body: { reason } });
      toast.success("Card and its photos removed");
      setRemoving(null);
      setReason("");
      load(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <PageTitle
        title="Cards"
        subtitle={`${total != null ? `${total} ${q || category || sharing ? "matching" : "total"} · ` : ""}${isSuper ? "opening a card's contents is recorded in the audit log" : "metadata only — photos, notes and phone numbers are hidden"}`}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input style={{ ...inputStyle, maxWidth: 300 }} placeholder={isSuper ? "Search title or DIGIPIN" : "Search title"} value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ ...inputStyle, width: "auto" }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {["home", "work", "shop", "family", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...inputStyle, width: "auto" }} value={sharing} onChange={(e) => setSharing(e.target.value)} aria-label="Sharing">
          <option value="">Any sharing</option>
          <option value="on">Link on</option>
          <option value="off">Private</option>
        </select>
      </div>

      <Panel style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={th}>Card</th><th style={th}>Owner</th><th style={th}>Sharing</th>
              <th style={th}>Views</th><th style={th}>Photos</th><th style={th}>Created</th>{isSuper && <th style={th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{c.digipin}{c.category ? ` · ${c.category}` : ""}</div>
                </td>
                <td style={td}>{c.owner ? <><div>{c.owner.name}</div><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{c.owner.email}</div></> : "—"}</td>
                <td style={td}><Badge tone={!c.sharingEnabled ? "neutral" : c.expired ? "warn" : "good"}>{!c.sharingEnabled ? "private" : c.expired ? "expired" : "link on"}</Badge></td>
                <td style={td}>{c.viewCount}</td>
                <td style={td}>{c.photos}</td>
                <td style={td}>{fmtDay(c.createdAt)}</td>
                {isSuper && (
                  <td style={td}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Button small onClick={() => view(c)}>View</Button>
                    <Button small variant="danger" onClick={() => { setRemoving(c); setReason(""); }}>Remove</Button>
                  </div></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <Empty>No cards found.</Empty>}
        {loading && <Empty>Loading…</Empty>}
      </Panel>

      {cursor && !loading && <div style={{ textAlign: "center", marginTop: 14 }}><Button onClick={() => load(false, cursor)}>Load more</Button></div>}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} width={560}>
          <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--muted)" }}>This view has been recorded in the audit log.</p>
          {detail.photoUrls.length > 0 && (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: detail.photoUrls.length > 1 ? "1fr 1fr" : "1fr", marginBottom: 14 }}>
              {detail.photoUrls.map((u) => (
                <div key={u} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", background: "var(--surface2)" }}>
                  <Image src={u} alt="Card photo" fill unoptimized sizes="260px" style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
          <dl style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px 12px", margin: 0, fontSize: 14 }}>
            <dt style={{ color: "var(--muted)" }}>Owner</dt><dd style={{ margin: 0 }}>{detail.owner ? `${detail.owner.name} (${detail.owner.email})` : "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>DIGIPIN</dt><dd style={{ margin: 0, fontFamily: "monospace" }}>{detail.digipin}</dd>
            <dt style={{ color: "var(--muted)" }}>Address</dt><dd style={{ margin: 0 }}>{detail.humanAddress || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Category</dt><dd style={{ margin: 0 }}>{detail.category || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Note</dt><dd style={{ margin: 0 }}>{detail.deliveryNote || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Phone</dt><dd style={{ margin: 0 }}>{detail.contactPhone || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Link</dt><dd style={{ margin: 0 }}>{detail.sharingEnabled ? "on" : "private"}</dd>
          </dl>
        </Modal>
      )}

      {removing && (
        <Modal title="Remove card" onClose={() => setRemoving(null)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>
            Removes <b>{removing.title}</b> and its photos permanently. The reason is saved in the audit log.
          </p>
          <input style={inputStyle} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. abusive content)" autoFocus maxLength={200} />
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setRemoving(null)}>Cancel</Button>
            <Button variant="danger" disabled={reason.trim().length < 3} onClick={remove}>Remove card</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
