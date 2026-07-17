"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CosmeticItem {
  id: string;
  name: string;
  description: string | null;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  isUnreleased: boolean;
  lastShopAppearance: string | null;
  shopAppearances: number;
  introductionText: string | null;
  addedToApi: string | null;
}

interface FilterOption {
  value: string;
  count: number;
}

interface SearchResponse {
  items: CosmeticItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    types: FilterOption[];
    rarities: FilterOption[];
  };
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

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [typeOptions, setTypeOptions] = useState<FilterOption[]>([]);
  const [rarityOptions, setRarityOptions] = useState<FilterOption[]>([]);
  const [latestItems, setLatestItems] = useState<CosmeticItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetchCosmetics();
  }, [page, sort, typeFilter, rarityFilter]);

  useEffect(() => {
    fetch("/api/cosmetics/search?sort=recent&limit=8&unreleased=false")
      .then((r) => r.json())
      .then((d) => setLatestItems(d.items ?? []))
      .catch(() => {});
  }, []);

  async function fetchCosmetics() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (typeFilter) params.set("type", typeFilter);
    if (rarityFilter) params.set("rarity", rarityFilter);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "48");

    const res = await fetch(`/api/cosmetics/search?${params}`);
    const d: SearchResponse = await res.json();
    setData(d);
    if (d.filters) {
      setTypeOptions(d.filters.types);
      setRarityOptions(d.filters.rarities);
    }
    if (page === 1 && d.total > 0) setSynced(true);
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchCosmetics();
  }

  async function seedCatalog() {
    setSeeding(true);
    setStatusMessage("Syncing 15,000+ cosmetics...");
    try {
      const res = await fetch("/api/cosmetics/sync", { method: "POST" });
      const d = await res.json();
      setStatusMessage(`Synced ${d.updated} items`);
      fetchCosmetics();
      // Refresh latest
      fetch("/api/cosmetics/search?sort=recent&limit=8&unreleased=false")
        .then((r) => r.json())
        .then((d2) => setLatestItems(d2.items ?? []));
    } catch {
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
            {synced && (
              <span className="hidden text-xs text-[#6b7280] md:block">
                {data?.total.toLocaleString()} cosmetics
              </span>
            )}
            <button
              onClick={seedCatalog}
              disabled={seeding}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              {seeding ? "Syncing..." : "Sync"}
            </button>
            <Link
              href="/leaks"
              className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400 transition-all hover:bg-yellow-500/20"
            >
              🔥 Leaks
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#9147ff] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#a855f7]"
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

        {/* Recently Added / Hero */}
        {latestItems.length > 0 && synced && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">🆕 Recently Added</h2>
              <Link href="/leaks" className="text-xs text-[#6b7280] hover:text-white">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {latestItems.map((item) => (
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
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                    <p className="text-xs font-bold leading-tight text-white drop-shadow-lg lg:text-sm">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60 drop-shadow-lg">
                      {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search + Filters */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any cosmetic..."
            className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#6b7280] focus:border-[#9147ff]"
          />
          {typeOptions.length > 0 && (
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
          )}
          {rarityOptions.length > 0 && (
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
          )}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="name">Name A-Z</option>
            <option value="recent">Recently Added</option>
            <option value="shop">Last in Shop</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[#9147ff] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#a855f7]"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5" style={{ aspectRatio: "1/0.76" }} />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className="mt-16 text-center text-[#6b7280]">
            {synced ? (
              <>
                <p>No items match your filters</p>
                <button
                  onClick={() => {
                    setQuery(""); setTypeFilter(""); setRarityFilter(""); setPage(1);
                  }}
                  className="mt-3 text-sm text-[#9147ff] hover:text-[#a855f7]"
                >
                  Clear filters
                </button>
              </>
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
                    <p className="text-xs font-bold leading-tight text-white drop-shadow-lg lg:text-sm">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60 drop-shadow-lg">
                      {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition-all hover:text-white disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="px-3 text-sm text-[#6b7280]">
                  Page {page} of {data.totalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition-all hover:text-white disabled:opacity-30"
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
