"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

interface ShopItem {
  name: string;
  icon: string;
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
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    fetch("https://fortnite-api.com/v2/shop")
      .then((r) => r.json())
      .then((d) => {
        const items: ShopItem[] = [];
        const entries = d.data?.entries ?? [];
        for (const e of entries) {
          const brItems = e.brItems ?? e.items ?? [];
          for (const i of brItems) {
            const name = i.name;
            const icon = i.images?.icon;
            if (name && icon) {
              items.push({
                name,
                icon,
                rarity: i.rarity?.displayValue ?? i.rarity?.value ?? "",
                type: i.type?.displayValue ?? "",
              });
              if (items.length >= 12) break;
            }
          }
          if (items.length >= 12) break;
        }
        setShopItems(items);
      })
      .catch(() => {});
  }, []);

  const carousel = shopItems.length > 0
    ? [...shopItems, ...shopItems]
    : Array.from({ length: 12 }, (_, i) => ({
        name: "",
        icon: `https://fortnite-api.com/images/cosmetics/br/cid_0${i}_athena_commando_m_default/icon.png`,
        rarity: "",
        type: "",
      }));

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[#4a3aff]/10 via-[#9147ff]/5 to-[#00d4ff]/10" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9147ff]/10 blur-[100px]" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-[#00d4ff]/10 blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/3 h-80 w-80 rounded-full bg-[#4a3aff]/10 blur-[90px]" />
      </div>

      {/* Cosmetic carousel strip */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden py-3 opacity-30">
        <div className="flex animate-carousel gap-4">
          {carousel.map((item, i) => (
            <div key={i} className="flex w-20 shrink-0 flex-col items-center gap-1">
              <div className="flex aspect-square w-14 items-center justify-center rounded-xl bg-white/5 p-1">
                <img
                  src={item.icon}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo area */}
          <div className="mb-6 animate-fadeInUp">
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-pulse-glow rounded-2xl bg-[#9147ff]/20" />
              <div className="animate-spin-slow absolute h-16 w-16 rounded-full border-2 border-dashed border-[#9147ff]/40" />
              <span className="relative text-4xl">🎯</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Sprite Tracker
            </h1>
            <p className="mt-3 text-lg text-[#9ca3af]">
              Browse the full Fortnite catalog. Track what you own.
            </p>
          </div>

          {/* Auth card */}
          <div
            className="mx-auto mt-8 max-w-sm animate-fadeInUp rounded-2xl p-8"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-6 flex rounded-lg border border-[#1e1e2d] bg-[#13131a] p-1">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-[#9147ff] text-white shadow-lg shadow-purple-500/20"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-[#9147ff] text-white shadow-lg shadow-purple-500/20"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-left text-sm text-[#9ca3af]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-[#1e1e2d] bg-[#13131a] px-4 py-3 text-white outline-none transition-all focus:border-[#9147ff] focus:shadow-lg focus:shadow-purple-500/10"
                  placeholder="Enter username"
                  minLength={3}
                  maxLength={24}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-left text-sm text-[#9ca3af]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#1e1e2d] bg-[#13131a] px-4 py-3 text-white outline-none transition-all focus:border-[#9147ff] focus:shadow-lg focus:shadow-purple-500/10"
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <p className="animate-fadeInUp text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#9147ff] px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7] hover:shadow-purple-500/30 active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? "Loading..."
                  : mode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Browse All Cosmetics",
                desc: "Full Fortnite catalog at your fingertips",
              },
              {
                icon: "✅",
                title: "Track Your Collection",
                desc: "Click to mark owned — see what's missing",
              },
              {
                icon: "📊",
                title: "Progress Stats",
                desc: "Track your completion percentage",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="animate-fadeInUp glass glass-hover rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <span className="mb-2 block text-2xl">{f.icon}</span>
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-[#6b7280]">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Shop strip footer */}
          {shopItems.length > 0 && (
            <div className="mt-16 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
              <p className="mb-3 text-xs uppercase tracking-widest text-[#6b7280]">
                Currently in the Item Shop
              </p>
              <div className="flex justify-center gap-3">
                {shopItems.slice(0, 6).map((item, i) => (
                  <div
                    key={i}
                    className="group flex w-16 flex-col items-center gap-1"
                  >
                    <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white/5 p-1.5 transition-all group-hover:scale-110 group-hover:bg-white/10">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="truncate text-[10px] text-[#6b7280]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
