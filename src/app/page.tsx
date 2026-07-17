"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function HomePage() {
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

      router.push("/dashboard");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">🎯</span>
          <h1 className="mt-3 text-3xl font-bold">Sprite Tracker</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Track your Fortnite collection
          </p>
        </div>

        <div className="mb-6 flex rounded-lg border border-[#1e1e2d] bg-[#13131a] p-1">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-[#9147ff] text-white"
                : "text-[#6b7280] hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-[#9147ff] text-white"
                : "text-[#6b7280] hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#1e1e2d] bg-[#13131a] px-4 py-3 text-white outline-none transition-colors focus:border-[#9147ff]"
              placeholder="Enter username"
              minLength={3}
              maxLength={24}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1e1e2d] bg-[#13131a] px-4 py-3 text-white outline-none transition-colors focus:border-[#9147ff]"
              placeholder="Enter password"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#9147ff] px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7] disabled:opacity-60"
          >
            {loading ? "Loading..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-12 grid gap-3 text-center text-sm text-[#6b7280]">
          <p>Browse the full Fortnite cosmetic catalog</p>
          <p>Click sprites to mark them as owned</p>
          <p>Track your collection progress</p>
        </div>
      </div>
    </div>
  );
}
