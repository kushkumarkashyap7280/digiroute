"use client";

interface Props {
  lat: number;
  lon: number;
  label?: string;
}

export default function MapPin({ lat, lon, label }: Props) {
  // Support both custom API key or standard Google Maps Embed
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lon}&zoom=17`
    : `https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=17&output=embed`;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        background: "var(--surface2)",
      }}
    >
      <iframe
        title={label || `Google Map location for ${lat}, ${lon}`}
        width="100%"
        height="320"
        style={{
          border: 0,
          display: "block",
          filter: "contrast(1.05)",
        }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
      />
    </div>
  );
}
