"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Menu,
  X,
  Home,
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sync theme from html attribute
  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "dark" | "light") ?? "dark";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("digiroute-theme", next);
    setTheme(next);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = user ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "";

  return (
    <nav className="navbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div className="navbar__inner">
        {/* Logo with Styled Brand Text */}
        <Link
          href="/"
          className="navbar__logo"
          aria-label="DigiRoute Home"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}
        >
          <Image
            src={
              theme === "dark"
                ? "/Orange Minimalist Travel App Business Logo/dark.png"
                : "/Orange Minimalist Travel App Business Logo/light.png"
            }
            alt="DigiRoute Logo"
            height={32}
            width={32}
            style={{ height: 32, width: "auto", objectFit: "contain" }}
            priority
          />
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, var(--text) 30%, var(--orange) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
            }}
          >
            DigiRoute
          </span>
        </Link>

        {/* Desktop Links (hidden on mobile via CSS) */}
        <div className="navbar__right hide-mobile">
          <Link href="/convert" className="btn btn-ghost btn-sm" id="nav-convert" title="DigiRoute Compass">
            <Compass size={14} className="text-orange" />
            <span>DigiRoute Compass</span>
          </Link>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="navbar__user-chip" title={user.email}>
                    <span className="avatar">{initials}</span>
                    <span className="user-name">{user.name.split(" ")[0]}</span>
                  </div>
                  <Link href="/dashboard" className="btn btn-outline btn-sm" id="nav-dashboard">
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="btn btn-ghost btn-sm"
                    id="nav-logout"
                    title="Logout"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login">
                    <LogIn size={14} />
                    <span>Login</span>
                  </Link>
                  <Link href="/signup" className="btn btn-primary btn-sm" id="nav-signup">
                    <UserPlus size={14} />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Navbar Controls (visible only on <= 640px) */}
        <div className="mobile-only-controls" style={{ display: "none", alignItems: "center", gap: "0.4rem" }}>
          {/* Theme toggle on mobile */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            style={{ width: 34, height: 34 }}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Hamburger toggle button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="theme-toggle"
            aria-label="Open navigation menu"
            style={{
              width: 36,
              height: 36,
              background: mobileMenuOpen ? "var(--orange-subtle)" : "var(--surface2)",
              borderColor: mobileMenuOpen ? "var(--orange)" : "var(--border)",
              color: mobileMenuOpen ? "var(--orange)" : "var(--text)",
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Animated Drawer Menu ───────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "var(--surface)",
              borderBottom: "1px solid var(--border)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* User profile card in mobile drawer if logged in */}
              {user && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "var(--surface2)",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem" }}>
                    {initials}
                  </span>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{user.name}</p>
                    <p className="text-muted text-xs" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <Link
                href="/"
                className="btn btn-outline w-full"
                style={{ justifyContent: "space-between", padding: "0.65rem 1rem", fontSize: "0.9rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Home size={16} className="text-orange" />
                  <span>Home</span>
                </div>
                <ChevronRight size={15} className="text-muted" />
              </Link>

              <Link
                href="/convert"
                className="btn btn-outline w-full"
                style={{ justifyContent: "space-between", padding: "0.65rem 1rem", fontSize: "0.9rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Compass size={16} className="text-orange" />
                  <span>DigiRoute Compass</span>
                </div>
                <ChevronRight size={15} className="text-muted" />
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn btn-primary w-full"
                    style={{ justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.9rem" }}
                  >
                    <LayoutDashboard size={16} />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="btn btn-danger w-full"
                    style={{ justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <Link href="/login" className="btn btn-outline" style={{ justifyContent: "center" }}>
                    <LogIn size={15} />
                    <span>Login</span>
                  </Link>
                  <Link href="/signup" className="btn btn-primary" style={{ justifyContent: "center" }}>
                    <UserPlus size={15} />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
