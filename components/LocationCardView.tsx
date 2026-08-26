"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
  Camera,
  Calendar,
} from "lucide-react";

const MapPin = dynamic(() => import("@/components/MapPin"), { ssr: false });

interface CardData {
  _id: string;
  digipin: string;
  title: string;
  humanAddress?: string;
  photoUrls?: string[];
  createdAt?: string;
}

interface Props {
  card: CardData | null;
  coords: { latitude: string; longitude: string } | null;
}

export default function LocationCardView({ card, coords }: Props) {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    toast.success(`Copied DIGIPIN: ${pin}`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyShareLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/location/${id}`);
    setCopiedLink(true);
    toast.success("Location share link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!card || !coords) {
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
          <h2 style={{ marginBottom: "0.5rem" }}>Location Card Not Found</h2>
          <p className="text-muted text-sm" style={{ marginBottom: "1.5rem" }}>
            This address card does not exist or may have been removed by its owner.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/convert" className="btn btn-primary btn-sm">
              <Compass size={14} />
              <span>DigiRoute Compass</span>
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
  const hasPhotos = card.photoUrls && card.photoUrls.length > 0;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 4rem", width: "100%" }}>
      {/* Top breadcrumb & badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <Link href="/dashboard" className="text-muted text-xs" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <ArrowLeft size={13} />
          <span>Back to Dashboard</span>
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
          <MapPinIcon size={12} />
          <span>Verified Address Card</span>
        </span>
      </div>

      {/* ── Entrance Photos (Render ONLY if photos are attached) ── */}
      {hasPhotos && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: card.photoUrls!.length > 1 ? "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" : "1fr",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {card.photoUrls!.map((url, i) => (
            <div key={i} style={{ position: "relative", height: 260, borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <Image
                src={url}
                alt={`${card.title} entrance photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Camera size={11} />
                <span>Entrance Photo {i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Card Details ──────────────────────── */}
      <div className="card" style={{ marginBottom: "1.25rem", border: "1.5px solid rgba(249,115,22,0.4)" }}>
        <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)", marginBottom: "0.35rem" }}>{card.title}</h1>
        {card.humanAddress && (
          <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>
            {card.humanAddress}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span className="text-muted text-xs" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            DIGIPIN
          </span>
          <span id="card-digipin" className="digipin-badge" style={{ fontSize: "1.15rem", padding: "0.35rem 0.85rem" }}>
            {card.digipin}
          </span>
          <button
            id="copy-digipin-btn"
            onClick={() => copyPin(card.digipin)}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.35rem 0.75rem" }}
            title="Copy DIGIPIN"
          >
            {copiedPin ? (
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
            onClick={() => copyShareLink(card._id)}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.35rem 0.75rem" }}
            title="Copy Share Link"
          >
            {copiedLink ? (
              <>
                <Check size={13} style={{ color: "var(--success)" }} />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share Card</span>
              </>
            )}
          </button>
        </div>

        <p className="text-muted text-xs" style={{ marginTop: "0.5rem" }}>
          Coordinates: {coords.latitude}, {coords.longitude} · ~4m precision
        </p>
      </div>

      {/* ── Google Map ────────────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <MapPin lat={lat} lon={lon} label={card.title} />
      </div>

      {/* ── Action Buttons ────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a
          id="navigate-btn"
          href={`https://www.google.com/maps?q=${lat},${lon}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1rem" }}
        >
          <Navigation size={15} />
          <span>Navigate to Gate with Google Maps</span>
          <ExternalLink size={14} />
        </a>

        <Link href={`/digipin/${card.digipin}`} className="btn btn-outline" style={{ padding: "0.75rem 1rem" }}>
          <Compass size={14} />
          <span>Public DIGIPIN View</span>
        </Link>
      </div>
    </main>
  );
}
