import type { Metadata } from "next";
import { connectDB } from "@/lib/mongoose";
import AddressCard from "@/models/AddressCard";
import { getLatLngFromDigiPin } from "@/lib/digipin";
import LocationCardView from "@/components/LocationCardView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let title = "Address Card — DigiRoute";
  let description = "View and navigate to exact doorstep entrance with DIGIPIN on Google Maps.";
  let ogImage = "/images/entrance_doorstep.jpg";

  try {
    await connectDB();
    const doc = await AddressCard.findById(id).lean();
    if (doc) {
      const d = doc as { title?: string; humanAddress?: string; digipin?: string; photoUrls?: string[] };
      if (d.title) title = `${d.title} — DigiRoute`;
      if (d.humanAddress && d.digipin) description = `${d.humanAddress} (DIGIPIN: ${d.digipin}) · Precise Doorstep Location.`;
      if (d.photoUrls && d.photoUrls.length > 0) ogImage = d.photoUrls[0];
    }
  } catch {
    // fallback
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://digiroute.app/location/${id}`,
      siteName: "DigiRoute",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { id } = await params;

  let cardData: {
    _id: string;
    digipin: string;
    title: string;
    humanAddress?: string;
    photoUrls?: string[];
    createdAt?: string;
  } | null = null;

  let coords: { latitude: string; longitude: string } | null = null;

  try {
    await connectDB();
    const doc = await AddressCard.findById(id).lean();
    if (doc) {
      const d = doc as {
        _id: unknown;
        digipin: string;
        title: string;
        humanAddress?: string;
        photoUrls?: string[];
        createdAt?: Date;
      };

      cardData = {
        _id: String(d._id),
        digipin: d.digipin,
        title: d.title,
        humanAddress: d.humanAddress,
        photoUrls: d.photoUrls,
        createdAt: d.createdAt ? d.createdAt.toISOString() : undefined,
      };

      coords = getLatLngFromDigiPin(d.digipin);
    }
  } catch {
    // invalid id format or db failure
  }

  return <LocationCardView card={cardData} coords={coords} />;
}
