"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CosmeticSummary {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  isUnreleased: boolean;
  lastShopAppearance: string | null;
  shopAppearances: number;
  introductionText: string | null;
}

interface SearchResponse {
  items: CosmeticSummary[];
  total: number;
  page: number;
  totalPages: number;
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

const VBuckIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#ffd700" />
    <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">V</text>
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [typeOptions, setTypeOptions] = useState<{ value: string; count: number }[]>([]);
  const [rarityOptions, setRarityOptions] = useState<{ value: string; count: number }[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetchCosmetics();
  }, [page, sort, typeFilter, rarityFilter, query]);

  async function fetchCosmetics() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (typeFilter) params.set("type", typeFilter);
    if (rarityFilter) params.set("rarity", rarityFilter);
    params.set("sort", sort);
    params.set("page", String(page));

    const res = await fetch(`/api/cosmetics/search?${params}`);
    const d: SearchResponse = await res.json();
    setData(d);
    if (page === 1 && d.total > 0) {
      setSynced(true);
    }
    setLoading(false);
  }

  async function seedCatalog() {
    setSeeding(true);
    setStatusMessage("Syncing catalog from Fortnite-API...");
    try {
      const res = await fetch("/api/cosmetics/sync", { method: "POST" });
      const d = await res.json();
      setStatusMessage(`Synced ${d.created} new + ${d.updated} updated (${d.total} total)`);
      fetchCosmetics();
    } catch (e) {
      setStatusMessage("Sync failed");
    }
    setSeeding(false);
  }

  const allItems = data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <span className="text-lg font-bold">Item History</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">
              {data ? `${data.total} cosmetics` : ""}
            </span>
            <button
              onClick={seedCatalog}
              disabled={seeding}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              {seeding ? "Syncing..." : "Sync Catalog"}
            </button>
            <Link
              href="/leaks"
              className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400 transition-all hover:bg-yellow-500/20"
            >
              🔥 Leaks
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#9147ff] px-3 py-1.5 text-xs font-medium text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Status */}
        {statusMessage && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#9ca3af]">
            {statusMessage}
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search any cosmetic..."
            className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-[#9147ff]"
          />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="">All Types</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {TYPE_ICONS[t.value] ?? "📦"} {t.value} ({t.count})
              </option>
            ))}
          </select>
          <select
            value={rarityFilter}
            onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="">All Rarities</option>
            {rarityOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value} ({r.count})
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="name">Name A-Z</option>
            <option value="recent">Recently Added</option>
            <option value="shop">Last in Shop</option>
          </select>
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5" style={{ aspectRatio: "1/0.76" }} />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className="mt-24 text-center text-[#6b7280]">
            {synced ? (
              <p>No items match your filters</p>
            ) : (
              <div>
                <p className="mb-4">Catalog not synced yet.</p>
                <button
                  onClick={seedCatalog}
                  disabled={seeding}
                  className="rounded-lg bg-[#9147ff] px-6 py-3 font-medium text-white hover:bg-[#a855f7] disabled:opacity-50"
                >
                  {seeding ? "Syncing..." : "Sync 15,000+ Cosmetics"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {allItems.map((item) => (
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

                  {item.isUnreleased && (
                    <div className="absolute left-2 top-2 z-10 -skew-x-12 rounded-sm bg-yellow-500 px-2 py-0.5 shadow-lg">
                      <span className="inline-block skew-x-12 text-[10px] font-black uppercase text-black">Leak</span>
                    </div>
                  )}

                  {item.lastShopAppearance && (
                    <div className="absolute right-2 top-2 z-10 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
                      🛒 {new Date(item.lastShopAppearance).toLocaleDateString()}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                    <p className="text-xs font-bold leading-tight text-white drop-shadow-lg">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60 drop-shadow-lg">
                      {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="px-3 text-sm text-[#6b7280]">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
