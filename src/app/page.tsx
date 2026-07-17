"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface CosmeticItem {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  smallIconUrl: string | null;
  featuredUrl: string | null;
  isUnreleased: boolean;
  lastShopAppearance: string | null;
  introductionText: string | null;
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

function rarityClass(r: string | null | undefined): string {
  if (!r) return "";
  return `r-${r.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
}

function CosmeticCard({ item }: { item: CosmeticItem }) {
  // Prefer featured for outfits; emotes/wraps/sprays use icon (square).
  // The API's "icon" is already a clean cropped PNG with transparency.
  const src = item.featuredUrl || item.iconUrl || item.smallIconUrl || "";
  const rClass = rarityClass(item.rarity);
  const lastSeen = item.lastShopAppearance
    ? new Date(item.lastShopAppearance).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <Link href={`/item/${item.id}`} className={`card ${rClass}`}>
      <div className="card-media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} loading="lazy" />
        ) : null}
      </div>
      <div className="card-shade" />
      {item.isUnreleased && <span className="badge leak">LEAK</span>}
      {lastSeen && !item.isUnreleased && <span className="seen-chip">{lastSeen}</span>}
      <div className="card-body">
        <p className="card-title">{item.name}</p>
        <p className="card-sub">{item.itemTypeDisplay || item.itemType}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [hideUnreleased, setHideUnreleased] = useState(false);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [typeOptions, setTypeOptions] = useState<FilterOption[]>([]);
  const [rarityOptions, setRarityOptions] = useState<FilterOption[]>([]);
  const [popular, setPopular] = useState<CosmeticItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [synced, setSynced] = useState(false);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 240);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, typeFilter, rarityFilter, hideUnreleased, sort, page]);

  useEffect(() => {
    fetch("/api/cosmetics/search?sort=recent&limit=12")
      .then((r) => r.json())
      .then((d) => setPopular((d.items ?? []).filter((i: CosmeticItem) => i.iconUrl || i.featuredUrl)))
      .catch(() => {});
  }, []);

  async function fetchPage() {
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (typeFilter) params.set("type", typeFilter);
    if (rarityFilter) params.set("rarity", rarityFilter);
    if (hideUnreleased) params.set("unreleased", "false");
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "60");
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

  async function seedCatalog() {
    setSeeding(true);
    setStatusMessage("Syncing catalog...");
    try {
      const res = await fetch("/api/cosmetics/sync", { method: "POST" });
      const d = await res.json();
      setStatusMessage(`Synced ${d.total?.toLocaleString?.() ?? d.total} items.`);
      setSynced(true);
      fetchPage();
      fetch("/api/cosmetics/search?sort=recent&limit=12")
        .then((r) => r.json())
        .then((d2) => setPopular((d2.items ?? []).filter((i: CosmeticItem) => i.iconUrl || i.featuredUrl)));
    } catch {
      setStatusMessage("Sync failed.");
    }
    setSeeding(false);
  }

  const allItems = data?.items ?? [];
  const hasResults = allItems.length > 0;
  const showFiltersStrip = useMemo(
    () => synced || loading || hasResults,
    [synced, loading, hasResults],
  );

  return (
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">FX</span>
            <span>Fortnite Tracker</span>
          </Link>
          <div className="nav-actions">
            <Link href="/shop" className="btn btn-ghost">Shop</Link>
            <Link href="/leaks" className="btn btn-ghost">Leaks</Link>
            <button className="btn btn-ghost" onClick={seedCatalog} disabled={seeding}>
              {seeding ? "Syncing…" : "Sync catalog"}
            </button>
            <Link href="/login" className="btn btn-primary">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <h1>Catalog &middot; Shop history &middot; Leaks</h1>
          <p>
            Every cosmetic in the current Fortnite API. Filter by type, rarity, or series.
            Each item shows its release chapter/season, last shop appearance, and a watchable emote showcase.
          </p>
        </section>

        {statusMessage && (
          <div className="panel meta" style={{ marginBottom: 14, padding: "10px 14px" }}>
            {statusMessage}
          </div>
        )}

        {!synced && !loading && (
          <div className="panel" style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>No cosmetics loaded yet.</div>
            <p className="meta" style={{ margin: 0 }}>
              Pull the full catalog from the community Fortnite API. Takes about a minute, no Epic account required.
            </p>
            <div>
              <button className="btn btn-primary" onClick={seedCatalog} disabled={seeding}>
                {seeding ? "Loading…" : "Load catalog"}
              </button>
            </div>
          </div>
        )}

        {popular.length > 0 && !debounced && !typeFilter && !rarityFilter && (
          <section>
            <div className="section-title">
              <h2>Recently added</h2>
              <span className="meta">Last 14 days</span>
            </div>
            <div className="grid">
              {popular.map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {showFiltersStrip && (
          <>
            <div className="section-title">
              <h2>Catalog</h2>
              {data && <span className="meta">{data.total.toLocaleString()} items</span>}
            </div>

            <form
              className="toolbar"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                fetchPage();
              }}
            >
              <input
                className="field"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by name…"
              />
              <select className="select" value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="">All types</option>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.value} ({t.count.toLocaleString()})
                  </option>
                ))}
              </select>
              <select className="select" value={rarityFilter}
                onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}>
                <option value="">All rarities</option>
                {rarityOptions.filter((r) => r.value && r.value !== "null").map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.value} ({r.count.toLocaleString()})
                  </option>
                ))}
              </select>
              <select className="select" value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="name">A–Z</option>
                <option value="recent">Newest</option>
                <option value="shop">Last in shop</option>
              </select>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12.5, color: "var(--text-dim)", cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" checked={hideUnreleased}
                  onChange={(e) => { setHideUnreleased(e.target.checked); setPage(1); }}
                  style={{ accentColor: "#3b6bff" }} />
                Hide unreleased
              </label>
            </form>

            {loading ? (
              <div className="grid">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="card" style={{
                    opacity: 0.35,
                    background: "linear-gradient(180deg, #1b2238, #11151f)",
                  }} />
                ))}
              </div>
            ) : !hasResults ? (
              <div className="empty">
                <p>No matches. Try clearing filters.</p>
              </div>
            ) : (
              <>
                <div className="grid">
                  {allItems.map((item) => (
                    <CosmeticCard key={item.id} item={item} />
                  ))}
                </div>
                {data && data.totalPages > 1 && (
                  <div className="pager">
                    <button className="btn btn-ghost" disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      ← Prev
                    </button>
                    <span className="meta">Page {page} / {data.totalPages.toLocaleString()}</span>
                    <button className="btn btn-ghost" disabled={page === data.totalPages}
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
