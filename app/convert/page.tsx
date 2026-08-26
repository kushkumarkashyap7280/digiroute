import type { Metadata } from "next";
import ConvertToolClient from "@/components/ConvertToolClient";

export const metadata: Metadata = {
  title: "Free DIGIPIN Converter & Google Map Inspector",
  description:
    "Convert coordinates to 10-character DIGIPIN, decode DIGIPIN to latitude and longitude, capture live GPS location, and inspect any point on Google Maps for free.",
  openGraph: {
    title: "Free DIGIPIN Converter & Live Location Inspector — DigiRoute",
    description:
      "Decode any 10-char DIGIPIN, calculate coordinates, view on Google Maps, and copy navigation links instantly without logging in.",
    url: "https://digiroute.app/convert",
    siteName: "DigiRoute",
    images: [
      {
        url: "/images/hero_isometric.jpg",
        width: 1200,
        height: 630,
        alt: "DigiRoute Free Location Converter",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free DIGIPIN Converter & Location Inspector",
    description: "Decode DIGIPIN or convert coordinates to 10-character location codes with instant Google Maps view.",
    images: ["/images/hero_isometric.jpg"],
  },
  alternates: {
    canonical: "https://digiroute.app/convert",
  },
};

export default function ConvertPage() {
  return <ConvertToolClient />;
}
