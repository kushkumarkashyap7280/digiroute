import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: {
    default: "DigiRoute — Share Your Exact Location",
    template: "%s | DigiRoute",
  },
  description:
    "Encode any address into a precise 10-character DIGIPIN (~4m accuracy). Share a photo + pin so visitors and delivery drivers always find the right door.",
  metadataBase: new URL("https://digiroute.app"),
  icons: {
    icon: [
      { url: "/Orange Minimalist Travel App Business Logo/light.png", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/Orange Minimalist Travel App Business Logo/light.png",
    shortcut: "/Orange Minimalist Travel App Business Logo/light.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DigiRoute",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://digiroute.app",
    siteName: "DigiRoute",
    title: "DigiRoute — Share Your Exact Doorstep Location",
    description:
      "Stop sharing inaccurate GPS pins. Encode lat/lon to India Post's 10-digit DIGIPIN (~4m precision), attach entrance photos, and share a 1-tap navigation link.",
    images: [
      {
        url: "/images/hero_isometric.jpg",
        width: 1200,
        height: 630,
        alt: "DigiRoute ~4m Sub-Grid Precision Navigation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiRoute — Precise Doorstep Navigation",
    description: "Encode any address into a 10-character DIGIPIN (~4m precision). Pair with entrance photos for seamless deliveries.",
    images: ["/images/hero_isometric.jpg"],
  },
  keywords: [
    "DIGIPIN",
    "Digital Postal Index Number",
    "India Post DIGIPIN",
    "doorstep navigation",
    "accurate address",
    "geolocation encoder",
    "DIGIPIN converter",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/Orange Minimalist Travel App Business Logo/light.png" />
        <link rel="apple-touch-icon" href="/Orange Minimalist Travel App Business Logo/light.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Inline script to set data-theme before paint — prevents flash */}
        <ThemeScript />
        <AuthProvider>
          <Navbar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
          <Footer />
          <PWAInstallPrompt />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
