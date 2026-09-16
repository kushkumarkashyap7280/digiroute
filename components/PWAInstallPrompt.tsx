"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

const STORAGE_KEY = "digiroute_apk_download_dismissed_until";
const APK_DOWNLOAD_URL =
  "https://github.com/kushkumarkashyap7280/digiroutes_app/releases/latest/download/app-release.apk";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    try {
      // Check if user previously dismissed prompt (within 7 days)
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // Delay prompt appearance slightly so it feels natural
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      // Dismiss for 7 days
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {
      /* ignore */
    }
  };

  const handleDownload = () => {
    try {
      // Dismiss for 14 days after downloading
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 14 * 24 * 60 * 60 * 1000));
    } catch {
      /* ignore */
    }
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: "1.25rem",
            right: "1.25rem",
            zIndex: 9999,
            maxWidth: "380px",
            width: "calc(100vw - 2.5rem)",
            background: "var(--surface)",
            border: "1.5px solid rgba(249, 115, 22, 0.4)",
            borderRadius: "var(--radius)",
            boxShadow: "0 12px 35px -6px rgba(0, 0, 0, 0.4), 0 0 20px rgba(249, 115, 22, 0.15)",
            padding: "1rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            {/* App Icon */}
            <div
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: "var(--radius-sm)",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src="/Orange Minimalist Travel App Business Logo/light.png"
                alt="DigiRoute App Icon"
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text)" }}>
                    DigiRoutes App
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      background: "rgba(249, 115, 22, 0.15)",
                      color: "var(--orange)",
                      padding: "0.1rem 0.35rem",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <Smartphone size={10} />
                    Android APK
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    padding: "0.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                  }}
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-muted text-xs" style={{ margin: "0.3rem 0 0.75rem", lineHeight: 1.45 }}>
                Get our native mobile app with full-screen Google Maps, offline DIGIPIN encoding &amp; doorstep navigation.
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href={APK_DOWNLOAD_URL}
                  download="digiroutes.apk"
                  onClick={handleDownload}
                  className="btn btn-primary btn-sm"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.82rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Download size={13} />
                  <span>Download APK</span>
                </a>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="btn btn-ghost btn-sm text-muted"
                  style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
