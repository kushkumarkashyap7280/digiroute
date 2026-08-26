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
  ArrowRight,
  PenTool,
  Globe2,
  Share2,
} from "lucide-react";

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
      const msg = "Please enter valid decimal numbers for Latitude and Longitude.";
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
        source: `Encoded from Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
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

  // Copy helpers
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
    <main style={{ position: "relative", minHeight: "calc(100vh - var(--nav-height))", padding: "2.5rem 1rem 4rem" }}>
      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--orange-subtle)",
              border: "1px solid rgba(249,115,22,0.35)",
              color: "var(--orange)",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.75rem",
              borderRadius: 999,
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <Compass size={13} />
            <span>Free Public Tool</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", marginBottom: "0.5rem" }}>
            DIGIPIN &amp; Location <span style={{ color: "var(--orange)" }}>Inspector</span>
          </h1>
          <p className="text-muted text-sm" style={{ maxWidth: 500, margin: "0 auto" }}>
            Convert coordinates to DIGIPIN, decode codes to exact latitude/longitude, or view any point on Google Maps.
          </p>
        </div>

        {/* ── Mode selector tabs ─────────────────── */}
        <div
          className="card"
          style={{
            padding: "0.35rem",
            display: "flex",
            gap: "0.35rem",
            background: "var(--surface2)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.25rem",
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
            style={{ flex: 1, padding: "0.5rem 0.4rem", fontSize: "0.82rem" }}
          >
            <MapPinIcon size={14} />
            <span>Live GPS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("decode");
              setError("");
            }}
            disabled={loading}
            className={`btn btn-sm ${mode === "decode" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, padding: "0.5rem 0.4rem", fontSize: "0.82rem" }}
          >
            <Compass size={14} />
            <span>Decode DIGIPIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("encode");
              setError("");
            }}
            disabled={loading}
            className={`btn btn-sm ${mode === "encode" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, padding: "0.5rem 0.4rem", fontSize: "0.82rem" }}
          >
            <Globe2 size={14} />
            <span>Coordinates</span>
          </button>
        </div>

        {/* ── Input Panel ───────────────────────── */}
        <div className="card" style={{ marginBottom: "1.75rem", border: "1px solid var(--border)" }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Live GPS */}
          {mode === "gps" && (
            <div style={{ textAlign: "center", padding: "1rem 0.5rem" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "var(--orange-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--orange)",
                  margin: "0 auto 1rem",
                }}
              >
                <MapPinIcon size={26} />
              </div>
              <h3 style={{ marginBottom: "0.35rem" }}>Capture My Location</h3>
              <p className="text-muted text-xs" style={{ marginBottom: "1.25rem", maxWidth: 360, marginInline: "auto" }}>
                Click below to get your exact GPS coordinates and compute your India Post DIGIPIN (~4m accuracy).
              </p>
              <button
                type="button"
                onClick={handleGPSCapture}
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: "0.7rem 1.6rem" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Capturing GPS…</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon size={16} />
                    <span>Get My DIGIPIN Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Decode DIGIPIN */}
          {mode === "decode" && (
            <form onSubmit={handleDecodePIN} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tool-pin">
                  Enter 10-Character DIGIPIN Code
                </label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                      flex: 1,
                      minWidth: "160px",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || pinInput.trim().length !== 10}
                    className="btn btn-primary"
                    style={{ padding: "0.65rem 1.4rem" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spinner" />
                        <span>Decoding…</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={15} />
                        <span>Decode &amp; View Map</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-muted text-xs">
                Allowed characters: 2, 3, 4, 5, 6, 7, 8, 9, C, F, J, K, L, M, P, T (case-insensitive).
              </p>
            </form>
          )}

          {/* Tab 3: Encode Coordinates */}
          {mode === "encode" && (
            <form onSubmit={handleEncodeCoords} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tool-lat">
                    Latitude
                  </label>
                  <input
                    id="tool-lat"
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 12.9716"
                    disabled={loading}
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tool-lon">
                    Longitude
                  </label>
                  <input
                    id="tool-lon"
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 77.5946"
                    disabled={loading}
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !latInput || !lonInput}
                className="btn btn-primary"
                style={{ padding: "0.65rem 1.4rem", alignSelf: "flex-start" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Encoding…</span>
                  </>
                ) : (
                  <>
                    <Globe2 size={15} />
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
                gap: "1.25rem",
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
                  gap: "0.5rem",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={16} className="text-orange" />
                  <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
                    {result.source}
                  </span>
                </div>
                <span className="tag" style={{ color: "var(--orange)", borderColor: "rgba(249,115,22,0.3)" }}>
                  ~4m Precision
                </span>
              </div>

              {/* Badges & Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                {/* DIGIPIN card */}
                <div
                  style={{
                    background: "var(--surface2)",
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="text-muted text-xs" style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
                    DIGIPIN CODE
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span className="digipin-badge" style={{ fontSize: "1.2rem", padding: "0.3rem 0.75rem" }}>
                      {result.digipin}
                    </span>
                    <button
                      onClick={copyPin}
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.35rem 0.65rem" }}
                      title="Copy DIGIPIN"
                    >
                      {copiedPin ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Coordinates card */}
                <div
                  style={{
                    background: "var(--surface2)",
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="text-muted text-xs" style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
                    CENTRAL COORDINATES
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span className="font-mono text-sm" style={{ fontWeight: 700, color: "var(--text)" }}>
                      {result.lat.toFixed(6)}, {result.lon.toFixed(6)}
                    </span>
                    <button
                      onClick={copyCoords}
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.35rem 0.65rem" }}
                      title="Copy Coordinates"
                    >
                      {copiedCoords ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div>
                <MapPin lat={result.lat} lon={result.lon} label={result.digipin} />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a
                  href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <Navigation size={15} />
                  <span>Navigate with Google Maps</span>
                  <ExternalLink size={14} />
                </a>

                <Link
                  href={`/digipin/${result.digipin}`}
                  className="btn btn-outline btn-sm"
                  style={{ padding: "0.75rem 1rem" }}
                >
                  <Compass size={14} />
                  <span>Public DIGIPIN View</span>
                </Link>

                <button
                  type="button"
                  onClick={copyMapLink}
                  className="btn btn-outline btn-sm"
                  style={{ padding: "0.75rem 1rem" }}
                >
                  {copiedMapLink ? (
                    <>
                      <Check size={14} style={{ color: "var(--success)" }} />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Copy Maps Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Upgrade to full entrance card banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 100%)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.15rem" }}>
                    Want to attach entrance photos &amp; create a shareable card?
                  </p>
                  <p className="text-muted text-xs">
                    Save this location in your personal dashboard with 1–2 entrance photos.
                  </p>
                </div>
                <Link href="/signup" className="btn btn-primary btn-sm">
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
