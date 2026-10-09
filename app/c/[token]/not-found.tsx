import SharedCardView from "@/components/SharedCardView";

/** Shown (with HTTP 404) for unknown, switched-off, expired or reset share links. */
export default function SharedCardNotFound() {
  return <SharedCardView card={null} coords={null} />;
}
