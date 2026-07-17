"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rarityGradient, rarityStyle, videoThumb } from "@/lib/rarity";

interface CosmeticItem {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  smallIconUrl?: string | null;
  featuredUrl?: string | null;
  showcaseVideo?: string | null;
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

function CosmeticCard({ item }: { item: CosmeticItem }) {
  const rs = rarityStyle(item.rarity);
  const thumb = videoThumb(item.showcaseVideo);
  // For emotes/dances, prefer the showcase-video thumbnail (real gameplay footage)
  // over the static icon. For everything else prefer featured > icon.
  const isEmote = item.itemType === "emote" || item.itemType === "dance";
  const cover = !!(isEmote && thumb);
  const src = cover
    ? thumb!
    : item.featuredUrl || item.iconUrl || "";

  return (
    <Link href={`/item/${item.id}`} className="card">
      <div className={`card-media${cover ? " cover" : ""}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} loading="lazy" />
        ) : null}
      </div>
      {/* bottom-up rarity gradient */}
      <div
        className="card-shade"
        style={{ background: rarityGradient(item.rarity) }}
      />
      <div
        className="card-shade"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 42%)",
        }}
      />
      {/* always-on rarity tag (tinted), plus leak tag if unreleased */}
      {item.rarityDisplay && (
        <span
          className="badge rarity-tag"
          style={{ background: rs.hex }}
        >
          <span>{rs.label}</span>
        </span>
      )}
      {item.isUnreleased && (
        <span className="badge leak" style={{ left: "auto", right: "0.5rem" }}>
          <span>Leak</span>
        </span>
      )}
      {cover && (
        <span className="play-pip" aria-hidden="true">
          ▶
        </span>
      )}
      <div className="card-body">
        <p className="card-title">{item.name}</p>
        <p className="card-sub">
          {item.itemTypeDisplay || item.itemType}
        </p>
      </div>
    </Link>
  );
}

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
  const [popular, setPopular] = useState<CosmeticItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetchCosmetics();
  }, [page, sort, typeFilter, rarityFilter]);

  useEffect(() => {
    fetch("/api/cosmetics/search?sort=recent&limit=10&unreleased=false")
      .then((r) => r.json())
      .then((d) => setPopular((d.items ?? []).filter((i: CosmeticItem) => i.iconUrl)))
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
    setStatusMessage("Syncing catalog (this can take a minute)...");
    try {
      const res = await fetch("/api/cosmetics/sync", { method: "POST" });
      const d = await res.json();
      setStatusMessage(`Synced ${d.updated?.toLocaleString?.() ?? d.updated} items`);
      fetchCosmetics();
      fetch("/api/cosmetics/search?sort=recent&limit=10&unreleased=false")
        .then((r) => r.json())
        .then((d2) => setPopular((d2.items ?? []).filter((i: CosmeticItem) => i.iconUrl)));
    } catch {
      setStatusMessage("Sync failed");
    }
    setSeeding(false);
  }

  const allItems = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const topTypes = typeOptions.slice(0, 4);

  return (
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">SL</span>
            <span>Sprite Lookup</span>
          </Link>
          <div className="nav-actions">
            <Link href="/leaks" className="btn">Leaks</Link>
            <button className="btn" onClick={seedCatalog} disabled={seeding}>
              {seeding ? "Syncing…" : "Sync"}
            </button>
            <Link href="/login" className="btn btn-primary">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <h1>Every cosmetic.<br />Tracked.</h1>
          <p>
            Search the full Fortnite catalog. See when an outfit first dropped,
            when an emote last rotated through the shop, watch showcase videos,
            and catch what&apos;s still unreleased.
          </p>
          {topTypes.length > 0 && (
            <div className="stat-row">
              {topTypes.map((t) => (
                <div className="stat" key={t.value}>
                  <div className="stat-num">{t.count.toLocaleString()}</div>
                  <div className="stat-label">{t.value}s</div>
                </div>
              ))}
              <div className="stat">
                <div className="stat-num">{totalItems.toLocaleString()}</div>
                <div className="stat-label">total</div>
              </div>
            </div>
          )}
        </section>

        {statusMessage && (
          <div className="panel meta" style={{ marginBottom: "1rem" }}>
            {statusMessage}
          </div>
        )}

        {popular.length > 0 && synced && (
          <section>
            <div className="section-title">
              <h2>Recent</h2>
              <span className="meta">Fresh from the API</span>
            </div>
            <div className="grid">
              {popular.map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search outfits, emotes, wraps..."
          />
          <select
            className="select"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.value} ({t.count.toLocaleString()})
              </option>
            ))}
          </select>
          <select
            className="select"
            value={rarityFilter}
            onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}
          >
            <option value="">All rarities</option>
            {rarityOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value} ({r.count.toLocaleString()})
              </option>
            ))}
          </select>
          <select
            className="select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="name">Name A–Z</option>
            <option value="recent">Newest</option>
            <option value="shop">Last in shop</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="card"
                style={{ opacity: 0.3, background: "var(--panel-2)" }}
              />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className="empty">
            {synced ? (
              <p>No matches. Try another search.</p>
            ) : (
              <>
                <p>Catalog is empty</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={seedCatalog}
                  disabled={seeding}
                >
                  {seeding ? "Loading…" : "Load catalog"}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="section-title">
              <h2>Catalog</h2>
              <span className="meta">{data?.total.toLocaleString()} results</span>
            </div>
            <div className="grid">
              {allItems.map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>
            {data && data.totalPages > 1 && (
              <div className="pager">
                <button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Back
                </button>
                <span className="meta">{page} / {data.totalPages.toLocaleString()}</span>
                <button
                  className="btn"
                  disabled={page === data.totalPages}
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
