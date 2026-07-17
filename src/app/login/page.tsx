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
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl">🎯</Link>
          <h1 className="mt-2 text-2xl font-bold">Item History</h1>
        </div>

        <div className="mb-4 flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-[#9147ff] text-white"
                : "text-[#6b7280] hover:text-white"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-[#9147ff] text-white"
                : "text-[#6b7280] hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-[#9147ff]"
            placeholder="Username"
            minLength={3}
            maxLength={24}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-[#9147ff]"
            placeholder="Password"
            minLength={6}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#9147ff] py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6b7280]">
          <Link href="/" className="hover:text-white">← Back to catalog</Link>
        </p>
      </div>
    </div>
  );
}
