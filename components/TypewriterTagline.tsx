"use client";

import { useState, useEffect } from "react";

interface Props {
  prefix: string;
  words: string[];
}

export default function TypewriterTagline({ prefix, words }: Props) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const fullWord = words[wordIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward character-by-character
        const nextText = fullWord.slice(0, currentText.length + 1);
        setCurrentText(nextText);
        if (nextText === fullWord) {
          // Pause at complete word for 2 seconds
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Backspacing backward character-by-character
        const nextText = fullWord.slice(0, currentText.length - 1);
        setCurrentText(nextText);
        if (nextText === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, wordIndex, words]);

  const cleanPrefix = prefix.trim();

  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "0.15rem",
        width: "100%",
      }}
    >
      {/* Top line: Fixed prefix text */}
      <span style={{ color: "var(--text)" }}>{cleanPrefix}</span>

      {/* Down side (second line): Dynamic moving animated text */}
      <span
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          minHeight: "1.3em",
        }}
      >
        <span>{currentText || "\u00A0"}</span>
        <span
          style={{
            color: "var(--orange)",
            WebkitTextFillColor: "var(--orange)",
            fontWeight: 300,
            opacity: 0.9,
            animation: "pulse 1s infinite",
            marginLeft: "3px",
          }}
        >
          |
        </span>
      </span>
    </span>
  );
}
