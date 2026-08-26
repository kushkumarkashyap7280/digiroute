import type { Metadata } from "next";
import { getLatLngFromDigiPin } from "@/lib/digipin";
import DigipinView from "@/components/DigipinView";

interface Props {
  params: Promise<{ digipin: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { digipin } = await params;
  const pin = digipin.toUpperCase();

  let title = `DIGIPIN ${pin} — Public Location View`;
  let description = `View and navigate to India Post standard DIGIPIN ${pin} on Google Maps (~4m accuracy).`;

  try {
    const coords = getLatLngFromDigiPin(pin);
    if (coords) {
      description = `Coordinates: ${coords.latitude}, ${coords.longitude} · ~4m precision doorstep location.`;
    }
  } catch {
    // invalid pin
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://digiroute.app/digipin/${pin}`,
      siteName: "DigiRoute",
      images: [
        {
          url: "/images/hero_isometric.jpg",
          width: 1200,
          height: 630,
          alt: `DIGIPIN ${pin} Location`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero_isometric.jpg"],
    },
  };
}

export default async function DigipinPage({ params }: Props) {
  const { digipin } = await params;
  const pin = digipin.toUpperCase();

  let coords: { latitude: string; longitude: string } | null = null;
  try {
    coords = getLatLngFromDigiPin(pin);
  } catch {
    /* invalid pin */
  }

  return <DigipinView pin={pin} coords={coords} />;
}
