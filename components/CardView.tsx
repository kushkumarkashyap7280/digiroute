"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  MapPin as MapPinIcon,
  Home,
  Navigation,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const MapPin = dynamic(() => import("@/components/MapPin"), { ssr: false });

interface Props {
  pin: string;
  coords: { latitude: string; longitude: string } | null;
  card: { title?: string; humanAddress?: string; photoUrls?: string[] } | null;
}

export default function CardView({ pin, coords, card }: Props) {
  const [copied, setCopied] = useState(false);

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success(`Copied DIGIPIN: ${pin}`);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="card text-center" style={{ maxWidth: 420, width: "100%" }}>
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
          <h2 style={{ marginBottom: "0.5rem" }}>Invalid DIGIPIN</h2>
          <p className="text-muted text-sm" style={{ marginBottom: "1.5rem" }}>
            &ldquo;{pin}&rdquo; is not a valid DIGIPIN code.
          </p>
          <Link href="/" className="btn btn-primary btn-sm">
            <ArrowLeft size={14} />
            <span>Back to home</span>
          </Link>
        </div>
      </main>
    );
  }

  const lat = parseFloat(coords.latitude);
  const lon = parseFloat(coords.longitude);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem", width: "100%" }}>
      {/* ── Photos ────────────────────────────── */}
      {card?.photoUrls && card.photoUrls.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: card.photoUrls.length > 1 ? "1fr 1fr" : "1fr",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {card.photoUrls.map((url, i) => (
            <div key={i} style={{ position: "relative", height: 260 }}>
              <Image src={url} alt={`Entrance photo ${i + 1}`} fill style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      {/* No photo placeholder */}
      {(!card?.photoUrls || card.photoUrls.length === 0) && (
        <div
          style={{
            height: 120,
            borderRadius: "var(--radius)",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            marginBottom: "1.25rem",
          }}
        >
          <Home size={44} />
        </div>
      )}

      {/* ── Card info ─────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        {card?.title && <h1 style={{ fontSize: "1.45rem", marginBottom: "0.35rem" }}>{card.title}</h1>}
        {card?.humanAddress && <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>{card.humanAddress}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span className="text-muted text-xs" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            DIGIPIN
          </span>
          <span id="card-digipin" className="digipin-badge" style={{ fontSize: "1.05rem" }}>
            {pin}
          </span>
          <button
            id="copy-digipin-btn"
            onClick={copyPin}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.3rem 0.75rem" }}
          >
            {copied ? (
              <>
                <Check size={13} style={{ color: "var(--success)" }} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-muted text-xs" style={{ marginTop: "0.5rem" }}>
          Coordinates: {coords.latitude}, {coords.longitude}
        </p>
      </div>

      {/* ── Map ───────────────────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <MapPin lat={lat} lon={lon} label={card?.title ?? pin} />
      </div>

      {/* ── Actions ───────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a
          id="navigate-btn"
          href={`https://www.google.com/maps?q=${lat},${lon}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}
        >
          <Navigation size={15} />
          <span>Navigate with Google Maps</span>
          <ExternalLink size={14} />
        </a>
        <Link href="/" className="btn btn-outline">
          <ArrowLeft size={15} />
          <span>Home</span>
        </Link>
      </div>
    </main>
  );
}
