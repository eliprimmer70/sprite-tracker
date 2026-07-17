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
  filters: { types: FilterOption[]; rarities: FilterOption[] };
}

const TYPE_ICONS: Record<string, string> = {
  outfit: "👕", backpack: "🎒", pickaxe: "⛏️", emote: "💃",
  glider: "🪂", wrap: "🎨", spray: "🎭", emoji: "😄",
  loading_screen: "🖼️", music_pack: "🎵", contrail: "✨",
  pet: "🐾", jamtrack: "🎸", shoe: "👟",
};

const RARITY_STYLES: Record<string, string> = {
  uncommon: "border-l-green-500/40 text-green-400",
  rare: "border-l-blue-500/40 text-blue-400",
  epic: "border-l-purple-500/40 text-purple-400",
  legendary: "border-l-orange-500/40 text-orange-400",
  marvel: "border-l-red-500/40 text-red-400",
  dc: "border-l-blue-500/40 text-blue-400",
  icon: "border-l-cyan-500/40 text-cyan-400",
  gaminglegends: "border-l-yellow-500/40 text-yellow-400",
  starwars: "border-l-yellow-500/40 text-yellow-400",
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
    setStatusMessage("Syncing catalog...");
    try {
      const res = await fetch("/api/cosmetics/sync", { method: "POST" });
      const d = await res.json();
      setStatusMessage(`Synced ${d.updated.toLocaleString()} items`);
      fetchCosmetics();
      fetch("/api/cosmetics/search?sort=recent&limit=8&unreleased=false")
        .then((r) => r.json())
        .then((d2) => setLatestItems(d2.items ?? []));
    } catch { setStatusMessage("Sync failed"); }
    setSeeding(false);
  }

  const allItems = data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#3b6bff]/30">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b6bff] text-sm font-bold shadow-lg shadow-[#3b6bff]/20">
              I
            </span>
            <span className="text-base font-semibold tracking-tight">Item History</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/leaks"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-white/[0.15] hover:text-white"
            >
              Leaks
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#3b6bff] px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-[#3b6bff]/20 transition-all hover:bg-[#4a7bff]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Status bar */}
        {statusMessage && (
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white/60">
            {statusMessage}
          </div>
        )}

        {/* Recently Added */}
        {latestItems.length > 0 && synced && (
          <section className="mb-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Recently Added
              </h2>
              <Link href="/leaks" className="text-xs text-white/40 transition-colors hover:text-white/60">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {latestItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                  style={{ aspectRatio: "4/3" }}
                >
                  {item.iconUrl && (
                    <div
                      className="absolute inset-0 scale-110 bg-cover bg-center opacity-80 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                      style={{ backgroundImage: `url(${item.iconUrl})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium leading-tight text-white drop-shadow-lg">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {item.itemTypeDisplay || item.itemType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cosmetics..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#3b6bff]/50 focus:bg-white/[0.06]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#3b6bff]/50"
            >
              <option value="">Type</option>
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.value} ({t.count.toLocaleString()})
                </option>
              ))}
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#3b6bff]/50"
            >
              <option value="">Rarity</option>
              {rarityOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.value} ({r.count.toLocaleString()})
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#3b6bff]/50"
            >
              <option value="name">A-Z</option>
              <option value="recent">Newest</option>
              <option value="shop">Last in Shop</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#3b6bff] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#3b6bff]/15 transition-all hover:bg-[#4a7bff] active:scale-[0.98]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white/[0.04]" style={{ aspectRatio: "4/3" }} />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-sm text-white/30">
              {synced ? "No items match your filters." : "Catalog not loaded yet."}
            </p>
            {!synced && (
              <button
                onClick={seedCatalog}
                disabled={seeding}
                className="mt-4 rounded-xl bg-[#3b6bff] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#3b6bff]/15 transition-all hover:bg-[#4a7bff] disabled:opacity-50"
              >
                {seeding ? "Loading..." : "Load 15,000+ Cosmetics"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Count */}
            <p className="mb-4 text-xs text-white/30">
              {data?.total.toLocaleString()} results
              {query && <> for &ldquo;{query}&rdquo;</>}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {allItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.06] transition-all hover:border-white/[0.12]"
                  style={{ aspectRatio: "4/3" }}
                >
                  {item.iconUrl ? (
                    <div
                      className="absolute inset-0 scale-110 bg-cover bg-center opacity-80 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                      style={{ backgroundImage: `url(${item.iconUrl})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/[0.03]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />

                  {/* Badges */}
                  <div className="absolute left-2 top-2 flex gap-1.5">
                    {item.isUnreleased && (
                      <span className="rounded-md bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400 backdrop-blur-sm">
                        LEAK
                      </span>
                    )}
                    {item.lastShopAppearance && (
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
                        🛒 {new Date(item.lastShopAppearance).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 border-l-2 p-3 ${RARITY_STYLES[item.rarity ?? ""] ?? "border-l-white/10"}`}>
                    <p className="text-sm font-medium leading-tight text-white drop-shadow-lg">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {TYPE_ICONS[item.itemType] ?? ""} {item.itemTypeDisplay || item.itemType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-white/50 transition-all hover:text-white disabled:opacity-30"
                >
                  ← Back
                </button>
                <span className="text-sm text-white/30">
                  {page} / {data.totalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-white/50 transition-all hover:text-white disabled:opacity-30"
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
