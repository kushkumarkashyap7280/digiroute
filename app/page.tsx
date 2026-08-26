import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "DigiRoute — Share Your Exact Location & Doorstep Entrance",
  description:
    "Encode any address into a precise 10-character DIGIPIN (~4m accuracy). Share an entrance photo + pin so visitors and delivery drivers always find the right door.",
  openGraph: {
    title: "DigiRoute — Precise Doorstep Navigation with DIGIPIN & Entrance Photos",
    description:
      "Stop sharing inaccurate GPS pins. Encode lat/lon to India Post's 10-digit DIGIPIN (~4m precision), attach entrance photos, and share a 1-tap navigation link.",
    url: "https://digiroute.app",
    siteName: "DigiRoute",
    images: [
      {
        url: "/images/hero_isometric.jpg",
        width: 1200,
        height: 630,
        alt: "DigiRoute ~4m Sub-Grid Precision Navigation",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiRoute — Stop sharing the wrong gate",
    description: "Convert GPS to 10-character DIGIPIN codes with 4m precision. Attach entrance photos for seamless deliveries.",
    images: ["/images/hero_isometric.jpg"],
  },
  alternates: {
    canonical: "https://digiroute.app",
  },
};

export default function HomePage() {
  return <HomeClient />;
}