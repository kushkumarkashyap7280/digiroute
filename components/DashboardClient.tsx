"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import QueryProvider from "@/components/QueryProvider";
import ImageDropzone from "@/components/ImageDropzone";
import {
  MapPin as MapPinIcon,
  PenTool,
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
  Pencil,
  Image as ImageIcon,
  QrCode as QrCodeIcon,
} from "lucide-react";
import { uploadToCloudinary, getThumbnailUrl } from "@/lib/cloudinaryClient";
import DigiRouteQRCodeModal from "@/components/DigiRouteQRCodeModal";

interface Card {
  _id: string;
  digipin: string;
  title: string;
  photoUrls: string[];
  photoIds?: string[];
  humanAddress: string;
  createdAt: string;
}

// ── TanStack Query fetcher function (10 at a time, cursor-based) ───────────
async function fetchCardsPage({ pageParam }: { pageParam?: string }) {
  const url = pageParam
    ? `/api/cards?cursor=${pageParam}&limit=10`
    : `/api/cards?limit=10`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to load cards.");
  }
  return res.json() as Promise<{
    cards: Card[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
}

function DashboardContent({ userName }: { userName: string }) {
  const queryClient = useQueryClient();

  // ── TanStack Query useInfiniteQuery ─────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["cards"],
    queryFn: fetchCardsPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const cards = data?.pages.flatMap((page) => page.cards) ?? [];

  // Local card action states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCardData, setQrCardData] = useState<{ url: string; digipin: string; title: string; humanAddress?: string } | null>(null);

  // Edit / Update card state
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editForm, setEditForm] = useState({ title: "", humanAddress: "", digipin: "" });
  const [existingPhotos, setExistingPhotos] = useState<{ url: string; id?: string }[]>([]);
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

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

  // ── Open Edit Modal ──────────────────────────────────────────────────────
  const handleOpenEdit = (card: Card) => {
    setEditingCard(card);
    setEditForm({
      title: card.title,
      humanAddress: card.humanAddress || "",
      digipin: card.digipin,
    });
    const mapped = (card.photoUrls || []).map((url, i) => ({
      url,
      id: card.photoIds?.[i],
    }));
    setExistingPhotos(mapped);
    setEditPhotos([]);
    setUpdateError("");
  };

  // ── Remove an existing photo from the editing card ────────────────────────
  const handleRemoveExistingPhoto = (indexToRemove: number) => {
    setExistingPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.info("Photo removed from card. Click 'Save Changes' to apply.");
  };

  // ── Submit Update Card ───────────────────────────────────────────────────
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    if (!editForm.title.trim()) {
      setUpdateError("Title is required.");
      return;
    }
    if (!editForm.digipin.trim() || editForm.digipin.trim().length !== 10) {
      setUpdateError("Valid 10-character DIGIPIN is required.");
      return;
    }

    const totalCount = existingPhotos.length + editPhotos.length;
    if (totalCount > 2) {
      setUpdateError("Maximum 2 entrance photos allowed in total.");
      return;
    }

    setUpdateError("");
    setUpdateLoading(true);

    try {
      const finalUrls: string[] = existingPhotos.map((p) => p.url);
      const finalIds: string[] = existingPhotos.map((p) => p.id).filter(Boolean) as string[];

      if (editPhotos.length > 0) {
        for (const file of editPhotos) {
          const { url, public_id } = await uploadToCloudinary(file);
          finalUrls.push(url);
          finalIds.push(public_id);
        }
      }

      const res = await fetch(`/api/cards/${editingCard._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          humanAddress: editForm.humanAddress.trim(),
          digipin: editForm.digipin.trim().toUpperCase(),
          photoUrls: finalUrls,
          photoIds: finalIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update card.");

      toast.success("Address card and photos updated successfully!");
      setEditingCard(null);
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error updating card.";
      setUpdateError(msg);
      toast.error(msg);
    } finally {
      setUpdateLoading(false);
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
          throw new Error("Please enter a valid 10-character DIGIPIN code.");
        }
        const res = await fetch("/api/digipin/decode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ digipin: cleanPin }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid DIGIPIN code.");

        setCurrentPin(cleanPin);
        setVerifiedPreview(`Valid DIGIPIN (${parseFloat(data.latitude).toFixed(6)}, ${parseFloat(data.longitude).toFixed(6)})`);
        toast.success(`DIGIPIN ${cleanPin} verified!`);
      } else {
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Please enter valid numeric latitude and longitude.");
        }

        const res = await fetch("/api/digipin/encode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to encode coordinates.");

        setCurrentPin(data.digipin);
        setVerifiedPreview(`Converted: ${lat.toFixed(6)}, ${lon.toFixed(6)} → ${data.digipin}`);
        toast.success(`Generated DIGIPIN ${data.digipin}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Manual verification failed.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setVerifyingManual(false);
    }
  };

  // ── Create card ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPin) {
      setFormError("Please capture your location or verify a valid DIGIPIN first.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setFormError("");
    setSubmitLoading(true);
    const photoUrls: string[] = [];
    const photoIds: string[] = [];

    try {
      if (photos.length > 0) {
        setSubmitStep(`Uploading ${photos.length} entrance photo${photos.length > 1 ? "s" : ""}…`);
        for (const file of photos) {
          const { url, public_id } = await uploadToCloudinary(file);
          photoUrls.push(url);
          photoIds.push(public_id);
        }
      }

      setSubmitStep("Saving address card…");
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          digipin: currentPin,
          title: form.title.trim(),
          humanAddress: form.humanAddress.trim(),
          photoUrls,
          photoIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save card.");

      toast.success(`Address Card created for ${currentPin}!`);
      setForm({ title: "", humanAddress: "" });
      setPhotos([]);
      setCurrentPin("");
      setManualPin("");
      setManualLat("");
      setManualLon("");
      setVerifiedPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);

      // Refresh TanStack Query cache instantly
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creating card.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
      setSubmitStep("");
    }
  };

  // ── Delete card ───────────────────────────────────────────────────────────
  const deleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address card?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed.");
      }
      toast.success("Card deleted.");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error deleting card.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Copy card link ────────────────────────────────────────────────────────
  const copyLink = (cardId: string) => {
    const link = `${window.location.origin}/location/${cardId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(cardId);
    toast.success("Card location link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const remainingPhotoSlots = Math.max(0, 2 - existingPhotos.length);

  return (
    <main style={{ maxWidth: 1060, margin: "0 auto", padding: "1.5rem 0.75rem 4rem", width: "100%" }}>
      {/* ── Header ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(1.35rem, 3.8vw, 2rem)", fontWeight: 800 }}>
            Welcome, <span style={{ color: "var(--orange)" }}>{userName}</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "0.82rem" }}>
            Manage your verified doorstep entrance cards with DIGIPIN.
          </p>
        </div>

        <button
          id="new-card-btn"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
          className="btn btn-primary"
          style={{ fontSize: "0.85rem", padding: "0.55rem 1rem" }}
        >
          {showForm ? (
            <>
              <X size={15} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Create Address Card</span>
            </>
          )}
        </button>
      </div>

      {/* ── Edit / Update Card Modal with Image Update & Delete Controls ── */}
      {editingCard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 500,
              maxHeight: "92vh",
              overflowY: "auto",
              border: "1.5px solid rgba(249,115,22,0.45)",
              padding: "1.25rem 1.1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Pencil size={16} className="text-orange" />
                <span>Update Address Card & Photos</span>
              </h3>
              <button
                onClick={() => setEditingCard(null)}
                className="btn btn-ghost btn-icon"
                disabled={updateLoading}
              >
                <X size={16} />
              </button>
            </div>

            {updateError && (
              <div className="alert alert-error" style={{ marginBottom: "0.85rem", fontSize: "0.82rem" }}>
                <AlertCircle size={15} />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  disabled={updateLoading}
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>10-Char DIGIPIN Code *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  maxLength={10}
                  disabled={updateLoading}
                  value={editForm.digipin}
                  onChange={(e) => setEditForm((f) => ({ ...f, digipin: e.target.value.toUpperCase() }))}
                  style={{ fontSize: "0.88rem", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Human Address</label>
                <input
                  type="text"
                  className="form-input"
                  disabled={updateLoading}
                  value={editForm.humanAddress}
                  onChange={(e) => setEditForm((f) => ({ ...f, humanAddress: e.target.value }))}
                  style={{ fontSize: "0.88rem" }}
                />
              </div>

              {/* ── Existing Entrance Photos with Delete Buttons ── */}
              {existingPhotos.length > 0 && (
                <div className="form-group">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
                      Current Entrance Photos ({existingPhotos.length}/2)
                    </label>
                    <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                      Click Delete to remove image
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
                    {existingPhotos.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          height: 100,
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden",
                          border: "1px solid var(--border)",
                          background: "var(--surface2)",
                        }}
                      >
                        <Image
                          src={getThumbnailUrl(p.url, 200, 140)}
                          alt={`Current Photo ${idx + 1}`}
                          fill
                          sizes="180px"
                          style={{ objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingPhoto(idx)}
                          disabled={updateLoading}
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            background: "rgba(239, 68, 68, 0.92)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius-xs)",
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                          }}
                          title="Delete this image"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Add New Photos (Only if slots remain) ── */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {existingPhotos.length === 0
                      ? "Add Entrance Photos (max 2 · 2MB limit)"
                      : remainingPhotoSlots > 0
                      ? `Add More Photos (${remainingPhotoSlots} slot remaining)`
                      : "Photo Limit Reached (2/2)"}
                  </span>
                </label>
                {remainingPhotoSlots > 0 ? (
                  <ImageDropzone
                    files={editPhotos}
                    onChange={setEditPhotos}
                    disabled={updateLoading}
                    maxFiles={remainingPhotoSlots}
                  />
                ) : (
                  <p className="text-muted text-xs" style={{ margin: 0, padding: "0.5rem", background: "var(--surface2)", borderRadius: "var(--radius-xs)" }}>
                    Maximum 2 photos reached. Click &apos;Delete&apos; on an image above to replace it.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  disabled={updateLoading}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}
                >
                  {updateLoading ? (
                    <>
                      <Loader2 size={14} className="spinner" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Card Form Panel ──────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: "2rem", border: "1px solid rgba(249,115,22,0.4)", padding: "1.1rem 0.9rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <MapPinIcon size={18} className="text-orange" />
            <span>Create New Address Card</span>
          </h2>

          {formError && (
            <div className="alert alert-error" style={{ marginBottom: "1rem", fontSize: "0.82rem" }}>
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Step 1: Location Source */}
            <div style={{ background: "var(--surface2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Step 1 — Set DIGIPIN Location *
              </p>

              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setLocationMode("gps")}
                  className={`btn btn-sm ${locationMode === "gps" ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "0.4rem 0.5rem", justifyContent: "center" }}
                >
                  <Navigation size={13} />
                  <span>Use Live GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("manual")}
                  className={`btn btn-sm ${locationMode === "manual" ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "0.4rem 0.5rem", justifyContent: "center" }}
                >
                  <PenTool size={13} />
                  <span>Enter Manually</span>
                </button>
              </div>

              {locationMode === "gps" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={locLoading || submitLoading}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "0.82rem", padding: "0.55rem 0.85rem" }}
                  >
                    {locLoading ? (
                      <>
                        <Loader2 size={14} className="spinner" />
                        <span>Capturing GPS…</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={14} />
                        <span>Detect Current GPS Location</span>
                      </>
                    )}
                  </button>
                  {verifiedPreview && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--success)", fontSize: "0.78rem" }}>
                      <CheckCircle2 size={13} />
                      <span>{verifiedPreview}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="manualType"
                        checked={manualInputType === "pin"}
                        onChange={() => setManualInputType("pin")}
                      />
                      <span>10-Char DIGIPIN Code</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="manualType"
                        checked={manualInputType === "coords"}
                        onChange={() => setManualInputType("coords")}
                      />
                      <span>Coordinates (Lat/Lon)</span>
                    </label>
                  </div>

                  {manualInputType === "pin" ? (
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 4T396F42L7"
                        maxLength={10}
                        disabled={submitLoading || verifyingManual}
                        value={manualPin}
                        onChange={(e) => setManualPin(e.target.value.toUpperCase())}
                        style={{ flex: 1, minWidth: "140px", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyManual}
                        disabled={verifyingManual || manualPin.length !== 10 || submitLoading}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.8rem" }}
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
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        placeholder="Lat"
                        disabled={submitLoading || verifyingManual}
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        style={{ flex: 1, minWidth: "100px", fontSize: "0.85rem" }}
                      />
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        placeholder="Lon"
                        disabled={submitLoading || verifyingManual}
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        style={{ flex: 1, minWidth: "100px", fontSize: "0.85rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyManual}
                        disabled={verifyingManual || !manualLat || !manualLon || submitLoading}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.8rem" }}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span className="text-xs text-muted">Active PIN:</span>
                      <span className="digipin-badge" style={{ fontSize: "0.85rem", padding: "0.2rem 0.5rem" }}>{currentPin}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-title" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
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
                style={{ fontSize: "0.88rem" }}
              />
            </div>

            {/* Human address */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-address" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Human Address <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              <input
                id="card-address"
                type="text"
                className="form-input"
                disabled={submitLoading}
                value={form.humanAddress}
                onChange={(e) => setForm((f) => ({ ...f, humanAddress: e.target.value }))}
                placeholder="e.g. 42 MG Road, Bengaluru"
                style={{ fontSize: "0.88rem" }}
              />
            </div>

            {/* Photos */}
            <div className="form-group">
              <label className="form-label" htmlFor="card-photos" style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600 }}>
                <Upload size={12} />
                <span>Entrance Photos</span>
                <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none" }}>(optional · max 2 · 2MB limit)</span>
              </label>
              <ImageDropzone files={photos} onChange={setPhotos} disabled={submitLoading} />
            </div>

            <button
              id="save-card-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading || !currentPin}
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.88rem" }}
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
          </form>
        </div>
      )}

      {/* ── Card grid with TanStack Query & Sequential #1..N Badges ──────── */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : isError ? (
        <div className="alert alert-error" style={{ fontSize: "0.85rem", padding: "0.75rem 1rem" }}>
          <AlertCircle size={16} />
          <span>{error instanceof Error ? error.message : "Error loading address cards."}</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--orange)",
            }}
          >
            <MapPinIcon size={26} />
          </div>
          <p className="empty-state__title" style={{ fontSize: "1.05rem" }}>No address cards yet</p>
          <p className="empty-state__body" style={{ fontSize: "0.82rem" }}>
            Create your first card — capture GPS or enter a DIGIPIN manually, add a title, and share precise links.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
            style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}
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
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))",
              gap: "0.85rem",
              width: "100%",
            }}
          >
            {cards.map((card, index) => (
              <div key={card._id} className="address-card" style={{ padding: "0.85rem" }}>
                {/* Header: Sequential Card Index #1..N Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      background: "var(--orange-subtle)",
                      border: "1px solid rgba(249,115,22,0.35)",
                      color: "var(--orange)",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "0.15rem 0.55rem",
                      borderRadius: 999,
                      letterSpacing: "0.04em",
                    }}
                  >
                    #{index + 1}
                  </span>
                  <span className="text-muted" style={{ fontSize: "0.68rem", fontFamily: "monospace" }}>
                    ID: {card._id.slice(-6)}
                  </span>
                </div>

                {/* Photo (Only rendered when user attached photo) */}
                {card.photoUrls && card.photoUrls[0] ? (
                  <div className="address-card__photo" style={{ height: 130 }}>
                    <Image
                      src={getThumbnailUrl(card.photoUrls[0], 360, 220)}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : null}

                <div className="address-card__body" style={{ padding: "0.5rem 0" }}>
                  <p className="address-card__title" style={{ fontSize: "0.95rem", fontWeight: 700 }}>{card.title}</p>
                  {card.humanAddress && (
                    <p className="address-card__addr" style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
                      {card.humanAddress}
                    </p>
                  )}
                  <span className="digipin-badge" style={{ alignSelf: "flex-start", fontSize: "0.82rem", padding: "0.2rem 0.5rem" }}>
                    {card.digipin}
                  </span>
                </div>

                {/* Card Action Footer with Update / Edit Button */}
                <div className="address-card__footer" style={{ marginTop: "0.5rem", gap: "0.35rem" }}>
                  <Link
                    href={`/location/${card._id}`}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "0.35rem 0.4rem" }}
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => handleOpenEdit(card)}
                    className="btn btn-outline btn-icon"
                    style={{ padding: "0.35rem 0.5rem" }}
                    title="Update card & photos"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => copyLink(card._id)}
                    className="btn btn-outline btn-icon"
                    style={{ padding: "0.35rem 0.5rem" }}
                    title="Copy share link"
                  >
                    {copiedId === card._id ? (
                      <Check size={13} style={{ color: "var(--success)" }} />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setQrCardData({
                        url: `${window.location.origin}/location/${card._id}`,
                        digipin: card.digipin,
                        title: card.title,
                        humanAddress: card.humanAddress,
                      })
                    }
                    className="btn btn-outline btn-icon"
                    style={{ padding: "0.35rem 0.5rem" }}
                    title="Generate QR Pass"
                  >
                    <QrCodeIcon size={13} />
                  </button>
                  <button
                    onClick={() => deleteCard(card._id)}
                    disabled={deletingId === card._id}
                    className="btn btn-danger btn-icon"
                    style={{ padding: "0.35rem 0.5rem" }}
                    title="Delete card"
                  >
                    {deletingId === card._id ? (
                      <Loader2 size={13} className="spinner" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── TanStack Query Cursor Load More Button ─────────────────────────── */}
          {hasNextPage && (
            <div className="load-more-wrap" style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <button
                id="load-more-btn"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn btn-outline btn-sm"
                style={{ minWidth: 160, padding: "0.6rem 1.2rem", fontSize: "0.82rem" }}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 size={14} className="spinner" />
                    <span>Loading next 10…</span>
                  </>
                ) : (
                  <span>Load more (10 per page)</span>
                )}
              </button>
            </div>
          )}

          <p className="text-muted text-center" style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
            Showing {cards.length} card{cards.length !== 1 ? "s" : ""}
            {hasNextPage ? " — click load more for next 10 cards" : " — all cards loaded"}
          </p>
        </>
      )}

      {/* ── DigiRoute QR Code Pass Modal ── */}
      {qrCardData && (
        <DigiRouteQRCodeModal
          isOpen={Boolean(qrCardData)}
          onClose={() => setQrCardData(null)}
          url={qrCardData.url}
          digipin={qrCardData.digipin}
          title={qrCardData.title}
          humanAddress={qrCardData.humanAddress}
          isAuthenticated={true}
        />
      )}

      {/* ── Fullscreen Frosted Blur Loading Overlay during Card Actions ── */}
      {(updateLoading || submitLoading || deletingId) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              background: "rgba(28,28,28,0.9)",
              border: "1.5px solid rgba(249,115,22,0.45)",
              padding: "2rem 2.5rem",
              borderRadius: "var(--radius)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.75)",
              textAlign: "center",
              maxWidth: "min(380px, 90vw)",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "var(--orange-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 size={32} className="spinner text-orange" />
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.35rem" }}>
                {updateLoading
                  ? "Updating address card & photos…"
                  : submitLoading
                  ? (submitStep || "Saving address card…")
                  : "Deleting address card…"}
              </p>
              <p className="text-muted text-xs" style={{ margin: 0, lineHeight: 1.5 }}>
                Please wait while your changes are securely synchronized.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DashboardClient({ userName }: { userName: string }) {
  return (
    <QueryProvider>
      <DashboardContent userName={userName} />
    </QueryProvider>
  );
}
