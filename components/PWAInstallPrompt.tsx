"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "digiroute_pwa_dismissed_until";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if previously dismissed (within 30 days) or already installed
    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) return;

      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    } catch {
      // ignore storage access error
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      // Delay prompt appearance by 2 seconds so it feels natural and not aggressive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      deferredPromptRef.current = null;
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) {
      setShowPrompt(false);
      return;
    }
    await deferredPromptRef.current.prompt();
    const choice = await deferredPromptRef.current.userChoice;
    if (choice.outcome === "accepted") {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
      } catch {
        /* ignore */
      }
    }
    deferredPromptRef.current = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      // Dismiss for 30 days
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } catch {
      /* ignore */
    }
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
                    DigiRoute App
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      background: "var(--orange-subtle)",
                      color: "var(--orange)",
                      padding: "0.1rem 0.35rem",
                      borderRadius: 999,
                    }}
                  >
                    PWA
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
                Install on your device for instant 1-tap DIGIPIN lookup &amp; doorstep navigation.
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: "center", padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                >
                  <Download size={13} />
                  <span>Install App</span>
                </button>
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
