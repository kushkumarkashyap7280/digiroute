import type { Metadata } from "next";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = {
  title: "About DigiRoute — Motive, Features & Step-by-Step Guide",
  description:
    "Discover DigiRoute's mission to solve India's doorstep delivery confusion. Comprehensive guide on India Post DIGIPIN (~4m precision), entrance photo verification, printable QR passes, and live camera scanning.",
  keywords: [
    "About DigiRoute",
    "DIGIPIN India Post",
    "Digital Postal Index Number",
    "CEPT addressing standard",
    "doorstep navigation",
    "gate photo verification",
    "printable QR code pass",
    "live QR camera scanner",
    "GPS to DIGIPIN converter",
    "last mile delivery India",
    "precise geolocation",
  ],
  authors: [{ name: "DigiRoute Engineering Team" }],
  creator: "DigiRoute",
  publisher: "DigiRoute",
  openGraph: {
    title: "About DigiRoute — Solving the Last 4 Meters with DIGIPIN",
    description:
      "Understand why standard GPS pins fail and how DigiRoute pairs 10-digit DIGIPIN codes with real entrance photos and QR passes for 100% accurate doorstep navigation.",
    url: "https://digiroute.app/about",
    siteName: "DigiRoute",
    images: [
      {
        url: "/images/hero_isometric.jpg",
        width: 1200,
        height: 630,
        alt: "About DigiRoute Doorstep Navigation Guide",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About DigiRoute — Motive, Features & Guide",
    description:
      "Complete instructions on India Post DIGIPIN codes, doorstep entrance photos, printable QR passes, and camera scanning.",
    images: ["/images/hero_isometric.jpg"],
    creator: "@DigiRouteApp",
  },
  alternates: {
    canonical: "https://digiroute.app/about",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD structured data for rich Google search indexing
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DigiRoute",
  operatingSystem: "Web, iOS, Android (PWA)",
  applicationCategory: "NavigationApplication",
  description:
    "Precision doorstep navigation platform utilizing India Post's CEPT 10-character DIGIPIN addressing standard (~4m precision), gate entrance photos, and printable QR passes.",
  url: "https://digiroute.app/about",
  featureList: [
    "India Post 10-character DIGIPIN sub-grid encoder/decoder (~4m precision)",
    "Verified Doorstep Entrance Photos with lightweight thumbnail compression",
    "Printable On-Demand QR Code Passes with center brand logo and downside DIGIPIN",
    "Real-time Live Camera QR Scanner with laser reticle and haptic vibration feedback",
    "Public DigiRoute Compass Tool with instant Google Maps routing",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  publisher: {
    "@type": "Organization",
    name: "DigiRoute",
    url: "https://digiroute.app",
    logo: "https://digiroute.app/icon.png",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
