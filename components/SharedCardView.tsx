import Image from "next/image";
import { Phone, MessageCircle, Navigation, StickyNote, LinkIcon, MapPin } from "lucide-react";

type Card = {
  digipin: string;
  title: string;
  humanAddress: string;
  photoUrls: string[];
  category: string;
  deliveryNote: string;
  contactPhone: string;
};

interface Props {
  card: Card | null;
  coords: { latitude: string; longitude: string } | null;
  rateLimited?: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  home: "Home",
  work: "Work",
  shop: "Shop",
  family: "Family",
  other: "Other",
};

const btn = (primary: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  textDecoration: "none",
  border: primary ? "none" : "1px solid var(--border)",
  color: primary ? "#fff" : "var(--text)",
  background: primary ? "var(--accent-gradient)" : "var(--surface)",
});

/** Server-rendered view of a card opened through its private share link. */
export default function SharedCardView({ card, coords, rateLimited }: Props) {
  if (!card) {
    return (
      <main style={{ minHeight: "calc(100vh - var(--nav-height))", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div className="card text-center" style={{ maxWidth: 440, width: "100%" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--orange-subtle)" }}>
            <LinkIcon size={28} style={{ color: "var(--orange)" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
            {rateLimited ? "Too many requests" : "This link isn't available"}
          </h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {rateLimited
              ? "Please wait a minute and try again."
              : "The owner may have switched sharing off, the link may have expired, or a new link was created. Ask them to share it again."}
          </p>
        </div>
      </main>
    );
  }

  const wa = card.contactPhone.replace(/[^0-9]/g, "");
  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
    : null;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      {card.photoUrls.length > 0 && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: card.photoUrls.length > 1 ? "1fr 1fr" : "1fr", marginBottom: 20 }}>
          {card.photoUrls.map((url, i) => (
            <div key={url} style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: "var(--surface2)" }}>
              {/* unoptimized: don't keep an extra cached copy of a private photo on our CDN */}
              <Image src={url} alt={`${card.title} entrance photo ${i + 1}`} fill unoptimized sizes="(max-width: 720px) 100vw, 360px" style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 800, letterSpacing: 2, color: "var(--orange)", background: "var(--orange-subtle)", padding: "6px 12px", borderRadius: 10 }}>
          {card.digipin}
        </span>
        {CATEGORY_LABEL[card.category] && (
          <span style={{ fontSize: 13, color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "5px 10px", borderRadius: 10 }}>
            {CATEGORY_LABEL[card.category]}
          </span>
        )}
      </div>

      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>{card.title}</h1>
      {card.humanAddress && (
        <p style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text-secondary)", margin: "0 0 16px" }}>
          <MapPin size={16} style={{ marginTop: 3, flexShrink: 0 }} /> {card.humanAddress}
        </p>
      )}

      {card.deliveryNote && (
        <div style={{ display: "flex", gap: 10, padding: 14, borderRadius: 14, background: "var(--orange-subtle)", border: "1px solid var(--orange-glow)", margin: "12px 0 20px" }}>
          <StickyNote size={18} style={{ color: "var(--orange)", flexShrink: 0, marginTop: 2 }} />
          <span style={{ lineHeight: 1.5 }}>{card.deliveryNote}</span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={btn(true)}>
            <Navigation size={18} /> Navigate in Google Maps
          </a>
        )}
        {card.contactPhone && (
          <>
            <a href={`tel:${card.contactPhone}`} style={btn(false)}>
              <Phone size={18} /> Call
            </a>
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I'm at ${card.title} (DIGIPIN ${card.digipin}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btn(false), color: "#16a34a", borderColor: "#16a34a" }}
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </>
        )}
      </div>

      {coords && (
        <iframe
          title={`Map of ${card.title}`}
          src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&hl=en&z=17&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: 320, border: 0, borderRadius: 16 }}
        />
      )}

      <p style={{ marginTop: 20, fontSize: 12.5, color: "var(--muted)" }}>
        Shared privately with you through DigiRoutes. Please don&apos;t forward this link.
      </p>
    </main>
  );
}
