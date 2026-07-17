"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  featuredUrl: string | null;
  showcaseVideo: string | null;
  series: string | null;
  price: number;
  regularPrice: number;
  tileSize: string;
};

type ShopSection = {
  name: string;
  layoutId: string;
  items: ShopItem[];
};

type ShopData = {
  sections: ShopSection[];
  totalItems: number;
  date: string;
};

function rarityClass(r: string | null | undefined): string {
  if (!r) return "";
  return `r-${r.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
}

function ItemCard({ item }: { item: ShopItem }) {
  const src = item.featuredUrl || item.iconUrl || "";
  const rClass = rarityClass(item.rarity);
  const onSale = item.regularPrice > 0 && item.price < item.regularPrice;
  const discount = onSale
    ? Math.round((1 - item.price / item.regularPrice) * 100)
    : 0;

  return (
    <Link href={`/item/${item.id}`} className={`card ${rClass}`}>
      <div className="card-media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} loading="lazy" />
        ) : null}
      </div>
      {item.showcaseVideo && (
        <div className="card-video-indicator">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <polygon points="10,8 16,12 10,16" fill="white" />
          </svg>
        </div>
      )}
      <div className="card-shade" />
      <div className="card-body">
        <p className="card-title">{item.name}</p>
        <p className="card-sub">{item.itemTypeDisplay || item.itemType}</p>
        <div className="card-price">
          {onSale ? (
            <>
              <span className="card-price-sale">{item.price}</span>
              <span className="card-price-original">{item.regularPrice}</span>
              <span className="card-price-badge">-{discount}%</span>
            </>
          ) : item.price > 0 ? (
            <span className="card-price-sale">{item.price}</span>
          ) : null}
          {item.price > 0 && <span className="card-price-vbucks" />}
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchShop = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/shop/current");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const d = await res.json();
      setData(d);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError("Failed to load shop. Try again.");
    }
    if (showLoading) setLoading(false);
  }, []);

  useEffect(() => {
    fetchShop(true);
    intervalRef.current = setInterval(() => fetchShop(), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchShop]);

  const shopDate = data?.date ? new Date(data.date) : null;
  const sections = data?.sections ?? [];

  return (
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">FX</span>
            <span>Fortnite Tracker</span>
          </Link>
          <div className="nav-actions">
            <Link href="/" className="btn btn-ghost">Catalog</Link>
            <Link href="/leaks" className="btn btn-ghost">Leaks</Link>
          </div>
        </div>
      </header>

      <main className="shell" style={{ paddingTop: 22, paddingBottom: 40 }}>
        <div className="hero" style={{ padding: "8px 0 10px" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
            Item Shop
          </h1>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 4 }}>
            <p className="meta" style={{ margin: 0 }}>
              {shopDate
                ? `Shop for ${shopDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "Loading shop..."}
            </p>
            {lastUpdated && (
              <span className="meta" style={{ fontSize: 11 }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="panel meta" style={{ marginBottom: 14, padding: "10px 14px", color: "#ff7b7b" }}>
            {error}
            <button className="btn btn-ghost" style={{ marginLeft: 12, height: 28, fontSize: 12 }} onClick={() => fetchShop(true)}>
              Retry
            </button>
          </div>
        )}

        {loading && !data ? (
          <div className="grid">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="card" style={{ opacity: 0.3 }} />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="empty">
            <p>No items in the shop right now.</p>
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.layoutId}>
              <div className="section-title">
                <h2>{section.name}</h2>
                <span className="meta">{section.items.length} item{section.items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid">
                {section.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}