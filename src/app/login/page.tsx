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
      if (!res.ok) { setError(data.error ?? "Error"); return; }
      router.push("/");
    } catch { setError("Connection error"); }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b6bff] text-lg font-bold shadow-lg shadow-[#3b6bff]/20">
            I
          </Link>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {mode === "login" ? "Sign in to your account" : "Start tracking your collection"}
          </p>
        </div>

        <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === "login" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === "signup" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#3b6bff]/50"
            placeholder="Username"
            minLength={3}
            maxLength={24}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#3b6bff]/50"
            placeholder="Password"
            minLength={6}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3b6bff] py-2.5 text-sm font-medium text-white shadow-lg shadow-[#3b6bff]/15 transition-all hover:bg-[#4a7bff] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          <Link href="/" className="hover:text-white/60">← Back to catalog</Link>
        </p>
      </div>
    </div>
  );
}
