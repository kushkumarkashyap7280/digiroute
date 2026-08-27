"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Camera,
  Share2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  QrCode,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  HelpCircle,
  ScanLine,
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import TypewriterTagline from "@/components/TypewriterTagline";
import DigiRouteQRScannerModal from "@/components/DigiRouteQRScannerModal";

// ── FAQs Data with Comprehensive Insights ──────────────────────────────────
const FAQS = [
  {
    q: "What is India Post DIGIPIN (~4m Precision Standard)?",
    a: "DIGIPIN (Digital Postal Index Number) is an open, reversible geo-coded addressing standard developed by the Department of Posts (CEPT). It divides India into precise ~4m × 4m grid cells, assigning a unique 10-character alphanumeric code to every exact doorstep without relying on approximate road centerlines.",
  },
  {
    q: "How does DigiRoute solve wrong-gate and backside delivery confusion?",
    a: "Standard navigation apps place GPS pins in the approximate center of a building or on neighboring back alleys. DigiRoute captures the exact ~4m entrance coordinates and pairs them with verified photos of your real gate, building signage, and landmarks so couriers arrive at the right doorway on the first try.",
  },
  {
    q: "How do the Printable QR Doorstep Passes work?",
    a: "Every address card and DIGIPIN location can generate a high-contrast branded QR pass. It features the DigiRoute brand logo in the center and your 10-character DIGIPIN at the bottom. You can download and print it as a PNG sticker to affix onto your gate, visiting card, or delivery instruction notes.",
  },
  {
    q: "How does the Live Camera QR Scanner navigate visitors?",
    a: "Visitors or delivery drivers can click 'Scan QR Pass' on the DigiRoute homepage to open the real-time camera viewfinder. When pointed at any doorstep QR pass, the scanner triggers an instant haptic vibration and chime sound, automatically redirecting them to the verified entrance card on Google Maps.",
  },
  {
    q: "Do I need an account to use DigiRoute Compass?",
    a: "No. DigiRoute Compass is 100% public, free, and does not require logging in. You can convert GPS coordinates to DIGIPIN, decode 10-char codes to coordinates, and open interactive Google Maps directions anytime. An account is only needed if you want to save permanent address cards with entrance photos.",
  },
  {
    q: "How are entrance photos optimized for fast mobile loading?",
    a: "Photos taken on mobile cameras (up to 2MB) are automatically transformed into ultra-lightweight micro-thumbnails (5–15 KB) for instant dashboard loading. Full high-resolution photos are only loaded on demand when opening the fullscreen lightbox view.",
  },
];

