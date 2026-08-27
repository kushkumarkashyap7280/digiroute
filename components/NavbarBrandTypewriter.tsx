"use client";

import { useEffect, useState } from "react";

export default function NavbarBrandTypewriter() {
  const fullText = "DigiRoute"; // 9 characters: "Digi" (4) + "Route" (5)
  const [charCount, setCharCount] = useState(fullText.length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charCount < fullText.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setCharCount((prev) => prev + 1);
      }, 120);
    } else if (!isDeleting && charCount === fullText.length) {
      // Completed full text -> pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 3600);
    } else if (isDeleting && charCount > 1) {
      // Deleting backward (down to first letter 'D')
      timeout = setTimeout(() => {
        setCharCount((prev) => prev - 1);
      }, 65);
    } else if (isDeleting && charCount <= 1) {
      // Paused at 'D' -> resume typing forward
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [charCount, isDeleting]);

  // Split into "Digi" (white) and "Route" (orange)
  const currentStr = fullText.slice(0, charCount);
  const digiPart = currentStr.slice(0, 4); // "Digi"
  const routePart = currentStr.slice(4);   // "Route"

  return (
    <span
      style={{
        fontSize: "1.3rem",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        userSelect: "none",
        minWidth: 105,
      }}
    >
      {/* "Digi" in White */}
      <span style={{ color: "var(--text)", transition: "color 0.2s" }}>{digiPart}</span>

      {/* "Route" in Orange */}
      {routePart && <span style={{ color: "var(--orange)" }}>{routePart}</span>}

      {/* Blinking Typewriter Cursor */}
      <span
        style={{
          display: "inline-block",
          width: 2.2,
          height: "1.15em",
          background: "var(--orange)",
          marginLeft: 2,
          borderRadius: 1,
          animation: "navbarCursorBlink 1s infinite",
          verticalAlign: "middle",
        }}
        aria-hidden="true"
      />

      <style jsx>{`
        @keyframes navbarCursorBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
