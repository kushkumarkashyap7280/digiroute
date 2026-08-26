"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Compass,
  MapPin as MapPinIcon,
  Navigation,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Share2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const MapPin = dynamic(() => import("@/components/MapPin"), { ssr: false });

interface Props {
  pin: string;
  coords: { latitude: string; longitude: string } | null;
}

export default function DigipinView({ pin, coords }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success(`Copied DIGIPIN: ${pin}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/digipin/${pin}`);
    setCopiedLink(true);
    toast.success("DIGIPIN share link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!coords) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div className="card text-center" style={{ maxWidth: 440, width: "100%" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--danger)",
              margin: "0 auto 1rem",
            }}
          >
            <AlertTriangle size={30} />
          </div>
          <h2 style={{ marginBottom: "0.5rem" }}>Invalid DIGIPIN Code</h2>
          <p className="text-muted text-sm" style={{ marginBottom: "1.5rem" }}>
            &ldquo;{pin}&rdquo; is not a valid 10-character India Post DIGIPIN.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/convert" className="btn btn-primary btn-sm">
              <Compass size={14} />
              <span>Open DigiRoute Compass</span>
            </Link>
            <Link href="/" className="btn btn-outline btn-sm">
              <ArrowLeft size={14} />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const lat = parseFloat(coords.latitude);
  const lon = parseFloat(coords.longitude);

  return (
    <main style={{ maxWidth: 740, margin: "0 auto", padding: "2rem 1rem 4rem", width: "100%" }}>
      {/* Top Breadcrumb & Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <Link href="/" className="text-muted text-xs" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <ArrowLeft size={13} />
          <span>DigiRoute Home</span>
        </Link>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: "var(--orange-subtle)",
            color: "var(--orange)",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.2rem 0.6rem",
            borderRadius: 999,
          }}
        >
          <Compass size={12} />
          <span>Public DIGIPIN Point (~4m Precision)</span>
        </span>
      </div>

      {/* ── Main PIN Card ─────────────────────── */}
      <div className="card" style={{ marginBottom: "1.25rem", border: "1.5px solid rgba(249,115,22,0.4)" }}>
        <p className="text-muted text-xs" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          India Post Standard DIGIPIN
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <span id="card-digipin" className="digipin-badge" style={{ fontSize: "1.4rem", padding: "0.45rem 1rem", letterSpacing: "0.15em" }}>
            {pin}
          </span>
          <button
            id="copy-digipin-btn"
            onClick={copyPin}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.45rem 0.85rem" }}
            title="Copy DIGIPIN"
          >
            {copied ? (
              <>
                <Check size={13} style={{ color: "var(--success)" }} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            onClick={copyShareLink}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.45rem 0.85rem" }}
            title="Share this DIGIPIN Link"
          >
            {copiedLink ? (
              <>
                <Check size={13} style={{ color: "var(--success)" }} />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>

        <div
          style={{
            background: "var(--surface2)",
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            color: "var(--muted)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>
            Coordinates: <strong style={{ color: "var(--text)", fontFamily: "monospace" }}>{coords.latitude}, {coords.longitude}</strong>
          </span>
          <span>Resolution: ~4m × 4m bounding grid</span>
        </div>
      </div>

      {/* ── Google Map View ───────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <MapPin lat={lat} lon={lon} label={`DIGIPIN: ${pin}`} />
      </div>

      {/* ── Actions ───────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <a
          id="navigate-btn"
          href={`https://www.google.com/maps?q=${lat},${lon}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1rem" }}
        >
          <Navigation size={15} />
          <span>Navigate with Google Maps</span>
          <ExternalLink size={14} />
        </a>

        <Link href="/convert" className="btn btn-outline" style={{ padding: "0.75rem 1rem" }}>
          <Compass size={14} />
          <span>DigiRoute Compass</span>
        </Link>
      </div>

      {/* ── CTA to Create Address Card with Photos ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 100%)",
          border: "1px solid rgba(249,115,22,0.35)",
          borderRadius: "var(--radius-sm)",
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--orange)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            <Sparkles size={15} />
            <span>Create a Permanent Address Card</span>
          </div>
          <p className="text-muted text-xs" style={{ lineHeight: 1.6 }}>
            Want to save this spot with photos of your real gate/doorway, give it a custom name, and manage multiple entrance cards?
          </p>
        </div>
        <Link href="/signup" className="btn btn-primary btn-sm">
          <span>Create Free Account</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
