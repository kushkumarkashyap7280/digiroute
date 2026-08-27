"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import {
  Compass,
  MapPin as MapPinIcon,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  Globe2,
  Share2,
  QrCode as QrCodeIcon,
  ArrowRight,
} from "lucide-react";
import DigiRouteQRCodeModal from "@/components/DigiRouteQRCodeModal";

const MapPin = dynamic(() => import("@/components/MapPin"), { ssr: false });

type ToolMode = "gps" | "decode" | "encode";

interface LocationResult {
  digipin: string;
  lat: number;
  lon: number;
  source: string;
}

export default function ConvertToolClient() {
  const [mode, setMode] = useState<ToolMode>("gps");

  // Form states
  const [pinInput, setPinInput] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LocationResult | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedMapLink, setCopiedMapLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // ── Mode 1: GPS Capture ──────────────────────────────────────────────────
  const handleGPSCapture = () => {
    setError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch("/api/digipin/encode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setResult({
            digipin: data.digipin,
            lat,
            lon,
            source: "Live GPS Geolocation",
          });
          toast.success("Location encoded to DIGIPIN!");
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to encode location.";
          setError(msg);
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      },
      () => {
        const msg = "Location access denied or unavailable. Please use the DIGIPIN or Coordinates mode.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Mode 2: DIGIPIN → Coordinates ────────────────────────────────────────
  const handleDecodePIN = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin || cleanPin.length !== 10) {
      const msg = "Please enter a valid 10-character DIGIPIN code.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/digipin/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digipin: cleanPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid DIGIPIN code.");

      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);

      setResult({
        digipin: cleanPin,
        lat,
        lon,
        source: "Decoded from DIGIPIN",
      });
      toast.success(`Resolved ${cleanPin} to coordinates!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to decode DIGIPIN.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Mode 3: Coordinates → DIGIPIN ────────────────────────────────────────
  const handleEncodeCoords = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon)) {
      const msg = "Please enter valid numeric latitude and longitude.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/digipin/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to encode coordinates.");

      setResult({
        digipin: data.digipin,
        lat,
        lon,
        source: "Encoded from Coordinates",
      });
      toast.success(`Generated DIGIPIN: ${data.digipin}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to encode coordinates.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyPin = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.digipin);
    setCopiedPin(true);
    toast.success(`Copied DIGIPIN: ${result.digipin}`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyCoords = () => {
    if (!result) return;
    const text = `${result.lat.toFixed(6)}, ${result.lon.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    toast.success(`Copied coordinates: ${text}`);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const copyMapLink = () => {
    if (!result) return;
    const mapUrl = `https://www.google.com/maps?q=${result.lat},${result.lon}`;
    navigator.clipboard.writeText(mapUrl);
    setCopiedMapLink(true);
    toast.success("Google Maps link copied!");
    setTimeout(() => setCopiedMapLink(false), 2000);
  };

  return (
    <main style={{ position: "relative", minHeight: "calc(100vh - var(--nav-height))", padding: "1.75rem 0.75rem 3.5rem" }}>
      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "var(--orange-subtle)",
              border: "1px solid rgba(249,115,22,0.35)",
              color: "var(--orange)",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.22rem 0.65rem",
              borderRadius: 999,
              marginBottom: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <Compass size={12} />
            <span>DigiRoute Compass</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.35rem, 3.8vw, 2.1rem)", marginBottom: "0.4rem" }}>
            DigiRoute <span style={{ color: "var(--orange)" }}>Compass</span>
          </h1>
          <p className="text-muted" style={{ maxWidth: 480, margin: "0 auto", fontSize: "0.85rem", lineHeight: 1.5 }}>
            Encode coordinates to DIGIPIN, decode 10-char codes to latitude/longitude, or inspect any doorstep on Google Maps.
          </p>
        </div>

        {/* ── Mode selector tabs (100% Mobile Responsive) ─────────────────── */}
        <div
          className="card"
          style={{
            padding: "0.25rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.25rem",
            background: "var(--surface2)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.1rem",
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("gps");
              setError("");
            }}
            disabled={loading}
            className={`btn btn-sm ${mode === "gps" ? "btn-primary" : "btn-ghost"}`}
            style={{
              padding: "0.45rem 0.2rem",
              fontSize: "clamp(0.7rem, 2.2vw, 0.8rem)",
              minWidth: 0,
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <MapPinIcon size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Live GPS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("decode");
              setError("");
            }}
            disabled={loading}
            className={`btn btn-sm ${mode === "decode" ? "btn-primary" : "btn-ghost"}`}
            style={{
              padding: "0.45rem 0.2rem",
              fontSize: "clamp(0.7rem, 2.2vw, 0.8rem)",
              minWidth: 0,
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <Compass size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Decode PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("encode");
              setError("");
            }}
            disabled={loading}
            className={`btn btn-sm ${mode === "encode" ? "btn-primary" : "btn-ghost"}`}
            style={{
              padding: "0.45rem 0.2rem",
              fontSize: "clamp(0.7rem, 2.2vw, 0.8rem)",
              minWidth: 0,
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <Globe2 size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Coordinates</span>
          </button>
        </div>

        {/* ── Input Panel ───────────────────────── */}
        <div className="card" style={{ marginBottom: "1.5rem", border: "1px solid var(--border)", padding: "1.1rem 0.9rem" }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "0.85rem", fontSize: "0.8rem", padding: "0.55rem 0.75rem" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Live GPS */}
          {mode === "gps" && (
            <div style={{ textAlign: "center", padding: "0.5rem 0.25rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--orange-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--orange)",
                  margin: "0 auto 0.85rem",
                }}
              >
                <MapPinIcon size={22} />
              </div>
              <h3 style={{ marginBottom: "0.3rem", fontSize: "1.05rem", fontWeight: 700 }}>Capture My Location</h3>
              <p className="text-muted" style={{ marginBottom: "1.1rem", maxWidth: 360, marginInline: "auto", fontSize: "0.8rem", lineHeight: 1.55 }}>
                Click below to get your exact GPS coordinates and compute your India Post DIGIPIN (~4m accuracy).
              </p>
              <button
                type="button"
                onClick={handleGPSCapture}
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: "0.65rem 1.3rem", fontSize: "0.85rem", width: "100%", maxWidth: 320, justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spinner" />
                    <span>Capturing GPS…</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon size={15} />
                    <span>Get My DIGIPIN Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Decode DIGIPIN */}
          {mode === "decode" && (
            <form onSubmit={handleDecodePIN} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tool-pin" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Enter 10-Character DIGIPIN Code
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <input
                    id="tool-pin"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4T396F42L7"
                    maxLength={10}
                    disabled={loading}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      padding: "0.6rem 0.75rem",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || pinInput.trim().length !== 10}
                    className="btn btn-primary"
                    style={{ padding: "0.65rem 1rem", fontSize: "0.85rem", width: "100%", justifyContent: "center" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="spinner" />
                        <span>Decoding…</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={14} />
                        <span>Decode &amp; View Map</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: "0.72rem", lineHeight: 1.5 }}>
                Allowed characters: 2, 3, 4, 5, 6, 7, 8, 9, C, F, J, K, L, M, P, T (case-insensitive).
              </p>
            </form>
          )}

          {/* Tab 3: Encode Coordinates */}
          {mode === "encode" && (
            <form onSubmit={handleEncodeCoords} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "0.6rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tool-lat" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Latitude
                  </label>
                  <input
                    id="tool-lat"
                    type="text"
                    inputMode="decimal"
                    className="form-input"
                    placeholder="e.g. 28.613939"
                    disabled={loading}
                    value={latInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Smart paste/typing: if string contains comma, space, or slash, split into lat and lon
                      if (val.includes(",") || (val.includes(" ") && val.trim().split(/\s+/).length >= 2)) {
                        const parts = val.split(/[,\s/]+/).filter(Boolean);
                        if (parts.length >= 2) {
                          setLatInput(parts[0]);
                          setLonInput(parts[1]);
                          return;
                        }
                      }
                      setLatInput(val);
                    }}
                    style={{ fontSize: "0.88rem", padding: "0.55rem 0.7rem", fontFamily: "monospace" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tool-lon" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Longitude
                  </label>
                  <input
                    id="tool-lon"
                    type="text"
                    inputMode="decimal"
                    className="form-input"
                    placeholder="e.g. 77.209021"
                    disabled={loading}
                    value={lonInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(",") || (val.includes(" ") && val.trim().split(/\s+/).length >= 2)) {
                        const parts = val.split(/[,\s/]+/).filter(Boolean);
                        if (parts.length >= 2) {
                          setLatInput(parts[0]);
                          setLonInput(parts[1]);
                          return;
                        }
                      }
                      setLonInput(val);
                    }}
                    style={{ fontSize: "0.88rem", padding: "0.55rem 0.7rem", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <p className="text-muted" style={{ fontSize: "0.72rem", margin: 0, lineHeight: 1.4 }}>
                  Enter latitude and longitude directly, or paste a coordinate pair (e.g. <code className="text-orange">28.6139, 77.2090</code>).
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        const parts = text.split(/[,\s/]+/).filter(Boolean);
                        if (parts.length >= 2) {
                          setLatInput(parts[0]);
                          setLonInput(parts[1]);
                          toast.success("Pasted coordinates from clipboard!");
                        } else {
                          toast.error("Clipboard does not contain a valid coordinate pair.");
                        }
                      }
                    } catch {
                      toast.error("Could not read clipboard. Please paste manually.");
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.72rem", padding: "0.2rem 0.4rem" }}
                  title="Paste coordinate pair from clipboard"
                >
                  <span>Paste Pair</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !latInput.trim() || !lonInput.trim()}
                className="btn btn-primary"
                style={{ padding: "0.65rem 1rem", fontSize: "0.85rem", width: "100%", justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spinner" />
                    <span>Encoding…</span>
                  </>
                ) : (
                  <>
                    <Globe2 size={14} />
                    <span>Generate DIGIPIN</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Results Container ─────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="card"
              style={{
                border: "1.5px solid rgba(249,115,22,0.45)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1rem 0.85rem",
                marginBottom: "2rem",
              }}
            >
              {/* Top status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.6rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Sparkles size={14} className="text-orange" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)" }}>
                    {result.source}
                  </span>
                </div>
                <span className="tag" style={{ color: "var(--orange)", borderColor: "rgba(249,115,22,0.3)", fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                  ~4m Precision
                </span>
              </div>

              {/* Badges & Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "0.75rem" }}>
                {/* DIGIPIN card */}
                <div
                  style={{
                    background: "var(--surface2)",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="text-muted" style={{ marginBottom: "0.25rem", fontWeight: 600, fontSize: "0.7rem" }}>
                    DIGIPIN CODE
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
                    <span className="digipin-badge" style={{ fontSize: "1.05rem", padding: "0.25rem 0.6rem" }}>
                      {result.digipin}
                    </span>
                    <button
                      onClick={copyPin}
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.3rem 0.55rem", fontSize: "0.78rem" }}
                      title="Copy DIGIPIN"
                    >
                      {copiedPin ? <Check size={12} style={{ color: "var(--success)" }} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Coordinates card */}
                <div
                  style={{
                    background: "var(--surface2)",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="text-muted" style={{ marginBottom: "0.25rem", fontWeight: 600, fontSize: "0.7rem" }}>
                    CENTRAL COORDINATES
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: "var(--text)", fontSize: "clamp(0.72rem, 2.4vw, 0.82rem)", whiteSpace: "nowrap" }}>
                      {result.lat.toFixed(6)}, {result.lon.toFixed(6)}
                    </span>
                    <button
                      onClick={copyCoords}
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.3rem 0.55rem", fontSize: "0.78rem" }}
                      title="Copy Coordinates"
                    >
                      {copiedCoords ? <Check size={12} style={{ color: "var(--success)" }} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div>
                <MapPin lat={result.lat} lon={result.lon} label={result.digipin} />
              </div>

              {/* Action buttons (Stacked full-width on mobile) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", width: "100%" }}>
                <a
                  href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.65rem 0.85rem", fontSize: "0.84rem" }}
                >
                  <Navigation size={14} />
                  <span>Navigate with Google Maps</span>
                  <ExternalLink size={13} />
                </a>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", width: "100%" }}>
                  <Link
                    href={`/digipin/${result.digipin}`}
                    className="btn btn-outline btn-sm"
                    style={{ padding: "0.55rem 0.35rem", fontSize: "0.76rem", justifyContent: "center" }}
                  >
                    <Compass size={13} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Public View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: "0.55rem 0.35rem", fontSize: "0.76rem", justifyContent: "center" }}
                    title="Generate printable QR Code"
                  >
                    <QrCodeIcon size={13} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyMapLink}
                    className="btn btn-outline btn-sm"
                    style={{ padding: "0.55rem 0.35rem", fontSize: "0.76rem", justifyContent: "center" }}
                  >
                    {copiedMapLink ? (
                      <>
                        <Check size={13} style={{ color: "var(--success)" }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Share Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Modal for Compass Location */}
              {showQrModal && result && (
                <DigiRouteQRCodeModal
                  isOpen={showQrModal}
                  onClose={() => setShowQrModal(false)}
                  url={typeof window !== "undefined" ? `${window.location.origin}/digipin/${result.digipin}` : `/digipin/${result.digipin}`}
                  digipin={result.digipin}
                  title="DigiRoute Location"
                  humanAddress={`${result.lat.toFixed(6)}, ${result.lon.toFixed(6)}`}
                />
              )}

              {/* Upgrade to full entrance card banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 100%)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  textAlign: "left",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.15rem" }}>
                    Want to attach entrance photos &amp; create a shareable card?
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.5 }}>
                    Save this location in your personal dashboard with 1–2 entrance photos.
                  </p>
                </div>
                <Link href="/signup" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", padding: "0.55rem 1rem", fontSize: "0.8rem" }}>
                  <span>Save Address Card</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
