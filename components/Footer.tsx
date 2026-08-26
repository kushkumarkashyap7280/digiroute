"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Compass, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "dark" | "light") ?? "dark";
    setTheme(current);

    const observer = new MutationObserver(() => {
      const updated = (document.documentElement.getAttribute("data-theme") as "dark" | "light") ?? "dark";
      setTheme(updated);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg2)",
        padding: "2.5rem 1rem 2rem",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Brand & Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/" style={{ display: "inline-block" }}>
              <Image
                src={
                  theme === "dark"
                    ? "/Orange Minimalist Travel App Business Logo/dark.png"
                    : "/Orange Minimalist Travel App Business Logo/light.png"
                }
                alt="DigiRoute"
                height={30}
                width={100}
                style={{ height: 30, width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p className="text-muted text-xs" style={{ maxWidth: 320, lineHeight: 1.6 }}>
              India Post 10-character DIGIPIN addressing standard (~4m precision).
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: "var(--success)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Quick Essential Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
            <Link href="/convert" className="text-muted" style={{ transition: "color 0.2s", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Compass size={14} className="text-orange" />
              <span>DigiRoute Compass</span>
            </Link>
            <Link href="/dashboard" className="text-muted" style={{ transition: "color 0.2s" }}>
              Dashboard
            </Link>
            <Link href="/login" className="text-muted" style={{ transition: "color 0.2s" }}>
              Sign In
            </Link>
            <Link href="/signup" className="text-muted" style={{ transition: "color 0.2s" }}>
              Create Account
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            fontSize: "0.75rem",
            color: "var(--muted)",
          }}
        >
          <p>© {new Date().getFullYear()} DigiRoute · India Post CEPT Standard</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span>Made with</span>
            <Heart size={12} style={{ color: "var(--orange)", fill: "var(--orange)" }} />
            <span>for seamless deliveries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
