"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Compass,
  Heart,
  QrCode,
  Layers,
  MapPin,
  Sparkles,
  ShieldCheck,
  User,
  ExternalLink,
} from "lucide-react";
import DigiRouteQRScannerModal from "@/components/DigiRouteQRScannerModal";

export default function Footer() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showScanner, setShowScanner] = useState(false);

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
        padding: "3rem 1rem 2rem",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* Top Grid: Brand Information + Category-Wise Link Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "2.5rem 1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }} aria-label="DigiRoute Home">
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
            <p className="text-muted text-xs" style={{ lineHeight: 1.65, margin: 0 }}>
              Precision doorstep navigation powered by India Post&apos;s CEPT 10-character DIGIPIN addressing standard (~4m precision).
            </p>
          </div>

          {/* Column 2: Navigation & Tools */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange)", margin: 0 }}>
              Tools &amp; Navigation
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.82rem" }}>
              <Link href="/" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                Home
              </Link>
              <Link href="/convert" className="text-muted hover:text-orange" style={{ transition: "color 0.2s", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Compass size={13} className="text-orange" />
                <span>DigiRoute Compass</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="text-muted hover:text-orange"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <QrCode size={13} className="text-orange" />
                <span>Scan QR Pass</span>
              </button>
              <Link href="/about" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                About DigiRoute
              </Link>
            </nav>
          </div>

          {/* Column 3: Account & Addresses */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange)", margin: 0 }}>
              Account &amp; Cards
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.82rem" }}>
              <Link href="/dashboard" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                My Dashboard
              </Link>
              <Link href="/signup" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                Create Address Card
              </Link>
              <Link href="/login" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                Sign In
              </Link>
              <Link href="/signup" className="text-muted hover:text-orange" style={{ transition: "color 0.2s" }}>
                Sign Up Free
              </Link>
            </nav>
          </div>

          {/* Column 4: Technology & Open Standard */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange)", margin: 0 }}>
              Standard &amp; Specs
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Layers size={13} className="text-orange" />
                <span>India Post CEPT Standard</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <MapPin size={13} className="text-orange" />
                <span>~3.8m Sub-Grid Cells</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <ShieldCheck size={13} className="text-orange" />
                <span>100% Reversible Math</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Sparkles size={13} className="text-orange" />
                <span>Gate Photo Verification</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
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
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} DigiRoute · Department of Posts (CEPT) Open Standard</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span>Engineered with</span>
            <Heart size={11} style={{ color: "var(--orange)", fill: "var(--orange)" }} />
            <span>for seamless doorstep deliveries</span>
          </div>
        </div>
      </div>

      {/* Global QR Scanner Modal Triggered from Footer */}
      {showScanner && (
        <DigiRouteQRScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
        />
      )}
    </footer>
  );
}
