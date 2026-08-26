"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import {
  MapPin as MapPinIcon,
  Compass,
  Camera,
  Share2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
  Search,
} from "lucide-react";

export default function HomeClient() {
  return (
    <main style={{ position: "relative", overflow: "hidden" }}>
      {/* Dynamic lightweight animated particles & compound background */}
      <ParticleBackground />

      {/* ── Hero ─────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4.5rem 1rem 3rem",
          textAlign: "center",
        }}
      >
        <div className="hero-glow" />
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1.5rem",
              background: "var(--orange-subtle)",
              border: "1px solid rgba(249,115,22,0.35)",
              borderRadius: 999,
              padding: "0.35rem 1rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--orange-light)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              boxShadow: "0 4px 18px var(--orange-subtle)",
            }}
          >
            <Compass size={14} />
            <span>DIGIPIN · ~4m precision · India Post open standard</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: "1.25rem" }}
          >
            Stop sharing the <span style={{ color: "var(--orange)" }}>wrong gate</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "1.12rem",
              color: "var(--muted)",
              maxWidth: 560,
              margin: "0 auto 2.25rem",
              lineHeight: 1.7,
            }}
          >
            Encode any location into a reversible 10-character DIGIPIN, attach photos of your real entrance, and share one
            link so visitors navigate directly to your door without confusion.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/convert"
                className="btn btn-primary"
                id="hero-try-service-btn"
                style={{ fontSize: "0.95rem", padding: "0.75rem 1.6rem" }}
              >
                <Compass size={16} />
                <span>Try Our Free Service</span>
                <ArrowRight size={15} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/signup" className="btn btn-outline" style={{ fontSize: "0.95rem", padding: "0.75rem 1.6rem" }}>
                <Camera size={15} />
                <span>Create Address Card</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Service Preview Banner ──────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 1rem 3rem", maxWidth: 900, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card"
          style={{
            background: "linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)",
            border: "1.5px solid rgba(249,115,22,0.35)",
            padding: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: 4,
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}
            >
              <Search size={12} />
              <span>Universal Converter &amp; Google Map Inspector</span>
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.35rem" }}>
              Convert DIGIPIN, Coordinates &amp; Live GPS Online
            </h3>
            <p className="text-muted text-xs" style={{ lineHeight: 1.6 }}>
              No login required. Decode any 10-char DIGIPIN, calculate coordinates, view on Google Maps, or copy
              navigation links instantly.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link href="/convert" className="btn btn-primary btn-sm">
              <span>Open Public Tool</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 3D Isometric Technology Showcase ─────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "2rem 1rem", maxWidth: 1080, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "2rem",
            alignItems: "center",
            padding: "2rem 1.5rem",
            background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)",
            border: "1px solid rgba(249,115,22,0.25)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.65rem",
                borderRadius: 6,
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              <Zap size={12} />
              <span>4m × 4m Sub-Grid Precision</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.8rem)", marginBottom: "0.75rem" }}>
              Engineered for Exact Doorstep Delivery
            </h2>
            <p className="text-muted text-sm" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Traditional GPS pins and text addresses often drift by 15–20 meters. DIGIPIN partitions the Indian
              geographic bounding box into hierarchical 4×4 grids, locking your destination to a specific gate.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={16} className="text-orange" />
                <span>Zero Private Data Shared</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Globe2 size={16} className="text-orange" />
                <span>Reversible Offline Standard</span>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 260,
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
            }}
          >
            <Image
              src="/images/hero_isometric.jpg"
              alt="DigiRoute 3D Isometric Navigation Network"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* ── Entrance Doorstep Showcase ───────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "2rem 1rem 3.5rem", maxWidth: 1080, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "2rem",
            alignItems: "center",
            padding: "2rem 1.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 260,
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
              order: 2,
            }}
          >
            <Image
              src="/images/entrance_doorstep.jpg"
              alt="Entrance Gate Photo with DIGIPIN Target"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div style={{ order: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--orange-subtle)",
                color: "var(--orange)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.65rem",
                borderRadius: 6,
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              <Camera size={12} />
              <span>Photo + Precision Coordinates</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.8rem)", marginBottom: "0.75rem" }}>
              Recognize the Entrance Before You Arrive
            </h2>
            <p className="text-muted text-sm" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Pairing a 10-character code with 1–2 photos of your real gate or entrance doorway eliminates confusion for
              delivery drivers, guests, and emergency services.
            </p>
            <Link href="/signup" className="btn btn-primary btn-sm">
              <span>Create Your Entrance Card</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4rem 1rem",
          borderTop: "1px solid var(--border)",
          background: "var(--bg2)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>How DigiRoute works</h2>
          <p className="text-muted" style={{ marginBottom: "2.5rem" }}>
            Three steps. One precise link.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.25rem" }}>
            {[
              {
                n: "01",
                icon: <MapPinIcon size={26} className="text-orange" />,
                title: "Get your DIGIPIN",
                body: "Browser geolocation converts to a 10-char code with ~4m precision. Server-side encoding via India Post open standard.",
              },
              {
                n: "02",
                icon: <Camera size={26} className="text-orange" />,
                title: "Snap your entrance",
                body: "Upload 1–2 photos of the actual gate or door so visitors recognize it before they even arrive.",
              },
              {
                n: "03",
                icon: <Share2 size={26} className="text-orange" />,
                title: "Share one link",
                body: "Share your dedicated /location/id link with door photos and map navigation, or share your pure /digipin/CODE instantly.",
              },
            ].map(({ n, icon, title, body }, idx) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -4 }}
                className="card"
                style={{ textAlign: "left", position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-8px",
                    fontSize: "4.5rem",
                    fontWeight: 900,
                    color: "var(--orange-subtle)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {n}
                </div>
                <div style={{ marginBottom: "0.75rem" }}>{icon}</div>
                <h3 style={{ marginBottom: "0.4rem" }}>{title}</h3>
                <p className="text-muted text-sm" style={{ lineHeight: 1.65 }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "4rem 1rem", textAlign: "center", background: "var(--bg)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--orange)",
              margin: "0 auto 1rem",
            }}
          >
            <Sparkles size={22} />
          </div>
          <h2 style={{ marginBottom: "0.75rem" }}>Ready to share precisely?</h2>
          <p className="text-muted" style={{ marginBottom: "1.75rem" }}>
            Test our public tool or create a free account to save and share your entrance with real photos.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/convert" className="btn btn-outline" style={{ fontSize: "0.95rem", padding: "0.75rem 1.6rem" }}>
              <Compass size={15} />
              <span>Try Our Service</span>
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: "0.95rem", padding: "0.75rem 1.6rem" }}>
              <span>Create Free Account</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
