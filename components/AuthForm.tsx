"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Rocket, LogIn, Loader2, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically redirect logged-in users away from /login and /signup to /dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Something went wrong.";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success(isSignup ? "Account created successfully!" : "Welcome back!");
      await refreshUser();
      router.push("/dashboard");
      router.refresh();
    } catch {
      const netMsg = "Network error — please check connection and try again.";
      setError(netMsg);
      toast.error(netMsg);
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show redirect spinner
  if (!authLoading && user) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--bg)",
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Loader2 size={36} className="spinner text-orange" />
          <p className="text-muted text-sm">Already logged in. Redirecting to your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 1rem",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* background glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              border: "2px solid rgba(249,115,22,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--orange)",
              margin: "0 auto 0.75rem",
            }}
          >
            {isSignup ? <Rocket size={24} /> : <LogIn size={24} />}
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted text-sm">
            {isSignup ? "Start sharing precise locations today." : "Sign in to your DigiRoute dashboard."}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <UserIcon size={12} />
                  <span>Full Name</span>
                </label>
                <input
                  id="auth-name"
                  type="text"
                  className="form-input"
                  required
                  disabled={loading}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Riya Sharma"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Mail size={12} />
                <span>Email</span>
              </label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                required
                disabled={loading}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="riya@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Lock size={12} />
                <span>Password {isSignup && <span style={{ color: "var(--muted)", fontWeight: 400 }}>(min 6 chars)</span>}</span>
              </label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                required
                disabled={loading}
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            <button
              id="auth-submit"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: "0.5rem", padding: "0.75rem" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>{isSignup ? "Creating account…" : "Signing in…"}</span>
                </>
              ) : isSignup ? (
                <>
                  <Rocket size={16} />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-muted text-sm text-center">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              style={{ color: "var(--orange)", fontWeight: 600 }}
            >
              {isSignup ? "Sign in" : "Sign up free"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
