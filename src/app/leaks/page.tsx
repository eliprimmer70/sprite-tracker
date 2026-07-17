"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CosmeticItem {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  iconUrl: string | null;
  isUnreleased: boolean;
  addedToApi: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  outfit: "👕", backpack: "🎒", pickaxe: "⛏️", emote: "💃",
  glider: "🪂", wrap: "🎨", spray: "🎭", emoji: "😄",
  loading_screen: "🖼️", music_pack: "🎵", contrail: "✨",
  pet: "🐾", jamtrack: "🎸", shoe: "👟",
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
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b6bff] text-sm font-bold shadow-lg shadow-[#3b6bff]/20">
              I
            </span>
            <span className="text-base font-semibold tracking-tight">Leaks</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 transition-colors hover:text-white/60">
            ← Back
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white/[0.04]" style={{ aspectRatio: "4/3" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Unreleased */}
            <section className="mb-14">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">Unreleased / Leaked</h2>
                <span className="rounded-md bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
                  {unreleased.length}
                </span>
              </div>
              {unreleased.length === 0 ? (
                <p className="text-sm text-white/30">No unreleased items found.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {unreleased.map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group relative overflow-hidden rounded-xl border border-yellow-500/15 transition-all hover:border-yellow-500/30"
                      style={{ aspectRatio: "4/3" }}
                    >
                      {item.iconUrl && (
                        <div
                          className="absolute inset-0 scale-110 bg-cover bg-center opacity-80 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                          style={{ backgroundImage: `url(${item.iconUrl})` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />
                      <div className="absolute left-2 top-2 rounded-md bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400 backdrop-blur-sm">
                        LEAK
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 border-l-2 border-l-yellow-500/40 p-3">
                        <p className="text-sm font-medium leading-tight text-white drop-shadow-lg">{item.name}</p>
                        <p className="mt-0.5 text-xs text-white/50">
                          {TYPE_ICONS[item.itemType] ?? ""} {item.itemTypeDisplay || item.itemType}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recently added */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">Recently Added to API</h2>
                <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                  {recent.length}
                </span>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-white/30">Nothing recently added.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {recent.map((item) => (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] transition-all hover:border-white/[0.12]"
                      style={{ aspectRatio: "4/3" }}
                    >
                      {item.iconUrl && (
                        <div
                          className="absolute inset-0 scale-110 bg-cover bg-center opacity-80 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                          style={{ backgroundImage: `url(${item.iconUrl})` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 border-l-2 border-l-white/10 p-3">
                        <p className="text-sm font-medium leading-tight text-white drop-shadow-lg">{item.name}</p>
                        <p className="mt-0.5 text-xs text-white/50">
                          {TYPE_ICONS[item.itemType] ?? ""} {item.itemTypeDisplay || item.itemType}
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
