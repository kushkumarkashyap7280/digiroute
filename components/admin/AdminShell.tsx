"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { BarChart3, CreditCard, KeyRound, LogOut, Menu, ScrollText, ShieldCheck, UserCog, Users, X } from "lucide-react";
import { adminFetch } from "@/components/admin/adminApi";
import { Badge } from "@/components/admin/ui";

export type AdminInfo = { name: string; email: string; role: "super" | "sub"; mustChangePassword: boolean };

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3, superOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, superOnly: false },
  { href: "/admin/cards", label: "Cards", icon: CreditCard, superOnly: false },
  { href: "/admin/admins", label: "Admins", icon: UserCog, superOnly: true },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText, superOnly: true },
  { href: "/admin/account", label: "My account", icon: KeyRound, superOnly: false },
];

export default function AdminShell({ admin, children }: { admin: AdminInfo; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const items = NAV.filter((n) => !n.superOnly || admin.role === "super");
  const locked = admin.mustChangePassword;

  async function logout() {
    await adminFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  const sidebar = (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const disabled = locked && href !== "/admin/account";
        return (
          <Link
            key={href}
            href={disabled ? "/admin/account" : href}
            onClick={() => setMenu(false)}
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none",
              fontWeight: 600, fontSize: 14.5, opacity: disabled ? 0.45 : 1,
              color: active ? "var(--orange)" : "var(--text-secondary)",
              background: active ? "var(--orange-subtle)" : "transparent",
            }}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{admin.name}</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", wordBreak: "break-all", marginBottom: 8 }}>{admin.email}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Badge tone={admin.role === "super" ? "accent" : "neutral"}>{admin.role === "super" ? "Super admin" : "Sub-admin"}</Badge>
        <button onClick={logout} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--text-secondary)", display: "flex", gap: 6, alignItems: "center", fontWeight: 600, fontSize: 13.5 }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    // Covers the public site chrome (navbar/footer): the admin area is its own app.
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--bg)", color: "var(--text)", display: "flex", overflow: "hidden" }}>
      <aside className="admin-sidebar" style={{ width: 250, borderRight: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 16, background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 17 }}>
          <ShieldCheck size={22} style={{ color: "var(--orange)" }} /> DigiRoute Admin
        </div>
        {sidebar}
        {account}
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header className="admin-topbar" style={{ display: "none", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <ShieldCheck size={20} style={{ color: "var(--orange)" }} /> Admin
          </div>
          <button aria-label="Menu" onClick={() => setMenu(true)} style={{ background: "none", border: 0, color: "var(--text)", cursor: "pointer" }}>
            <Menu size={24} />
          </button>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "24px clamp(14px, 3vw, 32px) 48px" }}>
          {locked && (
            <div role="alert" style={{ marginBottom: 18, padding: "12px 14px", borderRadius: 12, background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.4)", fontSize: 14 }}>
              Choose your own password to continue. Until then the rest of the panel is locked.
            </div>
          )}
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
        </main>
      </div>

      {menu && (
        <div onMouseDown={(e) => e.target === e.currentTarget && setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.5)" }}>
          <div style={{ width: 280, height: "100%", background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
              DigiRoute Admin
              <button aria-label="Close menu" onClick={() => setMenu(false)} style={{ background: "none", border: 0, color: "var(--text)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {sidebar}
            {account}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
