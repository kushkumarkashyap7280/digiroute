"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const fmtDay = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtBytes = (n?: number | null) => {
  if (n == null) return "—";
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
};

export function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, ...style }}>
      {children}
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "neutral" | "good" | "bad" | "warn" | "accent";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--surface2)", fg: "var(--text-secondary)" },
  good: { bg: "rgba(34,197,94,0.14)", fg: "#16a34a" },
  bad: { bg: "rgba(239,68,68,0.14)", fg: "#dc2626" },
  warn: { bg: "rgba(245,158,11,0.16)", fg: "#b45309" },
  accent: { bg: "var(--orange-subtle)", fg: "var(--orange)" },
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, padding: "3px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function Button({
  children, onClick, variant = "secondary", disabled, type = "button", small,
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean; type?: "button" | "submit"; small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--accent-gradient)", color: "#fff", border: "none" },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" },
    danger: { background: "rgba(239,68,68,0.12)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.35)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant], borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1, padding: small ? "6px 11px" : "10px 16px", fontSize: small ? 13 : 14, whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text)", fontSize: 15, outline: "none",
};

export function Modal({ title, onClose, children, width = 460 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div style={{ width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 22, boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>{title}</h2>
          <button aria-label="Close" onClick={onClose} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Panel>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 800, margin: "4px 0 2px", letterSpacing: "-0.02em" }}>{value}</div>
      {hint && <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{hint}</div>}
    </Panel>
  );
}

/** Minimal dependency-free bar chart (30 daily values). */
export function BarChart({ data, color = "var(--orange)" }: { data: { day: string; n: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  const total = data.reduce((s, d) => s + d.n, 0);
  const W = 600, H = 140, gap = 3;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} width="100%" role="img" aria-label={`Last 30 days, ${total} in total`}>
        {data.map((d, i) => {
          const h = Math.max(d.n ? 3 : 1.5, (d.n / max) * H);
          return (
            <g key={d.day}>
              <title>{`${d.day}: ${d.n}`}</title>
              <rect x={i * (bw + gap)} y={H - h} width={bw} height={h} rx={2} fill={d.n ? color : "var(--border)"} />
            </g>
          );
        })}
        <text x={0} y={H + 14} fontSize={10} fill="var(--muted)">{data[0]?.day.slice(5)}</text>
        <text x={W} y={H + 14} fontSize={10} fill="var(--muted)" textAnchor="end">{data[data.length - 1]?.day.slice(5)}</text>
      </svg>
      <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{total} in the last 30 days · peak {max}/day</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div style={{ padding: "28px 12px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>{children}</div>;
}

export const th: React.CSSProperties = { textAlign: "left", fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
export const td: React.CSSProperties = { padding: "11px 12px", borderBottom: "1px solid var(--border)", fontSize: 14, verticalAlign: "middle" };

/** One-time reveal of a generated password, with copy. */
export function SecretModal({ title, email, password, onClose }: { title: string; email: string; password: string; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>
        Give this temporary password to <b>{email}</b>. It is shown <b>only once</b> and can&apos;t be recovered — if lost, reset it again.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input readOnly value={password} onFocus={(e) => e.currentTarget.select()} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 16, letterSpacing: 1 }} />
        <Button onClick={() => navigator.clipboard.writeText(password)}>Copy</Button>
      </div>
      <div style={{ marginTop: 16, textAlign: "right" }}><Button variant="primary" onClick={onClose}>Done</Button></div>
    </Modal>
  );
}
