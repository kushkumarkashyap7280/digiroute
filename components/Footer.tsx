"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Compass, ShieldCheck, Heart, MapPin, ExternalLink } from "lucide-react";

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
        padding: "3.5rem 1rem 2rem",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div className="container" style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Col 1: Brand & Mission */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <Link href="/" style={{ display: "inline-block" }}>
              <Image
                src={
                  theme === "dark"
                    ? "/Orange Minimalist Travel App Business Logo/dark.png"
                    : "/Orange Minimalist Travel App Business Logo/light.png"
                }
                alt="DigiRoute"
                height={32}
                width={105}
                style={{ height: 32, width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p className="text-muted text-xs" style={{ lineHeight: 1.7, maxWidth: 280 }}>
              Precision doorstep navigation powered by India Post&apos;s 10-character alphanumeric DIGIPIN standard.
              Never share the wrong entrance gate again.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--success)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem", color: "var(--orange)" }}>
              Tools &amp; Services
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
              <li>
                <Link href="/convert" className="text-muted" style={{ transition: "color 0.2s" }}>
                  Free Location Converter
                </Link>
              </li>
              <li>
                <Link href="/convert" className="text-muted" style={{ transition: "color 0.2s" }}>
                  DIGIPIN Decoder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted" style={{ transition: "color 0.2s" }}>
                  Address Cards Manager
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted" style={{ transition: "color 0.2s" }}>
                  How DIGIPIN Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Account & Access */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem", color: "var(--orange)" }}>
              Account &amp; Share
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
              <li>
                <Link href="/signup" className="text-muted" style={{ transition: "color 0.2s" }}>
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted" style={{ transition: "color 0.2s" }}>
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted" style={{ transition: "color 0.2s" }}>
                  Saved Locations
                </Link>
              </li>
              <li>
                <span className="text-muted text-xs" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <ShieldCheck size={13} className="text-orange" />
                  <span>Encrypted Sessions (jose)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Specs & Tech */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem", color: "var(--orange)" }}>
              Specification
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
              <p>Resolution: ~4m × 4m grid cell</p>
              <p>Standard: India Post CEPT Open Standard</p>
              <p>Maps Engine: Google Maps Embed</p>
              <p>Algorithm: Zero Client Exposure</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "var(--muted)",
          }}
        >
          <p>© {new Date().getFullYear()} DigiRoute. Built for precision navigation.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span>Made with</span>
            <Heart size={13} style={{ color: "var(--orange)", fill: "var(--orange)" }} />
            <span>for seamless deliveries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
