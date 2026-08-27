"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  Camera,
  QrCode,
  ScanLine,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Radio,
  Search,
  Globe,
  Maximize2,
  Printer,
  DoorClosed,
  Bell,
  Keyboard,
  Building,
  Smartphone,
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

export default function AboutClient() {
  return (
    <div style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      {/* Chemical Compound Molecular Map Network Background */}
      <ParticleBackground />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "3.5rem 1rem 5rem" }}>
        {/* ── 1. HERO SECTION ───────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--orange-subtle)",
              border: "1px solid rgba(249,115,22,0.35)",
              color: "var(--orange)",
              fontSize: "0.76rem",
              fontWeight: 700,
              padding: "0.3rem 0.85rem",
              borderRadius: 999,
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Sparkles size={13} />
            <span>Our Mission &amp; Purpose</span>
          </motion.div>

          {/* Responsive Hero Title: 1 single compact line on desktop; 3 structured lines on phone (white -> orange -> white) */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="about-hero-title"
          >
            <span className="about-hero-line-white">Solving the</span>{" "}
            <span className="text-orange about-hero-line-orange">&ldquo;Last 4 Meters&rdquo;</span>{" "}
            <span className="about-hero-line-white">Problem in India</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.02rem)",
              color: "var(--muted)",
              maxWidth: 680,
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Traditional navigation apps drop delivery drivers in neighboring alleys, backside walls, or wrong gates.
            DigiRoute combines India Post&apos;s CEPT 10-character algorithmic DIGIPIN standard (~4m precision) with
            verified entrance photos, printable QR passes, and live camera scanning.
          </motion.p>
        </div>

        {/* ── 2. THE PROBLEM VS OUR SOLUTION ─────────── */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {/* The Problem Card */}
            <div
              className="card"
              style={{
                border: "1.5px solid rgba(239, 68, 68, 0.4)",
                background: "rgba(239, 68, 68, 0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--danger)" }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>The Standard GPS Problem</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <li>
                  <strong style={{ color: "var(--text)" }}>Centroid Pitfall:</strong> Traditional GPS pins point to the geometric center of a building, often routing couriers to locked backyards.
                </li>
                <li>
                  <strong style={{ color: "var(--text)" }}>Unrecognized Gates:</strong> Dense Indian neighborhoods, gated societies, and commercial complexes have complex multi-gate entries with no visual signage on maps.
                </li>
                <li>
                  <strong style={{ color: "var(--text)" }}>Constant Phone Calls:</strong> Drivers get lost, leading to frustrating 5-minute phone calls just to explain landmarks and doorbell locations.
                </li>
              </ul>
            </div>

            {/* The DigiRoute Solution Card */}
            <div
              className="card"
              style={{
                border: "1.5px solid rgba(249, 115, 22, 0.45)",
                background: "rgba(249, 115, 22, 0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--orange)" }}>
                <ShieldCheck size={20} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>How DigiRoute Fixes It</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <li>
                  <strong style={{ color: "var(--text)" }}>~4m Sub-Grid Accuracy:</strong> India Post DIGIPIN breaks the map into 4m × 4m cells, pinpointing the actual doorway latch.
                </li>
                <li>
                  <strong style={{ color: "var(--text)" }}>Visual Entrance Verification:</strong> Attach verified photos of your real gate, building facade, or landmark so drivers recognize your door on arrival.
                </li>
                <li>
                  <strong style={{ color: "var(--text)" }}>Printable QR Doorstep Stamps:</strong> Affix a branded QR pass at your entrance or visiting card for instant 1-tap navigation without manual typing.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 3. DETAILED STEP-BY-STEP USER GUIDE ─────── */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
              Complete Feature Walkthrough
            </p>
            <h2 style={{ fontSize: "clamp(1.35rem, 3.2vw, 1.95rem)", fontWeight: 800, margin: 0 }}>
              How to Use Every DigiRoute Tool
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Guide Step 1: DigiRoute Compass */}
            <div className="card" style={{ border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange-subtle)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>1. DigiRoute Compass (Public Inspector)</h3>
                    <span className="text-muted text-xs">No account required · 100% Free</span>
                  </div>
                </div>
                <Link href="/convert" className="btn btn-outline btn-sm" style={{ fontSize: "0.76rem" }}>
                  <span>Open Compass</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "0.75rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Radio size={14} />
                    <span>Live GPS Capture</span>
                  </div>
                  Click &ldquo;Capture My Location&rdquo; while standing at your doorstep to calculate your exact 10-char DIGIPIN instantly.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Search size={14} />
                    <span>Decode Any DIGIPIN</span>
                  </div>
                  Enter any 10-character code (e.g. <code className="text-orange font-mono">4T396F42L7</code>) to view its coordinates and central Google Maps pin.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Globe size={14} />
                    <span>Coordinates to PIN</span>
                  </div>
                  Input latitude &amp; longitude to mathematically reverse-engineer the CEPT DIGIPIN bounding cell.
                </div>
              </div>
            </div>

            {/* Guide Step 2: Creating Address Cards */}
            <div className="card" style={{ border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange-subtle)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>2. Creating Doorstep Address Cards</h3>
                    <span className="text-muted text-xs">Attach up to 2 entrance photos · Custom title &amp; address</span>
                  </div>
                </div>
                <Link href="/dashboard" className="btn btn-outline btn-sm" style={{ fontSize: "0.76rem" }}>
                  <span>Go to Dashboard</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "0.75rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Smartphone size={14} />
                    <span>Live Camera &amp; Gallery</span>
                  </div>
                  Snap live doorway photos directly with your phone camera or select existing photos under 2MB.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Zap size={14} />
                    <span>Low-Bandwidth Previews</span>
                  </div>
                  Thumbnails are auto-compressed to 5–15 KB for lightning-fast dashboard browsing.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Maximize2 size={14} />
                    <span>Lightbox Full View</span>
                  </div>
                  Click on any photo to inspect high-resolution zoom, or update/replace photos with real-time blur overlay.
                </div>
              </div>
            </div>

            {/* Guide Step 3: QR Code Doorstep Passes */}
            <div className="card" style={{ border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange-subtle)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>3. Printable QR Code Passes</h3>
                    <span className="text-muted text-xs">High-contrast white QR · Centered logo emblem · Downside DIGIPIN</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "0.75rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Printer size={14} />
                    <span>Download Stamp (PNG)</span>
                  </div>
                  Export a ready-to-print PNG badge card with your address title, QR code, and highlighted DIGIPIN code.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <DoorClosed size={14} />
                    <span>Affix at Your Gate</span>
                  </div>
                  Print and stick the QR pass near your doorbell so delivery couriers scan and verify the entrance immediately.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <ShieldCheck size={14} />
                    <span>Verified Doorstep Badge</span>
                  </div>
                  Authenticated address cards display an exclusive verified badge with glowing security stamp styling.
                </div>
              </div>
            </div>

            {/* Guide Step 4: Live Laser Camera Scanner */}
            <div className="card" style={{ border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange-subtle)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScanLine size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>4. Live Camera QR Scanner</h3>
                    <span className="text-muted text-xs">Laser reticle · Haptic vibration · Web Audio chime</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "0.75rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Camera size={14} />
                    <span>Real-Time Camera Scan</span>
                  </div>
                  Open the scanner from the homepage or navbar. Point the camera at any doorstep QR code for instant detection.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Bell size={14} />
                    <span>Sound &amp; Vibration</span>
                  </div>
                  Triggers haptic feedback and an upward melodic chime so users know it scanned without looking.
                </div>
                <div style={{ background: "var(--surface2)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--orange)", fontWeight: 700, marginBottom: "0.25rem" }}>
                    <Keyboard size={14} />
                    <span>Manual DIGIPIN Fallback</span>
                  </div>
                  If the camera is not accessible, type any 10-char code directly in the bottom input field to navigate instantly.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. UNDER THE HOOD: THE CEPT DIGIPIN ARCHITECTURE ─── */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div
            className="card"
            style={{
              border: "1.5px solid rgba(249, 115, 22, 0.4)",
              background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)",
              padding: "2rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Layers size={22} className="text-orange" />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                Under the Hood: India Post CEPT Grid Architecture
              </h3>
            </div>
            <p className="text-muted text-sm" style={{ lineHeight: 1.65, margin: 0 }}>
              DIGIPIN divides India&apos;s geographic boundary (Latitudes 2.5°N–38.5°N, Longitudes 63.5°E–99.5°E)
              hierarchically into a 4×4 alphanumeric matrix across 10 recursive levels.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "0.75rem" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span className="text-muted text-xs" style={{ textTransform: "uppercase", fontWeight: 700 }}>Alphabet Set</span>
                <p className="font-mono text-orange" style={{ fontWeight: 800, fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
                  2-9, C, F, J, K, L, M, P, Q, R, V, W, X
                </p>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>Excludes confusing letters (0, 1, I, O)</span>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span className="text-muted text-xs" style={{ textTransform: "uppercase", fontWeight: 700 }}>Resolution</span>
                <p className="font-mono text-orange" style={{ fontWeight: 800, fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
                  ~3.8m × 3.8m Grid Cell
                </p>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>Sub-building doorway accuracy</span>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span className="text-muted text-xs" style={{ textTransform: "uppercase", fontWeight: 700 }}>Standard</span>
                <p className="font-mono text-orange" style={{ fontWeight: 800, fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
                  100% Open &amp; Reversible
                </p>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>Offline mathematical computation</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. FINAL CALL TO ACTION ───────────────── */}
        <section style={{ textAlign: "center" }}>
          <div
            className="card"
            style={{
              padding: "2.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.15rem",
              border: "1.5px solid rgba(249,115,22,0.35)",
            }}
          >
            <h2 style={{ fontSize: "clamp(1.35rem, 3vw, 1.8rem)", fontWeight: 800, margin: 0 }}>
              Start Navigating with ~4m Precision Today
            </h2>
            <p className="text-muted text-sm" style={{ maxWidth: 520, margin: 0, lineHeight: 1.6 }}>
              Whether you need to quickly inspect coordinates on DigiRoute Compass or create a verified doorstep card for your home, DigiRoute is built for you.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/convert" className="btn btn-primary" style={{ padding: "0.7rem 1.4rem", fontSize: "0.88rem" }}>
                <Compass size={16} />
                <span>Try DigiRoute Compass</span>
              </Link>
              <Link href="/signup" className="btn btn-outline" style={{ padding: "0.7rem 1.4rem", fontSize: "0.88rem" }}>
                <Camera size={16} />
                <span>Create Address Card</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Embedded CSS for responsive 1-line desktop title vs 3-line mobile title */}
      <style jsx global>{`
        .about-hero-title {
          font-size: clamp(1.35rem, 3vw, 2.25rem);
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.025em;
          margin-bottom: 1.15rem;
          text-align: center;
        }

        .about-hero-line-white {
          display: inline;
          color: var(--text);
        }

        .about-hero-line-orange {
          display: inline;
        }

        @media (max-width: 640px) {
          .about-hero-title {
            font-size: 1.45rem;
            line-height: 1.35;
          }
          .about-hero-line-white {
            display: block;
          }
          .about-hero-line-orange {
            display: block;
            margin: 0.15rem 0;
          }
        }
      `}</style>
    </div>
  );
}
