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
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import TypewriterTagline from "@/components/TypewriterTagline";
import DigiRouteQRScannerModal from "@/components/DigiRouteQRScannerModal";

// FAQs data
const FAQS = [
  {
    q: "What is India Post DIGIPIN?",
    a: "DIGIPIN (Digital Postal Index Number) is an open alphanumeric geo-coded addressing standard created by the Department of Posts (CEPT). It divides India into precise ~4m × 4m bounding cells, providing an exact alphanumeric code for any location.",
  },
  {
    q: "How does DigiRoute solve doorstep delivery confusion?",
    a: "Standard navigation apps frequently direct drivers to the backside of a property or an inaccessible street. DigiRoute pairs exact ~4m DIGIPIN entrance coordinates with verified photos of the actual gate or doorway so visitors and couriers recognize your entrance immediately.",
  },
  {
    q: "What is DigiRoute Compass?",
    a: "DigiRoute Compass is our free, public location inspector. You can convert latitude/longitude into a 10-character DIGIPIN, decode codes to coordinates, capture live GPS, and view interactive Google Maps without registering or logging in.",
  },
  {
    q: "Do I need an account to use DigiRoute Compass?",
    a: "No. DigiRoute Compass is 100% free and accessible to anyone without an account. Creating a free account is only needed if you want to save permanent address cards with entrance photos.",
  },
  {
    q: "What is the difference between /digipin/ and /location/ links?",
    a: "`/digipin/CODE` is a public algorithmic map inspector for any 10-character DIGIPIN code. `/location/ID` is a dedicated address card created by a registered user that includes verified entrance photos, custom title, and human-readable address.",
  },
];

export default function HomeClient() {
  // FAQ accordion state (all closed initially, only 1 open at a time)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      {/* Dynamic molecular particle background */}
      <ParticleBackground />

      {/* ── 1. HERO SECTION ───────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4.5rem 1rem 3.5rem",
          maxWidth: 950,
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
            fontSize: "0.78rem",
            fontWeight: 700,
            padding: "0.3rem 0.85rem",
            borderRadius: 999,
            marginBottom: "1.5rem",
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
            fontSize: "clamp(1.85rem, 5.2vw, 3.4rem)",
            fontWeight: 900,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
            textAlign: "center",
          }}
        >
          <TypewriterTagline
            prefix="Share your exact"
            words={["gate.", "doorstep.", "location.", "entrance."]}
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: "1.05rem",
            color: "var(--muted)",
            maxWidth: 620,
            margin: "0 auto 2.25rem",
            lineHeight: 1.7,
          }}
        >
          Convert coordinates into reversible 10-character DIGIPINs, attach real gate photos, and guide visitors
          directly to your doorstep on Google Maps.
        </motion.p>

        {/* Action Buttons: Try Compass + Scan QR Pass + Create Address Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          {/* Primary Compass Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/convert"
              className="btn btn-primary"
              id="try-compass-btn"
              style={{ fontSize: "0.92rem", padding: "0.75rem 1.4rem" }}
            >
              <Compass size={16} />
              <span>DigiRoute Compass</span>
              <ArrowRight size={15} />
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
                fontSize: "0.92rem",
                padding: "0.75rem 1.4rem",
                border: "1.5px solid rgba(249,115,22,0.6)",
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
              style={{ fontSize: "0.92rem", padding: "0.75rem 1.4rem" }}
            >
              <Camera size={15} />
              <span>Create Address Card</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. WHAT IS DIGIROUTE (3 KEY PILLARS) ─── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 1rem 4rem",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--orange)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.4rem",
            }}
          >
            How It Works
          </p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800 }}>
            Precision Doorstep Navigation in 3 Steps
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Compass size={22} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>1. 10-Char DIGIPIN Code</h3>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
              India Post&apos;s CEPT standard breaks the map into 4m × 4m cells, assigning a unique alphanumeric code to
              any exact entrance.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={22} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>2. Attach Doorway Photos</h3>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
              Snap real photos of your gate, door, or landmark so delivery drivers instantly recognize the right entrance
              on arrival.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-sm)",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 size={22} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>3. Share One Link</h3>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
              Share your dedicated address card link (<code style={{ color: "var(--orange)" }}>/location/id</code>) or a pure
              DIGIPIN code (<code style={{ color: "var(--orange)" }}>/digipin/CODE</code>) with integrated Google Maps.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE FAQ ACCORDION (Small uniform text on phone screens) ─── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "1rem 1rem 5rem",
          maxWidth: 760,
          margin: "0 auto",
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
            Questions &amp; Answers
          </p>
          <h2 style={{ fontSize: "clamp(1.35rem, 3.2vw, 1.85rem)", fontWeight: 800 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  border: isOpen ? "1.5px solid rgba(249,115,22,0.45)" : "1px solid var(--border)",
                  transition: "border-color 0.2s",
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
                    padding: "0.75rem 0.85rem",
                    background: isOpen ? "var(--surface2)" : "transparent",
                    border: "none",
                    color: "var(--text)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    lineHeight: 1.4,
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "0.6rem",
                  }}
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", alignItems: "center", color: isOpen ? "var(--orange)" : "var(--muted)", flexShrink: 0 }}
                  >
                    <ChevronDown size={15} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      <div
                        style={{
                          padding: "0.45rem 0.85rem 0.85rem",
                          color: "var(--muted)",
                          fontSize: "0.78rem",
                          lineHeight: 1.55,
                          borderTop: "1px solid var(--border)",
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
