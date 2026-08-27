"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadToCloudinary, getThumbnailUrl } from "@/lib/cloudinaryClient";
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
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  QrCode as QrCodeIcon,
} from "lucide-react";
import DigiRouteQRCodeModal from "@/components/DigiRouteQRCodeModal";

const MapPin = dynamic(() => import("@/components/MapPin"), { ssr: false });

interface CardData {
  _id: string;
  digipin: string;
  title: string;
  humanAddress?: string;
  photoUrls?: string[];
  photoIds?: string[];
  createdAt?: string;
  isOwner?: boolean;
}

interface Props {
  card: CardData | null;
  coords: { latitude: string; longitude: string } | null;
}

export default function LocationCardView({ card, coords }: Props) {
  const router = useRouter();
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalPhotoIndex, setModalPhotoIndex] = useState<number | null>(null);
  const [isFullImageLoading, setIsFullImageLoading] = useState(true);

  // Local photo state for instant feedback on update/delete
  const [photos, setPhotos] = useState<string[]>(card?.photoUrls || []);
  const [photoIds, setPhotoIds] = useState<string[]>(card?.photoIds || []);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionText, setActionText] = useState("");

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card?.photoUrls) setPhotos(card.photoUrls);
    if (card?.photoIds) setPhotoIds(card.photoIds);
  }, [card?.photoUrls, card?.photoIds]);

  // Reset full image loading state on index change
  useEffect(() => {
    if (modalPhotoIndex !== null) {
      setIsFullImageLoading(true);
    }
  }, [modalPhotoIndex]);

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

  // Keyboard navigation for image lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (modalPhotoIndex === null || photos.length === 0 || actionLoading) return;
      if (e.key === "Escape") {
        setModalPhotoIndex(null);
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        setModalPhotoIndex((prev) => ((prev ?? 0) + 1) % photos.length);
      } else if (e.key === "ArrowLeft" && photos.length > 1) {
        setModalPhotoIndex((prev) =>
          prev === 0 ? photos.length - 1 : (prev ?? 1) - 1
        );
      }
    },
    [modalPhotoIndex, photos.length, actionLoading]
  );

  useEffect(() => {
    if (modalPhotoIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalPhotoIndex, handleKeyDown]);

  // ── Delete Image in Full View ────────────────────────────────────────────
  const handleDeleteImage = async (indexToDelete: number) => {
    if (!card) return;
    if (!confirm("Are you sure you want to delete this entrance photo?")) return;

    setActionLoading(true);
    setActionText("Deleting entrance photo…");

    try {
      const updatedUrls = photos.filter((_, idx) => idx !== indexToDelete);
      const updatedIds = photoIds.filter((_, idx) => idx !== indexToDelete);

      const res = await fetch(`/api/cards/${card._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrls: updatedUrls,
          photoIds: updatedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete photo.");

      setPhotos(updatedUrls);
      setPhotoIds(updatedIds);
      toast.success("Entrance photo deleted successfully!");

      if (updatedUrls.length > 0) {
        setModalPhotoIndex((prev) => Math.min(prev ?? 0, updatedUrls.length - 1));
      } else {
        setModalPhotoIndex(null);
      }

      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error deleting photo.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
      setActionText("");
    }
  };

  // ── Replace / Update Image in Full View ──────────────────────────────────
  const handleReplaceImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!card || modalPhotoIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds the 2MB size limit. Please select an image under 2MB.`);
      e.target.value = "";
      return;
    }

    setActionLoading(true);
    setActionText("Uploading & replacing entrance photo…");

    try {
      const { url, public_id } = await uploadToCloudinary(file);

      const updatedUrls = [...photos];
      const updatedIds = [...photoIds];
      updatedUrls[modalPhotoIndex] = url;
      updatedIds[modalPhotoIndex] = public_id;

      const res = await fetch(`/api/cards/${card._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrls: updatedUrls,
          photoIds: updatedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update photo.");

      setPhotos(updatedUrls);
      setPhotoIds(updatedIds);
      toast.success("Entrance photo updated successfully!");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error updating photo.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
      setActionText("");
      e.target.value = "";
    }
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
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const lat = parseFloat(coords.latitude);
  const lon = parseFloat(coords.longitude);
  const hasPhotos = photos.length > 0;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 4rem", width: "100%" }}>
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

      {/* Hidden file input for Gallery replacement */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
        onChange={handleReplaceImageFile}
      />

      {/* Hidden file input for Direct Camera capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleReplaceImageFile}
      />

      {/* ── Entrance Photos (Lightweight thumbnails on page) ── */}
      {hasPhotos && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: photos.length > 1 ? "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" : "1fr",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius)",
          }}
        >
          {photos.map((url, i) => (
            <div
              key={i}
              onClick={() => setModalPhotoIndex(i)}
              style={{
                position: "relative",
                height: 260,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: "1px solid var(--border)",
                cursor: "zoom-in",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="photo-thumbnail-card"
              title="Click to view fullscreen photo, camera update, or delete"
            >
              <Image
                src={getThumbnailUrl(url, 500, 320)}
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
                  padding: "0.2rem 0.55rem",
                  borderRadius: 4,
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Camera size={12} />
                <span>Photo {i + 1}</span>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  padding: "0.25rem 0.45rem",
                  borderRadius: 4,
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                <ZoomIn size={12} />
                <span>Full View</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fullscreen Image Lightbox Modal with Camera, Gallery & Delete Buttons ────────── */}
      {modalPhotoIndex !== null && photos[modalPhotoIndex] && (
        <div
          onClick={() => {
            if (!actionLoading) setModalPhotoIndex(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* Top Bar with Badge, Camera, Gallery, Delete, and Close Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
              padding: "0.4rem 0",
              flexWrap: "wrap",
              gap: "0.4rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  background: "rgba(249,115,22,0.25)",
                  border: "1px solid rgba(249,115,22,0.6)",
                  color: "var(--orange)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: 999,
                }}
              >
                Photo {modalPhotoIndex + 1} of {photos.length}
              </span>
            </div>

            {/* Action Buttons: Direct Camera + Gallery + Delete + Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              {/* Direct Camera Button */}
              <button
                type="button"
                onClick={() => {
                  if (!actionLoading && cameraInputRef.current) {
                    cameraInputRef.current.click();
                  }
                }}
                disabled={actionLoading}
                className="btn btn-sm"
                style={{
                  background: "var(--orange-subtle)",
                  border: "1px solid rgba(249,115,22,0.5)",
                  color: "var(--orange)",
                  fontSize: "0.76rem",
                  padding: "0.3rem 0.6rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                title="Take photo directly using camera"
              >
                <Camera size={13} />
                <span>Camera</span>
              </button>

              {/* Gallery / File Picker Button */}
              <button
                type="button"
                onClick={() => {
                  if (!actionLoading && galleryInputRef.current) {
                    galleryInputRef.current.click();
                  }
                }}
                disabled={actionLoading}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  fontSize: "0.76rem",
                  padding: "0.3rem 0.6rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                title="Choose image from file gallery"
              >
                <Upload size={13} />
                <span>Gallery</span>
              </button>

              {/* Delete Image Button */}
              <button
                type="button"
                onClick={() => handleDeleteImage(modalPhotoIndex)}
                disabled={actionLoading}
                className="btn btn-sm"
                style={{
                  background: "rgba(239,68,68,0.25)",
                  border: "1px solid rgba(239,68,68,0.6)",
                  color: "#ef4444",
                  fontSize: "0.76rem",
                  padding: "0.3rem 0.6rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                title="Delete this entrance photo"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setModalPhotoIndex(null)}
                disabled={actionLoading}
                className="btn btn-ghost btn-icon"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Image Container with Skeleton Loader */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "min(960px, 94vw)",
              height: "min(74vh, 600px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}
          >
            {/* Loading Animation while Full-Res Image is fetching */}
            {isFullImageLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  zIndex: 2,
                }}
              >
                <Loader2 size={36} className="spinner text-orange" />
                <span style={{ color: "#aaa", fontSize: "0.78rem" }}>Loading high-res photo…</span>
              </div>
            )}

            {/* Previous Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalPhotoIndex((prev) =>
                    prev === 0 ? photos.length - 1 : (prev ?? 1) - 1
                  );
                }}
                style={{
                  position: "absolute",
                  left: 8,
                  zIndex: 10,
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Main Full-Res Image */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src={photos[modalPhotoIndex]}
                alt={`${card.title} entrance full size`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
                style={{ objectFit: "contain" }}
                onLoad={() => setIsFullImageLoading(false)}
              />
            </div>

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalPhotoIndex((prev) => ((prev ?? 0) + 1) % photos.length);
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  zIndex: 10,
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
                title="Next photo (Right Arrow)"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Bottom Bar: Title Caption & Thumbnails */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              textAlign: "center",
              padding: "0.5rem 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <p style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
              {card.title}
            </p>
            {card.humanAddress && (
              <p style={{ color: "#aaa", fontSize: "0.78rem", margin: 0 }}>
                {card.humanAddress}
              </p>
            )}

            {photos.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                {photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalPhotoIndex(idx)}
                    style={{
                      position: "relative",
                      width: 44,
                      height: 44,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: modalPhotoIndex === idx ? "2px solid var(--orange)" : "1px solid rgba(255,255,255,0.3)",
                      padding: 0,
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  >
                    <Image
                      src={getThumbnailUrl(url, 90, 90)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="48px"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fullscreen Frosted Blurred Loading Overlay during Actions ── */}
      {actionLoading && (
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
                {actionText || "Processing…"}
              </p>
              <p className="text-muted text-xs" style={{ margin: 0, lineHeight: 1.5 }}>
                Please wait while your changes are securely synchronized.
              </p>
            </div>
          </div>
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
          <button
            onClick={() => setShowQrModal(true)}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.35rem 0.75rem" }}
            title="Generate printable QR Code Pass"
          >
            <QrCodeIcon size={13} />
            <span>QR Pass</span>
          </button>
        </div>

        <p className="text-muted text-xs" style={{ marginTop: "0.5rem" }}>
          Coordinates: {coords.latitude}, {coords.longitude} · ~4m precision
        </p>
      </div>

      {/* ── QR Code Pass Modal ─────────────────── */}
      {showQrModal && card && (
        <DigiRouteQRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          url={typeof window !== "undefined" ? `${window.location.origin}/location/${card._id}` : `/location/${card._id}`}
          digipin={card.digipin}
          title={card.title}
          humanAddress={card.humanAddress}
          isAuthenticated={!!card.isOwner}
        />
      )}

      {/* ── Google Map ────────────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <MapPin lat={lat} lon={lon} label={card.title} />
      </div>

      {/* ── Actions: Google Maps Navigation ───── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ flex: 1, minWidth: 200, justifyContent: "center" }}
        >
          <Navigation size={16} />
          <span>Navigate with Google Maps</span>
          <ExternalLink size={13} />
        </a>
        <Link href="/convert" className="btn btn-outline" style={{ justifyContent: "center" }}>
          <Compass size={16} />
          <span>DigiRoute Compass</span>
        </Link>
      </div>

      {/* ── Footer Info ───────────────────────── */}
      <div
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <p className="text-muted text-xs">
          DIGIPIN is India Post&apos;s open National Digital Postal Index Number standard.
        </p>
        {card.createdAt && (
          <p className="text-muted text-xs" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={11} />
            <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
          </p>
        )}
      </div>
    </main>
  );
}
