"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  X,
  Download,
  Copy,
  Check,
  QrCode as QrCodeIcon,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  digipin: string;
  title: string;
  humanAddress?: string;
  isAuthenticated?: boolean;
}

export default function DigiRouteQRCodeModal({
  isOpen,
  onClose,
  url,
  digipin,
  title,
  humanAddress,
  isAuthenticated = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !url) return;

    setQrReady(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High error correction level 'H' (30% redundancy) to allow logo overlay in center
    QRCode.toCanvas(
      canvas,
      url,
      {
        width: 280,
        margin: 2,
        color: {
          dark: "#111111",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      },
      (err) => {
        if (err) {
          console.error("QR Code rendering error:", err);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Overlay DigiRoute Logo in center of QR
        const logo = new window.Image();
        logo.src = "/favicon.png";
        logo.onload = () => {
          const center = canvas.width / 2;
          const logoRadius = 26;

          // Draw white circular backdrop
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, logoRadius + 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "#f97316";
          ctx.stroke();

          // Clip logo into circle
          ctx.beginPath();
          ctx.arc(center, center, logoRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            logo,
            center - logoRadius,
            center - logoRadius,
            logoRadius * 2,
            logoRadius * 2
          );
          ctx.restore();

          setQrReady(true);
        };
        logo.onerror = () => {
          setQrReady(true);
        };
      }
    );
  }, [isOpen, url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyPin = () => {
    navigator.clipboard.writeText(digipin);
    setCopiedPin(true);
    toast.success(`Copied DIGIPIN: ${digipin}`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success("Location link copied to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create printable badge card with header and footer on canvas
    const downloadCanvas = document.createElement("canvas");
    const dCtx = downloadCanvas.getContext("2d");
    if (!dCtx) return;

    const padding = 24;
    const cardWidth = canvas.width + padding * 2;
    const cardHeight = canvas.height + 150;

    downloadCanvas.width = cardWidth;
    downloadCanvas.height = cardHeight;

    // Background card with rounded corners
    dCtx.fillStyle = "#ffffff";
    dCtx.fillRect(0, 0, cardWidth, cardHeight);

    // Border
    dCtx.lineWidth = 4;
    dCtx.strokeStyle = "#f97316";
    dCtx.strokeRect(2, 2, cardWidth - 4, cardHeight - 4);

    // Header Title
    dCtx.fillStyle = "#111111";
    dCtx.font = "bold 16px sans-serif";
    dCtx.textAlign = "center";
    dCtx.fillText(title || "DigiRoute Doorstep Location", cardWidth / 2, 34);

    // Draw QR
    dCtx.drawImage(canvas, padding, 48);

    // DIGIPIN Code Box
    const pinBoxY = canvas.height + 62;
    dCtx.fillStyle = "#fff7ed";
    dCtx.strokeStyle = "#ea580c";
    dCtx.lineWidth = 1.5;
    dCtx.fillRect(padding, pinBoxY, canvas.width, 36);
    dCtx.strokeRect(padding, pinBoxY, canvas.width, 36);

    dCtx.fillStyle = "#c2410c";
    dCtx.font = "bold 16px monospace";
    dCtx.fillText(`DIGIPIN: ${digipin}`, cardWidth / 2, pinBoxY + 24);

    // Footer brand
    dCtx.fillStyle = "#666666";
    dCtx.font = "11px sans-serif";
    dCtx.fillText("Scan with camera to navigate · digiroute.app", cardWidth / 2, cardHeight - 14);

    // Trigger download
    const link = document.createElement("a");
    link.download = `DigiRoute-${digipin}.png`;
    link.href = downloadCanvas.toDataURL("image/png");
    link.click();
    toast.success("DigiRoute QR Pass downloaded!");
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: isAuthenticated
            ? "1.5px solid rgba(249,115,22,0.6)"
            : "1px solid var(--border)",
          boxShadow: isAuthenticated
            ? "0 0 35px rgba(249,115,22,0.25), 0 20px 50px rgba(0,0,0,0.7)"
            : "0 20px 50px rgba(0,0,0,0.7)",
          padding: "1.25rem 1.15rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <QrCodeIcon size={18} className="text-orange" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
              DigiRoute QR Pass
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: 32, height: 32, padding: 0 }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Premium Badge if authenticated */}
        {isAuthenticated && (
          <div
            style={{
              width: "100%",
              background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.08))",
              border: "1px solid rgba(249,115,22,0.35)",
              borderRadius: "var(--radius-sm)",
              padding: "0.35rem 0.65rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.75rem",
              color: "var(--orange)",
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Doorstep Pass</span>
            <Sparkles size={12} />
          </div>
        )}

        {/* Title & Address */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: "0.98rem", margin: "0 0 0.2rem" }}>
            {title}
          </p>
          {humanAddress && (
            <p className="text-muted text-xs" style={{ margin: 0 }}>
              {humanAddress}
            </p>
          )}
        </div>

        {/* ── QR Canvas Container (White High-Contrast Canvas) ── */}
        <div
          style={{
            background: "#ffffff",
            padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 280,
            minWidth: 280,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              width: 260,
              height: 260,
              borderRadius: 6,
            }}
          />
        </div>

        {/* Downside DIGIPIN Display */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            padding: "0.45rem 0.75rem",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="text-muted" style={{ fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700 }}>
              DIGIPIN Code
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.05rem", color: "var(--orange)", letterSpacing: "0.08em" }}>
              {digipin}
            </span>
          </div>

          <button
            onClick={copyPin}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
            title="Copy DIGIPIN code"
          >
            {copiedPin ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            <span>{copiedPin ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Action Buttons: Download Stamp + Copy Link */}
        <div style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={downloadQR}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem", padding: "0.55rem" }}
            title="Download printable QR Code PNG"
          >
            <Download size={14} />
            <span>Download Stamp (PNG)</span>
          </button>

          <button
            onClick={copyLink}
            className="btn btn-outline btn-icon"
            style={{ padding: "0.55rem 0.75rem" }}
            title="Copy Destination Link"
          >
            {copiedUrl ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
