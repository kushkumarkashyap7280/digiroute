"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import { Compass, Home, LayoutDashboard, ArrowRight, MapPin } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
}

export default function NotFoundClient({ isLoggedIn }: Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const targetPath = isLoggedIn ? "/dashboard" : "/";
  const targetLabel = isLoggedIn ? "Dashboard" : "Home Page";

  useEffect(() => {
    if (countdown <= 0) {
      router.replace(targetPath);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router, targetPath]);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "calc(100vh - var(--nav-height))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem 5rem",
        textAlign: "center",
        overflowX: "hidden",
      }}
    >
      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, width: "100%" }}>
        {/* Animated 404 Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--orange-subtle)",
            border: "1px solid rgba(249,115,22,0.35)",
            color: "var(--orange)",
            fontSize: "0.82rem",
            fontWeight: 800,
            padding: "0.3rem 0.9rem",
            borderRadius: 999,
            marginBottom: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <MapPin size={13} />
          <span>404 — Off Grid Location</span>
        </motion.div>

        {/* 404 Number Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: "clamp(3.5rem, 10vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "0.75rem",
            background: "linear-gradient(135deg, var(--text) 40%, var(--orange) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)", fontWeight: 800, marginBottom: "0.6rem" }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted"
          style={{ fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1.75rem" }}
        >
          The page you requested doesn&apos;t exist or has been moved. Redirecting you to your{" "}
          <strong style={{ color: "var(--orange)" }}>{targetLabel}</strong> in {countdown}s…
        </motion.p>

        {/* Action Buttons based on Logged-in State */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: "0.65rem 1.4rem", fontSize: "0.88rem" }}>
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link href="/" className="btn btn-primary" style={{ padding: "0.65rem 1.4rem", fontSize: "0.88rem" }}>
              <Home size={16} />
              <span>Go to Home Page</span>
              <ArrowRight size={14} />
            </Link>
          )}

          <Link href="/convert" className="btn btn-outline" style={{ padding: "0.65rem 1.2rem", fontSize: "0.88rem" }}>
            <Compass size={16} />
            <span>DigiRoute Compass</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
