"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

interface ShopEntry {
  name: string;
  icon: string;
  renderImage: string;
  regularPrice: number;
  finalPrice: number;
  section: string;
  rarity: string;
  type: string;
}

interface ShopSection {
  name: string;
  items: ShopEntry[];
}

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [heroItem, setHeroItem] = useState<ShopEntry | null>(null);

  useEffect(() => {
    fetch("https://fortnite-api.com/v2/shop")
      .then((r) => r.json())
      .then((d) => {
        const entries = d.data?.entries ?? [];
        const sectionMap = new Map<string, ShopEntry[]>();

        for (const e of entries) {
          const items = e.brItems ?? e.items ?? [];
          const layout = e.layout ?? {};
          const sectionName = layout.name ?? "Featured";
          const colors = e.colors ?? {};
          const render =
            e.newDisplayAsset?.renderImages?.[0]?.image ?? "";
          const regular = e.regularPrice ?? 0;
          const final = e.finalPrice ?? 0;

          for (const item of items) {
            const name = item.name;
            const icon = item.images?.icon;
            if (name && icon) {
              const entry: ShopEntry = {
                name,
                icon,
                renderImage: render,
                regularPrice: regular,
                finalPrice: final,
                section: sectionName,
                rarity:
                  item.rarity?.displayValue ?? item.rarity?.value ?? "",
                type: item.type?.displayValue ?? "",
              };
              const existing = sectionMap.get(sectionName) ?? [];
              existing.push(entry);
              sectionMap.set(sectionName, existing);
            }
          }
        }

        const result: ShopSection[] = [];
        for (const [name, items] of sectionMap) {
          result.push({ name, items });
        }
        setSections(result);

        // Find an outfit for hero
        for (const [, items] of sectionMap) {
          const outfit = items.find((i) => i.type === "Outfit" && i.renderImage);
          if (outfit) {
            setHeroItem(outfit);
            break;
          }
        }
      })
      .catch(() => {});
  }, []);

  const totalShopItems = sections.reduce((s, sec) => s + sec.items.length, 0);

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
    <div className="relative min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {heroItem?.renderImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroItem.renderImage})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        </div>

        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#4a3aff]/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#9147ff]/10 blur-[100px]" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="text-lg font-bold tracking-tight md:text-xl">
              Sprite Tracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="rounded-lg bg-[#9147ff] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7]"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto mt-20 flex max-w-7xl flex-col items-start px-6 md:mt-32 md:px-12">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#9147ff]/30 bg-[#9147ff]/10 px-4 py-1.5 text-sm text-[#a855f7]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#a855f7]" />
              Free Fortnite Collection Tracker
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Track Your{" "}
              <span className="bg-gradient-to-r from-[#9147ff] via-[#a855f7] to-[#00d4ff] bg-clip-text text-transparent">
                Locker
              </span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#9ca3af]">
              Browse every cosmetic, mark what you own, and see
              what you&apos;re still missing.
            </p>

            {/* Auth card inline */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:max-w-sm">
              <div className="mb-4 flex rounded-lg border border-white/10 bg-white/5 p-1">
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

              <form onSubmit={handleSubmit} className="space-y-3">
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
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#9147ff] px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading
                    ? "Loading..."
                    : mode === "login"
                      ? "Log In"
                      : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Live Item Shop */}
      <div className="relative border-t border-white/5 bg-[#0d0d15] py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Item Shop</h2>
              <p className="mt-2 text-[#6b7280]">
                {totalShopItems} items currently available
              </p>
            </div>
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
              LIVE
            </span>
          </div>

          {sections.map((section) => (
            <div key={section.name} className="mb-14">
              <h3 className="mb-5 text-lg font-semibold text-white/80">
                {section.name}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {section.items.slice(0, 12).map((item, i) => {
                  const onSale = item.finalPrice < item.regularPrice;
                  const discount = onSale
                    ? Math.round(
                        ((item.regularPrice - item.finalPrice) /
                          item.regularPrice) *
                          100
                      )
                    : 0;

                  return (
                    <div
                      key={`${item.name}-${i}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
                        <img
                          src={item.renderImage || item.icon}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Discount badge */}
                        {onSale && (
                          <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                            -{discount}%
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">
                          {item.type}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {onSale ? (
                            <>
                              <span className="text-sm font-bold text-white">
                                {item.finalPrice}
                              </span>
                              <span className="text-xs text-[#6b7280] line-through">
                                {item.regularPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {item.regularPrice}
                            </span>
                          )}
                          <span className="text-[10px] text-yellow-400">🪙</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-white/5 bg-[#0a0a0f] py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-[#6b7280]">
              Three simple steps to track your collection
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up in seconds. No Epic Games login required.",
              },
              {
                step: "02",
                title: "Browse Cosmetics",
                desc: "Explore the full catalog of every Fortnite item ever released.",
              },
              {
                step: "03",
                title: "Track Progress",
                desc: "Tap to mark owned. See your completion % instantly.",
              },
            ].map((f) => (
              <div
                key={f.step}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                <span className="mb-4 block text-4xl font-black text-[#9147ff] opacity-40">
                  {f.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#6b7280]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#6b7280]">
        <p>Sprite Tracker &middot; Not affiliated with Epic Games &middot; Data from Fortnite-API.com</p>
      </footer>
    </div>
  );
}
