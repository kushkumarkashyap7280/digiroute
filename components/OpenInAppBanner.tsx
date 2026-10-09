"use client";

/**
 * Android-only helper for /digipin/* and /card/* pages.
 * Links tapped in other apps open the DigiRoutes app directly (Android App
 * Links). This banner covers the case where the page was opened inside a
 * browser: the intent:// link launches the installed app, or falls back to the
 * APK download when it isn't installed.
 */

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Smartphone, X } from "lucide-react";

const PACKAGE = "com.example.digiroutes_app";
const APK_URL =
  "https://github.com/kushkumarkashyap7280/digiroutes_app/releases/latest/download/app-release.apk";
const DISMISS_KEY = "digiroute_open_in_app_dismissed";

const noopSubscribe = () => () => {};
const isAndroidSnapshot = () => /android/i.test(navigator.userAgent);
const wasDismissedSnapshot = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};
const serverFalse = () => false;

export default function OpenInAppBanner() {
  const pathname = usePathname();
  const isAndroid = useSyncExternalStore(noopSubscribe, isAndroidSnapshot, serverFalse);
  const wasDismissed = useSyncExternalStore(noopSubscribe, wasDismissedSnapshot, serverFalse);
  const [dismissedNow, setDismissedNow] = useState(false);

  const isTarget = /^\/(digipin|card)\/[^/]+/.test(pathname ?? "");
  if (!isTarget || !isAndroid || wasDismissed || dismissedNow) return null;

  const href =
    `intent://${window.location.host}${pathname}#Intent;scheme=https;` +
    `package=${PACKAGE};S.browser_fallback_url=${encodeURIComponent(APK_URL)};end`;

  return (
    <div
      role="region"
      aria-label="Open in the DigiRoutes app"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 16,
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, rgba(0,0,0,0.1))",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      <Smartphone size={20} style={{ color: "#f97316", flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
        Open this location in the DigiRoutes app
      </span>
      <a
        href={href}
        style={{
          background: "linear-gradient(135deg,#f97316,#fb923c)",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Open
      </a>
      <button
        aria-label="Dismiss"
        onClick={() => {
          setDismissedNow(true);
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
        style={{ background: "none", border: 0, padding: 4, cursor: "pointer", color: "inherit" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
