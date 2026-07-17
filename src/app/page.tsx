"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

interface ShopItem {
  name: string;
  icon: string;
  renderImage: string;
  regularPrice: number;
  finalPrice: number;
  section: string;
  rarity: string;
  type: string;
  layoutId: string;
  tileSize: string;
}

interface ShopSection {
  name: string;
  items: ShopItem[];
}

interface ShopItemModalProps {
  item: ShopItem | null;
  onClose: () => void;
}

function ShopItemModal({ item, onClose }: ShopItemModalProps) {
  if (!item) return null;
  const onSale = item.finalPrice < item.regularPrice;
  const discount = onSale
    ? Math.round(
        ((item.regularPrice - item.finalPrice) / item.regularPrice) * 100
      )
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#14141a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square bg-gradient-to-b from-white/10 to-transparent">
          <img
            src={item.renderImage || item.icon}
            alt={item.name}
            className="h-full w-full object-contain p-8"
          />
          {onSale && (
            <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
              -{discount}%
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">
              {item.type}
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs capitalize text-white/60">
              {item.rarity || item.section}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold">{item.name}</h3>
          <div className="mt-4 flex items-center gap-2">
            {onSale ? (
              <>
                <span className="text-2xl font-bold text-white">
                  {item.finalPrice}
                </span>
                <span className="text-lg text-[#6b7280] line-through">
                  {item.regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-white">
                {item.regularPrice}
              </span>
            )}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#ffd700" />
              <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">V</text>
            </svg>
          </div>
          <p className="mt-1 text-sm text-[#6b7280]">{item.section}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [activeSection, setActiveSection] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => setSections(d.sections ?? []))
      .catch(() => {});
  }, []);

  const activeSections =
    activeSection === "all"
      ? sections
      : sections.filter((s) => s.name === activeSection);

  const hasDiscount = (item: ShopItem) => item.finalPrice < item.regularPrice;
  const discountPct = (item: ShopItem) =>
    Math.round(
      ((item.regularPrice - item.finalPrice) / item.regularPrice) * 100
    );

  const flatItems = sections.flatMap((s) => s.items);
  const sectionNames = sections.map((s) => s.name);

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top nav */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <span className="text-lg font-bold">Sprite Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-all hover:text-white"
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="rounded-lg bg-[#9147ff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Section filter nav */}
      {sections.length > 0 && (
        <div className="sticky top-[57px] z-30 border-b border-white/5 bg-[#0d0d15]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto py-3 scrollbar-hide"
            >
              <button
                onClick={() => setActiveSection("all")}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeSection === "all"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                All ({flatItems.length})
              </button>
              {sectionNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveSection(name)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeSection === name
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Auth section */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Track Your Fortnite Locker
            </h1>
            <p className="mt-3 text-[#9ca3af]">
              Browse every cosmetic, mark what you own, and see
              what you&apos;re missing.
            </p>
          </div>

          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
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
                className="w-full rounded-lg bg-[#9147ff] py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Item Shop title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Item Shop</h2>
            <p className="text-sm text-[#6b7280]">
              {flatItems.length} items currently available
            </p>
          </div>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            LIVE
          </span>
        </div>

        {/* Shop sections */}
        {activeSections.map((section) => {
          const [firstItem] = section.items;
          const hasItemsWithRender = section.items.some((i) => i.renderImage);

          return (
            <section key={section.name} className="mb-12">
              <div className="mb-5">
                <h3 className="text-xl font-bold">{section.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {section.items.map((item, i) => {
                  const onSale = hasDiscount(item);
                  const discount = discountPct(item);

                  return (
                    <button
                      key={`${item.name}-${i}`}
                      onClick={() => setSelectedItem(item)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
                        {hasItemsWithRender && item.renderImage ? (
                          <img
                            src={item.renderImage}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = "none";
                              const p = t.parentElement!;
                              const d = document.createElement("div");
                              d.className = "flex h-full items-center justify-center p-6";
                              const img = document.createElement("img");
                              img.src = item.icon;
                              img.className = "h-full w-full object-contain";
                              d.appendChild(img);
                              p.prepend(d);
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-6">
                            <img
                              src={item.icon}
                              alt={item.name}
                              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        {onSale && (
                          <div className="absolute left-2 top-2 -skew-x-[10deg] rounded-sm bg-white px-2.5 py-1 text-xs font-black text-black shadow-lg">
                            <span className="inline-block skew-x-[10deg] uppercase">
                              -{discount}%
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-sm font-bold leading-tight text-white drop-shadow-lg">
                            {item.name}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {onSale ? (
                              <>
                                <span className="text-sm font-bold text-white drop-shadow-lg">
                                  {item.finalPrice}
                                </span>
                                <span className="text-xs text-white/50 line-through">
                                  {item.regularPrice}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-white drop-shadow-lg">
                                {item.regularPrice}
                              </span>
                            )}
                            <svg className="h-3.5 w-3.5 drop-shadow-lg" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" fill="#ffd700" />
                              <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">V</text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {sections.length === 0 && (
          <div className="mt-24 text-center text-[#6b7280]">
            <p>Loading item shop...</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-white/5 py-8 text-center text-sm text-[#6b7280]">
          <p>
            Sprite Tracker &middot; Not affiliated with Epic Games &middot; Data
            from Fortnite-API.com
          </p>
        </footer>
      </main>

      {/* Item detail modal */}
      <ShopItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
