"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CosmeticItem {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  iconUrl: string | null;
  isUnreleased: boolean;
  addedToApi: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  outfit: "👕",
  backpack: "🎒",
  pickaxe: "⛏️",
  emote: "💃",
  glider: "🪂",
  wrap: "🎨",
  spray: "🎭",
  emoji: "😄",
  loading_screen: "🖼️",
  music_pack: "🎵",
  contrail: "✨",
  pet: "🐾",
  jamtrack: "🎸",
  shoe: "👟",
};

export default function LeaksPage() {
  const [unreleased, setUnreleased] = useState<CosmeticItem[]>([]);
  const [recent, setRecent] = useState<CosmeticItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cosmetics/leaks")
      .then((r) => r.json())
      .then((d) => {
        setUnreleased(d.unreleased ?? []);
        setRecent(d.recent ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">🎯</Link>
            <span className="text-lg font-bold">Leaks & Upcoming</span>
          </div>
          <Link href="/" className="text-sm text-[#6b7280] hover:text-white">
            ← Catalog
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {loading ? (
          <p className="text-[#6b7280]">Loading...</p>
        ) : (
          <>
            {/* Unreleased / Leaked */}
            <section className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xl font-bold">🔥 Unreleased / Leaked</h2>
                <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs text-yellow-400">
                  {unreleased.length}
                </span>
              </div>
              {unreleased.length === 0 ? (
                <p className="text-[#6b7280]">No unreleased items found.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {unreleased.map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 transition-all hover:border-yellow-500/40"
                      style={{ aspectRatio: "1/0.76" }}
                    >
                      {item.iconUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${item.iconUrl})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a1a2e]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-2 top-2 -skew-x-12 rounded-sm bg-yellow-500 px-2 py-0.5 shadow-lg">
                        <span className="inline-block skew-x-12 text-[10px] font-black uppercase text-black">Leak</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                        <p className="text-xs font-bold leading-tight text-white drop-shadow-lg">{item.name}</p>
                        <p className="mt-0.5 text-[10px] text-white/60 drop-shadow-lg">
                          {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recently added */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xl font-bold">🆕 Recently Added to API</h2>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400">
                  {recent.length}
                </span>
              </div>
              {recent.length === 0 ? (
                <p className="text-[#6b7280]">No recently added items.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {recent.map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-white/20"
                      style={{ aspectRatio: "1/0.76" }}
                    >
                      {item.iconUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${item.iconUrl})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a1a2e]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                        <p className="text-xs font-bold leading-tight text-white drop-shadow-lg">{item.name}</p>
                        <p className="mt-0.5 text-[10px] text-white/60 drop-shadow-lg">
                          {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
