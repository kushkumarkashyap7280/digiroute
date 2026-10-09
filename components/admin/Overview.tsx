"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";
import { BarChart, Empty, PageTitle, Panel, Stat, fmtBytes, fmtDate } from "@/components/admin/ui";

type Stats = {
  users: { total: number; suspended: number; new7d: number; active7d: number };
  cards: {
    total: number; photos: number; sharingOn: number; sharingOff: number; withPhone: number;
    linkViews: number; avgPerUser: number; byCategory: { category: string; n: number }[];
  };
  series: { signups: { day: string; n: number }[]; cards: { day: string; n: number }[] };
  storage: { storageBytes: number | null; bandwidthBytes: number | null; transformations: number | null; plan: string | null } | null;
  generatedAt: string;
};

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Stats>("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <Empty>{error}</Empty>;
  if (!stats) return <Empty>Loading analytics…</Empty>;

  const { users, cards, series, storage } = stats;
  const totalSharing = cards.sharingOn + cards.sharingOff || 1;
  const maxCat = Math.max(1, ...cards.byCategory.map((c) => c.n));

  return (
    <>
      <PageTitle title="Overview" subtitle={`Updated ${fmtDate(stats.generatedAt)} · counts only, no personal data`} />

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", marginBottom: 18 }}>
        <Stat label="Users" value={users.total} hint={`${users.new7d} new this week`} />
        <Stat label="Active (7 days)" value={users.active7d} hint={`${users.total ? Math.round((users.active7d / users.total) * 100) : 0}% of users`} />
        <Stat label="Cards" value={cards.total} hint={`${cards.avgPerUser} per user`} />
        <Stat label="Photos" value={cards.photos} />
        <Stat label="Link views" value={cards.linkViews} hint="opens of shared links" />
        <Stat label="Suspended" value={users.suspended} />
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginBottom: 14 }}>
        <Panel>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>New users</h3>
          <BarChart data={series.signups} />
        </Panel>
        <Panel>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>New cards</h3>
          <BarChart data={series.cards} color="#3b82f6" />
        </Panel>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <Panel>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Cards by category</h3>
          {cards.byCategory.length === 0 ? <Empty>No cards yet.</Empty> : cards.byCategory.map((c) => (
            <div key={c.category} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}>
                <span style={{ textTransform: "capitalize" }}>{c.category}</span><b>{c.n}</b>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--surface2)" }}>
                <div style={{ width: `${(c.n / maxCat) * 100}%`, height: "100%", borderRadius: 4, background: "var(--accent-gradient)" }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Sharing</h3>
          <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", background: "var(--surface2)", marginBottom: 10 }}>
            <div style={{ width: `${(cards.sharingOn / totalSharing) * 100}%`, background: "#22c55e" }} />
            <div style={{ width: `${(cards.sharingOff / totalSharing) * 100}%`, background: "#94a3b8" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span>🟢 Link on: <b>{cards.sharingOn}</b></span>
            <span>⚪ Private: <b>{cards.sharingOff}</b></span>
          </div>
          <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--text-secondary)" }}>
            {cards.withPhone} cards include a contact number.
          </div>
        </Panel>

        <Panel>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Media storage (Cloudinary)</h3>
          {storage ? (
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <div>Storage used: <b>{fmtBytes(storage.storageBytes)}</b></div>
              <div>Bandwidth (this period): <b>{fmtBytes(storage.bandwidthBytes)}</b></div>
              <div>Transformations: <b>{storage.transformations ?? "—"}</b></div>
              {storage.plan && <div style={{ color: "var(--muted)" }}>Plan: {storage.plan}</div>}
            </div>
          ) : (
            <Empty>Usage isn&apos;t available (Cloudinary not configured or unreachable).</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
