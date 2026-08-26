"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  MapPin as MapPinIcon,
  PenTool,
  Home,
  Link2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  X,
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Compass,
} from "lucide-react";

const PAGE_LIMIT = 12;

interface Card {
  _id: string;
  digipin: string;
  title: string;
  photoUrls: string[];
  humanAddress: string;
  createdAt: string;
}

// ── Cloudinary direct-upload helper ─────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<{ url: string; public_id: string }> {
  const signRes = await fetch("/api/upload/sign", { method: "POST" });
  if (!signRes.ok) {
    const d = await signRes.json();
    throw new Error(d.error ?? "Failed to get upload signature.");
  }
  const { timestamp, signature, folder, api_key, cloud_name } = await signRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("api_key", api_key);
  fd.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed.");
  const result = await uploadRes.json();
  return { url: result.secure_url, public_id: result.public_id };
}
// ────────────────────────────────────────────────────────────────────────────

export default function DashboardClient({ userName }: { userName: string }) {
  // List state
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [locationMode, setLocationMode] = useState<"gps" | "manual">("gps");
  const [manualInputType, setManualInputType] = useState<"pin" | "coords">("pin");
  const [manualPin, setManualPin] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [verifyingManual, setVerifyingManual] = useState(false);
  const [verifiedPreview, setVerifiedPreview] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", humanAddress: "" });
  const [photos, setPhotos] = useState<File[]>([]);
  const [currentPin, setCurrentPin] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitStep, setSubmitStep] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch first page ──────────────────────────────────────────────────────
  const fetchCards = useCallback(async (replace = true) => {
    if (replace) {
      setLoading(true);
      setListError("");
    }
    try {
      const res = await fetch(`/api/cards?limit=${PAGE_LIMIT}`);
      if (!res.ok) throw new Error("Failed to load cards.");
      const data = await res.json();
      setCards(data.cards);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error loading cards.";
      setListError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // ── Load next page (cursor) ───────────────────────────────────────────────
  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/cards?cursor=${cursor}&limit=${PAGE_LIMIT}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCards((prev) => [...prev, ...data.cards]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
      toast.success("Loaded more cards");
    } catch {
      toast.error("Failed to load more cards");
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Option 1: Get GPS location → DIGIPIN ──────────────────────────────────
  const getLocation = () => {
    setLocLoading(true);
    setFormError("");
    setVerifiedPreview(null);
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
          setCurrentPin(data.digipin);
          const previewText = `Captured GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
          setVerifiedPreview(previewText);
          toast.success(`Location encoded to ${data.digipin}`);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to get DIGIPIN.";
          setFormError(msg);
          toast.error(msg);
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        const msg = "Location access denied or unavailable. Please use the Manual option below.";
        setFormError(msg);
        toast.error(msg);
        setLocLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Option 2: Verify Manual DIGIPIN / Coordinates ─────────────────────────
  const handleVerifyManual = async () => {
    setFormError("");
    setVerifyingManual(true);
    setVerifiedPreview(null);

    try {
      if (manualInputType === "pin") {
        const cleanPin = manualPin.trim().toUpperCase();
        if (!cleanPin || cleanPin.length !== 10) {
          throw new Error("DIGIPIN must be exactly 10 characters.");
        }
        // Verify via decode API
        const res = await fetch("/api/digipin/decode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ digipin: cleanPin }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid DIGIPIN.");
        setCurrentPin(cleanPin);
        setVerifiedPreview(`Valid DIGIPIN! Resolved to ${data.latitude}, ${data.longitude}`);
        toast.success(`Verified DIGIPIN ${cleanPin}!`);
      } else {
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Please enter valid decimal numbers for Latitude and Longitude.");
        }
        // Encode via encode API
        const res = await fetch("/api/digipin/encode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to encode coordinates.");
        setCurrentPin(data.digipin);
        setVerifiedPreview(`Encoded to ${data.digipin} for (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        toast.success(`Coordinates encoded to ${data.digipin}!`);
      }
    } catch (err: unknown) {
      setCurrentPin("");
      const msg = err instanceof Error ? err.message : "Validation failed.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setVerifyingManual(false);
    }
  };

  // ── Submit: save card ─────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!currentPin) {
      const msg = "Please set a valid DIGIPIN location first (using GPS or Manual entry).";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!form.title.trim()) {
      const msg = "Title is required.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setSubmitLoading(true);
    let photoUrls: string[] = [];
    let photoIds: string[] = [];

    try {
      if (photos.length > 0) {
        setSubmitStep("Uploading photos to Cloudinary…");
        const results = await Promise.all(photos.map(uploadToCloudinary));
        photoUrls = results.map((r) => r.url);
        photoIds = results.map((r) => r.public_id);
      }

      setSubmitStep("Saving address card…");
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          digipin: currentPin,
          title: form.title.trim(),
          photoUrls,
          photoIds,
          humanAddress: form.humanAddress.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Address Card saved successfully!");

      // Reset
      setShowForm(false);
      setForm({ title: "", humanAddress: "" });
      setManualPin("");
      setManualLat("");
      setManualLon("");
      setPhotos([]);
      setCurrentPin("");
      setVerifiedPreview(null);
      setSubmitStep("");
      if (fileRef.current) fileRef.current.value = "";
      fetchCards(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save card.";
      setFormError(msg);
      toast.error(msg);
      setSubmitStep("");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteCard = async (id: string) => {
    if (!confirm("Delete this address card? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c._id !== id));
        toast.success("Card deleted.");
      } else {
        toast.error("Failed to delete card.");
      }
    } catch {
      toast.error("Failed to delete card.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Copy share link ───────────────────────────────────────────────────────
  const copyLink = (cardId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/location/${cardId}`);
    setCopiedId(cardId);
    toast.success("Location card share link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main style={{ padding: "1.5rem 1rem", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", marginBottom: "0.2rem" }}>My Address Cards</h1>
          <p className="text-muted text-sm">
            Hey <strong style={{ color: "var(--text)" }}>{userName.split(" ")[0]}</strong> — manage your saved DIGIPIN locations
          </p>
        </div>
        <button
          id="new-card-btn"
          onClick={() => {
            setShowForm((s) => !s);
            setFormError("");
          }}
          disabled={submitLoading}
          className={`btn ${showForm ? "btn-outline" : "btn-primary"} btn-sm`}
        >
          {showForm ? (
            <>
              <X size={14} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>New Address Card</span>
            </>
          )}
        </button>
      </div>

      {listError && (
        <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
          <AlertCircle size={16} />
          <span>{listError}</span>
        </div>
      )}

      {/* ── Create form ─────────────────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: "2rem", border: "1px solid rgba(249,115,22,0.4)" }}>
          <h3 style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPinIcon size={18} className="text-orange" />
            <span>New Address Card</span>
          </h3>

          {formError && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}
          {verifiedPreview && (
            <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
              <CheckCircle2 size={16} />
              <span>{verifiedPreview}</span>
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Location mode switcher */}
            <div>
              <p className="form-label" style={{ marginBottom: "0.5rem" }}>
                Step 1 — Set DIGIPIN Location *
              </p>

              {/* Mode switch tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  background: "var(--surface2)",
                  padding: "0.3rem",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "0.75rem",
                  maxWidth: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLocationMode("gps")}
                  disabled={submitLoading || locLoading}
                  className={`btn btn-sm ${locationMode === "gps" ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.82rem" }}
                >
                  <Compass size={13} />
                  <span>Auto GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("manual")}
                  disabled={submitLoading || verifyingManual}
                  className={`btn btn-sm ${locationMode === "manual" ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.82rem" }}
                >
                  <PenTool size={13} />
                  <span>Manual Entry</span>
                </button>
              </div>

              {/* GPS Mode */}
              {locationMode === "gps" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    id="get-location-btn"
                    onClick={getLocation}
                    disabled={locLoading || submitLoading}
                    className="btn btn-outline btn-sm"
                  >
                    {locLoading ? (
                      <>
                        <Loader2 size={14} className="spinner" />
                        <span>Getting GPS…</span>
                      </>
                    ) : (
                      <>
                        <MapPinIcon size={14} />
                        <span>Capture Current Location</span>
                      </>
                    )}
                  </button>
                  {currentPin && <span id="current-pin" className="digipin-badge">{currentPin}</span>}
                </div>
              )}

              {/* Manual Mode */}
              {locationMode === "manual" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="manualType"
                        checked={manualInputType === "pin"}
                        onChange={() => setManualInputType("pin")}
                        disabled={submitLoading || verifyingManual}
                      />
                      10-Char DIGIPIN Code
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", marginLeft: "0.75rem" }}>
                      <input
                        type="radio"
                        name="manualType"
                        checked={manualInputType === "coords"}
                        onChange={() => setManualInputType("coords")}
                        disabled={submitLoading || verifyingManual}
                      />
                      Latitude / Longitude
                    </label>
                  </div>

                  {manualInputType === "pin" ? (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 4T396F42L7"
                        maxLength={10}
                        disabled={submitLoading || verifyingManual}
                        value={manualPin}
                        onChange={(e) => setManualPin(e.target.value.toUpperCase())}
                        style={{ flex: 1, minWidth: "160px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyManual}
                        disabled={verifyingManual || manualPin.length !== 10 || submitLoading}
                        className="btn btn-outline btn-sm"
                      >
                        {verifyingManual ? (
                          <>
                            <Loader2 size={13} className="spinner" />
                            <span>Verifying…</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Verify PIN</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        placeholder="Lat (e.g. 12.9716)"
                        disabled={submitLoading || verifyingManual}
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        style={{ flex: 1, minWidth: "120px" }}
                      />
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        placeholder="Lon (e.g. 77.5946)"
                        disabled={submitLoading || verifyingManual}
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        style={{ flex: 1, minWidth: "120px" }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyManual}
                        disabled={verifyingManual || !manualLat || !manualLon || submitLoading}
                        className="btn btn-outline btn-sm"
                      >
                        {verifyingManual ? (
                          <>
                            <Loader2 size={13} className="spinner" />
                            <span>Converting…</span>
                          </>
                        ) : (
                          <span>Convert to DIGIPIN</span>
                        )}
                      </button>
                    </div>
                  )}

                  {currentPin && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="text-xs text-muted">Active PIN:</span>
                      <span className="digipin-badge">{currentPin}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-title">
                Step 2 — Title *
              </label>
              <input
                id="card-title"
                type="text"
                className="form-input"
                required
                disabled={submitLoading}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Home back gate, Office entrance"
              />
            </div>

            {/* Human address */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-address">
                Human Address <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none" }}>(optional — display only)</span>
              </label>
              <input
                id="card-address"
                type="text"
                className="form-input"
                disabled={submitLoading}
                value={form.humanAddress}
                onChange={(e) => setForm((f) => ({ ...f, humanAddress: e.target.value }))}
                placeholder="e.g. 42 MG Road, Bengaluru"
              />
            </div>

            {/* Photos */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-photos" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Upload size={12} />
                <span>Entrance Photos</span>
                <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none" }}>(optional · max 2 · JPEG/PNG/WebP)</span>
              </label>
              <input
                id="card-photos"
                type="file"
                ref={fileRef}
                disabled={submitLoading}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="form-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 2);
                  setPhotos(files);
                }}
              />
              {photos.length > 0 && <p className="text-muted text-xs">{photos.length} file{photos.length > 1 ? "s" : ""} selected</p>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <button
                id="save-card-btn"
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading || !currentPin}
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>{submitStep || "Saving…"}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Address Card</span>
                  </>
                )}
              </button>
              {submitLoading && <span className="text-muted text-sm">{submitStep}</span>}
            </div>
          </form>
        </div>
      )}

      {/* ── Card grid ───────────────────────────── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--orange)",
            }}
          >
            <MapPinIcon size={28} />
          </div>
          <p className="empty-state__title">No address cards yet</p>
          <p className="empty-state__body">
            Create your first card — capture GPS or enter a DIGIPIN manually, add a title, and share precise links.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
            style={{ marginTop: "0.5rem" }}
          >
            <Plus size={14} />
            <span>Create First Card</span>
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
              gap: "1rem",
              width: "100%",
            }}
          >
            {cards.map((card) => (
              <div key={card._id} className="address-card">
                {/* Photo (Only rendered when user attached photo) */}
                {card.photoUrls && card.photoUrls[0] ? (
                  <div className="address-card__photo">
                    <Image
                      src={card.photoUrls[0]}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : null}

                <div className="address-card__body">
                  <p className="address-card__title">{card.title}</p>
                  {card.humanAddress && <p className="address-card__addr">{card.humanAddress}</p>}
                  <span className="digipin-badge" style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}>
                    {card.digipin}
                  </span>
                </div>

                <div className="address-card__footer">
                  <Link
                    href={`/location/${card._id}`}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => copyLink(card._id)}
                    className="btn btn-outline btn-icon"
                    title="Copy share link"
                  >
                    {copiedId === card._id ? (
                      <Check size={14} style={{ color: "var(--success)" }} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => deleteCard(card._id)}
                    disabled={deletingId === card._id}
                    className="btn btn-danger btn-icon"
                    title="Delete card"
                  >
                    {deletingId === card._id ? (
                      <Loader2 size={14} className="spinner" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Load more ─────────────────────────── */}
          {hasMore && (
            <div className="load-more-wrap">
              <button
                id="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn btn-outline btn-sm"
                style={{ minWidth: 150 }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="spinner" />
                    <span>Loading…</span>
                  </>
                ) : (
                  <span>Load more cards</span>
                )}
              </button>
            </div>
          )}

          <p className="text-muted text-xs text-center" style={{ marginTop: "1rem" }}>
            Showing {cards.length} card{cards.length !== 1 ? "s" : ""}
            {hasMore ? " — click load more for older pins" : " — all cards loaded"}
          </p>
        </>
      )}
    </main>
  );
}
