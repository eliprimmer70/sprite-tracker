"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

interface Cosmetic {
  name: string;
  icon: string;
  renderImage?: string;
  rarity: string;
  type: string;
}

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [featured, setFeatured] = useState<Cosmetic[]>([]);
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    fetch("https://fortnite-api.com/v2/shop")
      .then((r) => r.json())
      .then((d) => {
        const cosmetics: Cosmetic[] = [];
        const entries = d.data?.entries ?? [];

        for (const e of entries) {
          const brItems = e.brItems ?? e.items ?? [];
          const nda = e.newDisplayAsset;
          const renderUrl = nda?.renderImages?.[0]?.image;

          for (const i of brItems) {
            const name = i.name;
            const icon = i.images?.icon;
            if (name && icon) {
              cosmetics.push({
                name,
                icon,
                renderImage: renderUrl,
                rarity: i.rarity?.displayValue ?? i.rarity?.value ?? "",
                type: i.type?.displayValue ?? "",
              });
              if (cosmetics.length >= 8) break;
            }
          }
          if (cosmetics.length >= 8) break;
        }

        setFeatured(cosmetics);
        if (cosmetics[0]?.renderImage) {
          setHeroImage(cosmetics[0].renderImage);
        }
      })
      .catch(() => {});
  }, []);

  const carouselItems = featured.length > 0
    ? [...featured, ...featured]
    : [];

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0f]">
      {/* Hero Background */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]" />
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#4a3aff]/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#9147ff]/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 h-64 w-64 rounded-full bg-[#00d4ff]/10 blur-[80px]" />

        {/* Navigation bar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold tracking-tight">Sprite Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode("login")}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className="rounded-lg bg-[#9147ff] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7]"
            >
              Sign up
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto mt-16 flex max-w-7xl flex-col items-center px-6 text-center md:mt-24 md:px-12">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#9147ff]/30 bg-[#9147ff]/10 px-4 py-1.5 text-sm text-[#a855f7]">
              <span className="h-2 w-2 rounded-full bg-[#a855f7] animate-pulse" />
              Free Fortnite Collection Tracker
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Track Your{" "}
              <span className="bg-gradient-to-r from-[#9147ff] via-[#a855f7] to-[#00d4ff] bg-clip-text text-transparent">
                Fortnite Locker
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#9ca3af]">
              Browse every cosmetic in the game, mark what you own,
              and see exactly what you&apos;re missing.
            </p>
          </div>

          {/* Auth Card */}
          <div className="mt-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-6 flex rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-[#9147ff] text-white shadow-lg"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-[#9147ff] text-white shadow-lg"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-[#6b7280] focus:border-[#9147ff]"
                placeholder="Username"
                minLength={3}
                maxLength={24}
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-[#6b7280] focus:border-[#9147ff]"
                placeholder="Password"
                minLength={6}
                required
              />

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#9147ff] px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Carousel */}
        {carouselItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/5 py-4">
            <div className="flex animate-carousel gap-6">
              {carouselItems.map((item, i) => (
                <div
                  key={i}
                  className="group flex w-24 shrink-0 cursor-pointer flex-col items-center gap-2 transition-all hover:scale-110"
                >
                  <div className="flex aspect-square w-16 items-center justify-center rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 transition-all group-hover:bg-white/10 group-hover:ring-[#9147ff]/50">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="h-full w-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <span className="max-w-[6rem] truncate text-center text-[11px] text-white/50">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="relative border-t border-white/5 bg-[#0d0d15] py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything you need to track your collection
            </h2>
            <p className="mt-4 text-[#9ca3af]">
              Simple, fast, and built for Fortnite fans.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Full Catalog",
                desc: "Every cosmetic from every season, updated automatically.",
                gradient: "from-[#9147ff]/20 to-transparent",
              },
              {
                icon: "✅",
                title: "One-Click Tracking",
                desc: "Tap any sprite to mark it owned. No manual lists.",
                gradient: "from-[#00d4ff]/20 to-transparent",
              },
              {
                icon: "📊",
                title: "Progress Stats",
                desc: "See your completion percentage and what you're missing.",
                gradient: "from-[#4a3aff]/20 to-transparent",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${f.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative">
                  <span className="mb-4 block text-3xl">{f.icon}</span>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#6b7280]">
        <p>Sprite Tracker &middot; Not affiliated with Epic Games</p>
      </footer>
    </div>
  );
}
