"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import {
  X,
  Camera,
  QrCode as QrCodeIcon,
  RefreshCw,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Flashlight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DigiRouteQRScannerModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [scannerError, setScannerError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Manual PIN fallback input
  const [manualPin, setManualPin] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = "digiroute-html5-qr-reader";

  // Synthesize pleasant futuristic chime/beep using Web Audio API
  const playScanBeep = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Upward melodic chime (880Hz to 1760Hz)
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio autoplay may be muted; ignore silently
    }
  }, []);

  // Trigger device haptic vibration
  const triggerVibration = useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([90, 40, 90]);
      }
    } catch {
      // Ignore vibration error
    }
  }, []);

  // Handle successful QR code decode (from live camera or manual input)
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannedResult) return; // Prevent duplicate scan events
      setScannedResult(decodedText);

      // 1. Play sound & trigger vibration
      playScanBeep();
      triggerVibration();

      // 2. Stop camera scanner
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {
          // ignore stop error
        }
      }

      toast.success("DigiRoute QR Pass detected!");

      // 3. Resolve destination route
      let targetPath = "";
      const text = decodedText.trim();

      // Case A: Full URL
      if (text.startsWith("http://") || text.startsWith("https://")) {
        try {
          const parsed = new URL(text);
          if (
            parsed.pathname.startsWith("/location/") ||
            parsed.pathname.startsWith("/digipin/") ||
            parsed.pathname.startsWith("/convert")
          ) {
            targetPath = parsed.pathname + parsed.search;
          } else {
            // External or standard link
            window.location.href = text;
            return;
          }
        } catch {
          targetPath = text;
        }
      }
      // Case B: Relative link
      else if (
        text.startsWith("/location/") ||
        text.startsWith("/digipin/") ||
        text.startsWith("/convert")
      ) {
        targetPath = text;
      }
      // Case C: Raw 10-char DIGIPIN code (e.g. 4T396F42L7)
      else if (/^[2-9CFJKLMPQRVWX]{10}$/i.test(text)) {
        targetPath = `/digipin/${text.toUpperCase()}`;
      } else {
        // Fallback: search or compass
        targetPath = `/convert?pin=${encodeURIComponent(text)}`;
      }

      // 4. Smoothly redirect
      setTimeout(() => {
        onClose();
        router.push(targetPath);
      }, 500);
    },
    [scannedResult, playScanBeep, triggerVibration, onClose, router]
  );

  // Initialize and start Camera Scanner
  const startCamera = useCallback(
    async (cameraIdOrFacingMode: string | { facingMode: string }) => {
      setScannerError("");
      setIsScanning(false);

      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(readerId);
        }

        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          await scanner.stop();
        }

        // Fetch available video devices if not already loaded
        if (cameras.length === 0) {
          const devices = await Html5Qrcode.getCameras().catch(() => []);
          if (devices && devices.length > 0) {
            setCameras(devices);
          }
        }

        await scanner.start(
          cameraIdOrFacingMode,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const edge = Math.floor(minEdge * 0.72);
              return { width: edge, height: edge };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // scan failure callback on every frame without QR (silent)
          }
        );

        setIsScanning(true);

        // Check torch capabilities
        try {
          const capabilities = scanner.getRunningTrackCameraCapabilities();
          if (capabilities && capabilities.torchFeature().isSupported()) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err: unknown) {
        console.error("Camera start failed:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Camera permission denied or camera not accessible.";
        setScannerError(errMsg);
        setIsScanning(false);
      }
    },
    [cameras.length, handleScanSuccess]
  );

  // Start scanner when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setScannedResult(null);
    setManualPin("");

    // Prefer environment back camera
    const timer = setTimeout(() => {
      startCamera({ facingMode: "environment" });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, startCamera]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Flip Camera
  const flipCamera = async () => {
    if (cameras.length > 1) {
      const nextIndex = (activeCameraIndex + 1) % cameras.length;
      setActiveCameraIndex(nextIndex);
      await startCamera(cameras[nextIndex].id);
    } else {
      // Toggle between facing modes
      await startCamera({ facingMode: "user" });
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const next = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: next } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      toast.error("Torch not supported on this device.");
    }
  };

  // Manual DIGIPIN Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualPin.trim().toUpperCase();
    if (!clean) {
      toast.error("Please enter a DIGIPIN code or location URL.");
      return;
    }
    handleScanSuccess(clean);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
          maxWidth: 440,
          background: "var(--surface)",
          border: "1.5px solid rgba(249,115,22,0.4)",
          boxShadow: "0 0 35px rgba(249,115,22,0.2), 0 20px 50px rgba(0,0,0,0.8)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          position: "relative",
          borderRadius: "var(--radius)",
          maxHeight: "90vh",
          overflowY: "auto",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <QrCodeIcon size={20} className="text-orange" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
              Scan DigiRoute QR Pass
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: 34, height: 34, padding: 0 }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Subtitle */}
        <p className="text-muted text-xs" style={{ margin: 0, textAlign: "center", lineHeight: 1.5 }}>
          Point your device camera at a doorstep QR code to instantly navigate.
        </p>

        {/* ── Viewfinder Video Box ── */}
        <div
          style={{
            width: "100%",
            position: "relative",
            minHeight: 260,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* html5-qrcode video container */}
          <div
            id={readerId}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 260,
            }}
          />

          {/* Success Overlay Animation */}
          {scannedResult && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(16, 185, 129, 0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                color: "#fff",
                zIndex: 10,
                backdropFilter: "blur(4px)",
              }}
            >
              <CheckCircle2 size={48} className="animate-bounce" />
              <p style={{ fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>
                QR Code Detected!
              </p>
              <span style={{ fontSize: "0.8rem", opacity: 0.9 }}>Redirecting to location…</span>
            </div>
          )}

          {/* Scanning Reticle & Laser Beam Overlay */}
          {isScanning && !scannedResult && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Center Target Box */}
              <div
                style={{
                  width: 190,
                  height: 190,
                  position: "relative",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
              >
                {/* 4 Glowing Corner Reticles */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 24,
                    height: 24,
                    borderTop: "3.5px solid var(--orange)",
                    borderLeft: "3.5px solid var(--orange)",
                    borderTopLeftRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderTop: "3.5px solid var(--orange)",
                    borderRight: "3.5px solid var(--orange)",
                    borderTopRightRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 24,
                    height: 24,
                    borderBottom: "3.5px solid var(--orange)",
                    borderLeft: "3.5px solid var(--orange)",
                    borderBottomLeftRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderBottom: "3.5px solid var(--orange)",
                    borderRight: "3.5px solid var(--orange)",
                    borderBottomRightRadius: 6,
                  }}
                />

                {/* Animated Horizontal Laser */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "linear-gradient(90deg, transparent, #f97316, #fb923c, #f97316, transparent)",
                    boxShadow: "0 0 10px #f97316",
                    animation: "laserScan 2s ease-in-out infinite alternate",
                  }}
                />
              </div>
            </div>
          )}

          {/* Camera Permission / Error Fallback */}
          {scannerError && !isScanning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: "rgba(18,18,18,0.95)",
                zIndex: 5,
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.15)",
                  color: "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", margin: "0 0 0.25rem" }}>
                  Live Camera Feed
                </p>
                <p className="text-muted text-xs" style={{ margin: 0, lineHeight: 1.4 }}>
                  Camera access inactive. You can retry permission or enter the DIGIPIN code manually below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => startCamera({ facingMode: "environment" })}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.78rem" }}
              >
                <RefreshCw size={13} />
                <span>Retry Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Camera Controls Bar ── */}
        <div style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
          {/* Flip / Switch Camera Button */}
          <button
            type="button"
            onClick={flipCamera}
            disabled={!isScanning}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "0.45rem" }}
            title="Switch front/back camera"
          >
            <RefreshCw size={13} />
            <span>Switch Camera</span>
          </button>

          {/* Torch / Flashlight Button (if supported) */}
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`btn btn-sm ${torchOn ? "btn-primary" : "btn-outline"}`}
              style={{ padding: "0.45rem 0.65rem" }}
              title="Toggle Flashlight"
            >
              <Flashlight size={14} />
            </button>
          )}
        </div>

        {/* ── Manual DIGIPIN Input Fallback ── */}
        <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
          <form
            onSubmit={handleManualSubmit}
            style={{ display: "flex", gap: "0.4rem", width: "100%" }}
          >
            <input
              type="text"
              value={manualPin}
              onChange={(e) => setManualPin(e.target.value)}
              placeholder="Or enter 10-char DIGIPIN code…"
              maxLength={40}
              className="input input-sm"
              style={{
                flex: 1,
                fontSize: "0.78rem",
                padding: "0.4rem 0.65rem",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <span>Go</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem",
            fontSize: "0.72rem",
            color: "var(--muted)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Volume2 size={12} className="text-orange" />
            Chime Sound
          </span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Sparkles size={12} className="text-orange" />
            Vibration
          </span>
          <span>•</span>
          <span>Instant Redirect</span>
        </div>
      </div>

      {/* Embedded CSS for scan laser animation */}
      <style jsx global>{`
        @keyframes laserScan {
          0% {
            top: 5%;
          }
          100% {
            top: 95%;
          }
        }
      `}</style>
    </div>
  );
}