export default function HomeClient() {
  // FAQ accordion state (single active index or null)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      {/* Chemical Compound Molecular Map Network Background */}
      <ParticleBackground />

      {/* ── 1. HERO SECTION ───────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4.5rem 1rem 3rem",
          maxWidth: 960,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
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
          <span>India Post CEPT 10-Digit Standard</span>
        </motion.div>

        {/* Main Heading with TypewriterTagline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: "clamp(1.9rem, 5.2vw, 3.4rem)",
            fontWeight: 900,
            lineHeight: 1.22,
            letterSpacing: "-0.025em",
            marginBottom: "1.15rem",
            textAlign: "center",
          }}
        >
          <TypewriterTagline
            prefix="Share your exact"
            words={["gate.", "doorstep.", "entrance.", "location."]}
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: "clamp(0.92rem, 2.2vw, 1.05rem)",
            color: "var(--muted)",
            maxWidth: 640,
            margin: "0 auto 2.25rem",
            lineHeight: 1.65,
          }}
        >
          Encode coordinates into reversible 10-character DIGIPINs, attach real gate photos, and guide couriers
          directly to your exact doorway with printable QR passes and 1-tap Google Maps.
        </motion.p>

        {/* Action Buttons: Compass + Scan QR Pass + Create Address Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          {/* Primary Compass Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/convert"
              className="btn btn-primary"
              id="try-compass-btn"
              style={{ fontSize: "0.9rem", padding: "0.7rem 1.35rem" }}
            >
              <Compass size={16} />
              <span>DigiRoute Compass</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* QR Scanner Direct Action */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="btn btn-outline"
              id="hero-scan-qr-btn"
              style={{
                fontSize: "0.9rem",
                padding: "0.7rem 1.35rem",
                border: "1.5px solid rgba(249,115,22,0.55)",
                background: "rgba(249,115,22,0.08)",
                color: "var(--text)",
              }}
            >
              <QrCode size={16} className="text-orange" />
              <span>Scan QR Pass</span>
            </button>
          </motion.div>

          {/* Create Address Card Action */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="btn btn-outline"
              id="hero-signup-btn"
              style={{ fontSize: "0.9rem", padding: "0.7rem 1.35rem" }}
            >
              <Camera size={15} />
              <span>Create Address Card</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(0.75rem, 3vw, 2rem)",
            flexWrap: "wrap",
            marginTop: "2.5rem",
            padding: "0.75rem 1rem",
            background: "rgba(24, 24, 27, 0.45)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            maxWidth: 680,
            marginInline: "auto",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", color: "var(--muted)" }}>
            <CheckCircle2 size={13} className="text-orange" /> ~4m Sub-Grid Precision
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", color: "var(--muted)" }}>
            <Camera size={13} className="text-orange" /> Real Doorstep Photos
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", color: "var(--muted)" }}>
            <QrCode size={13} className="text-orange" /> Printable QR Stamps
          </span>
        </motion.div>
      </section>

      {/* ── 2. KEY PILLARS / HOW IT WORKS ─────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 1rem 3.5rem",
          maxWidth: 1060,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--orange)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.35rem",
            }}
          >
            Core Capabilities
          </p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800 }}>
            Precision Doorstep Navigation Engine
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: "1rem",
          }}
        >
          {/* Pillar 1: DIGIPIN Standard */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>1. 10-Digit DIGIPIN</h3>
            <p className="text-muted text-xs" style={{ lineHeight: 1.6, margin: 0 }}>
              India Post&apos;s CEPT standard breaks the map into reversible 4m × 4m cells, assigning a unique code to
              any exact doorway.
            </p>
          </motion.div>

          {/* Pillar 2: Entrance Photos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>2. Gate &amp; Doorway Photos</h3>
            <p className="text-muted text-xs" style={{ lineHeight: 1.6, margin: 0 }}>
              Snap real photos of your gate, doorway, or landmark so drivers recognize the physical entrance on arrival.
            </p>
          </motion.div>

          {/* Pillar 3: QR Code Passes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>3. Printable QR Passes</h3>
            <p className="text-muted text-xs" style={{ lineHeight: 1.6, margin: 0 }}>
              Generate high-contrast QR code stamps with your DIGIPIN code at the bottom. Download PNGs to print for your doorstep.
            </p>
          </motion.div>

          {/* Pillar 4: Live Laser Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScanLine size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>4. Instant Camera Scan</h3>
            <p className="text-muted text-xs" style={{ lineHeight: 1.6, margin: 0 }}>
              Scan any doorstep pass with live reticle feedback, haptic vibration, and audio chime to navigate immediately.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 3. REFINED UNIFORM FAQ ACCORDION ───────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "1rem 1rem 4.5rem",
          maxWidth: 820,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--orange)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.35rem",
            }}
          >
            Frequently Asked Questions
          </p>
          <h2 style={{ fontSize: "clamp(1.35rem, 3.2vw, 1.85rem)", fontWeight: 800, margin: 0 }}>
            Everything You Need to Know
          </h2>
        </div>

        {/* Uniform Sized FAQ Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  width: "100%",
                  border: isOpen ? "1.5px solid rgba(249,115,22,0.5)" : "1px solid var(--border)",
                  background: "var(--surface)",
                  boxShadow: isOpen ? "0 4px 20px rgba(249,115,22,0.1)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    background: isOpen ? "var(--surface2)" : "transparent",
                    border: "none",
                    color: "var(--text)",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    lineHeight: 1.4,
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "0.75rem",
                    minHeight: 52,
                  }}
                >
                  <span style={{ flex: 1 }}>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: isOpen ? "var(--orange)" : "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div
                        style={{
                          padding: "0.75rem 1rem 1rem",
                          color: "var(--muted)",
                          fontSize: "0.8rem",
                          lineHeight: 1.6,
                          borderTop: "1px solid var(--border)",
                          background: "var(--surface)",
                        }}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. CTA BANNER SECTION ─────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 1rem 5rem",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 100%)",
            border: "1.5px solid rgba(249,115,22,0.35)",
            padding: "2rem 1.5rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              color: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 0.4rem" }}>
              Make Your Doorstep 100% Discoverable
            </h3>
            <p className="text-muted text-sm" style={{ maxWidth: 500, margin: "0 auto", lineHeight: 1.55 }}>
              Try DigiRoute Compass for instant coordinate conversions or create verified doorstep address cards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/convert" className="btn btn-primary" style={{ padding: "0.65rem 1.3rem", fontSize: "0.86rem" }}>
              <Compass size={15} />
              <span>Open DigiRoute Compass</span>
            </Link>
            <Link href="/signup" className="btn btn-outline" style={{ padding: "0.65rem 1.3rem", fontSize: "0.86rem" }}>
              <Camera size={15} />
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── QR Scanner Modal Component ── */}
      {showScanner && (
        <DigiRouteQRScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
