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
  smallIconUrl: string | null;
  featuredUrl: string | null;
  isUnreleased: boolean;
  addedToApi: string | null;
}

function rarityClass(r: string | null | undefined): string {
  if (!r) return "";
  return `r-${r.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
}

function Card({ item }: { item: CosmeticItem }) {
  const src = item.featuredUrl || item.iconUrl || item.smallIconUrl || "";
  return (
    <Link href={`/item/${item.id}`} className={`card ${rarityClass(item.rarity)}`}>
      <div className="card-media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} loading="lazy" />
        ) : null}
      </div>
      <div className="card-shade" />
      {item.isUnreleased && <span className="badge leak">LEAK</span>}
      <div className="card-body">
        <p className="card-title">{item.name}</p>
        <p className="card-sub">{item.itemTypeDisplay || item.itemType}</p>
      </div>
    </Link>
  );
}

type Tab = "unreleased" | "recent";

export default function LeaksPage() {
  const [tab, setTab] = useState<Tab>("unreleased");
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

  const list = tab === "unreleased" ? unreleased : recent;

  return (
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">FX</span>
            <span>Fortnite Tracker</span>
          </Link>
          <Link href="/shop" className="btn btn-ghost">Shop</Link>
          <Link href="/" className="btn btn-ghost">← Catalog</Link>
        </div>
      </header>

      <main className="shell" style={{ paddingTop: 22, paddingBottom: 32 }}>
        <div className="hero" style={{ padding: "8px 0 10px" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)" }}>Leaks & unreleased</h1>
          <p className="meta" style={{ marginTop: 6 }}>
            Items present in the API but not yet officially introduced, or added in the last two weeks.
          </p>
        </div>

        <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--bg-2)",
          border: "1px solid var(--line)", borderRadius: 10, marginTop: 6 }}>
          {(["unreleased", "recent"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "btn btn-primary" : "btn btn-ghost"}
              style={{ height: 32, padding: "0 14px" }}
            >
              {t === "unreleased" ? "Unreleased" : "Recently added"}
              <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 11 }}>
                {t === "unreleased" ? unreleased.length : recent.length}
              </span>
            </button>
          ))}
        </div>

        <div className="section-title">
          <h2>{tab === "unreleased" ? "Unreleased / leaked" : "Recently added"}</h2>
          <span className="meta">{list.length} items</span>
        </div>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card" style={{ opacity: 0.3 }} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="empty">
            <p>Nothing here right now.</p>
            <p className="meta">Sync the catalog to populate this list.</p>
          </div>
        ) : (
          <div className="grid">
            {list.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
