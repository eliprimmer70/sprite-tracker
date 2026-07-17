"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      router.push("/");
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <div style={{ width: "min(380px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <Link href="/" className="brand" style={{ justifyContent: "center" }}>
            <span className="brand-mark">SL</span>
            <span>Sprite Lookup</span>
          </Link>
          <h1
            style={{
              margin: "1rem 0 0.3rem",
              fontFamily: "var(--font-now, Oswald), sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              fontSize: "1.5rem",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="meta">Track cosmetics across the full Fortnite catalog</p>
        </div>

        <div className="panel" style={{ display: "grid", gap: "0.85rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            <button className={`btn ${mode === "login" ? "btn-primary" : ""}`} onClick={() => setMode("login")}>
              Log in
            </button>
            <button className={`btn ${mode === "signup" ? "btn-primary" : ""}`} onClick={() => setMode("signup")}>
              Sign up
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.6rem" }}>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              minLength={3}
              maxLength={24}
              required
            />
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={6}
              required
            />
            {error && <p style={{ color: "#ff7b7b", margin: 0, fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Loading…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
        <p className="meta" style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/">← Back to catalog</Link>
        </p>
      </div>
    </div>
  );
}
