"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rarityGradient, rarityStyle, videoThumb } from "@/lib/rarity";
import { ArrowLeft } from "lucide-react";

interface CosmeticItem {
  id: string;
  name: string;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  iconUrl: string | null;
  featuredUrl?: string | null;
  showcaseVideo?: string | null;
  isUnreleased: boolean;
}

function Card({ item }: { item: CosmeticItem }) {
  const rs = rarityStyle(item.rarity);
  const thumb = videoThumb(item.showcaseVideo);
  const isEmote = item.itemType === "emote" || item.itemType === "dance";
  const cover = !!(isEmote && thumb);
  const src = cover ? thumb! : item.featuredUrl || item.iconUrl || "";

  return (
    <Link href={`/item/${item.id}`} className="card">
      <div className={`card-media${cover ? " cover" : ""}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} loading="lazy" />
        ) : null}
      </div>
      <div className="card-shade" style={{ background: rarityGradient(item.rarity) }} />
      <div
        className="card-shade"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 42%)" }}
      />
      {item.rarityDisplay && (
        <span className="badge rarity-tag" style={{ background: rs.hex }}>
          <span>{rs.label}</span>
        </span>
      )}
      {item.isUnreleased && (
        <span className="badge leak" style={{ left: "auto", right: "0.5rem" }}>
          <span>Leak</span>
        </span>
      )}
      {cover && <span className="play-pip" aria-hidden="true">▶</span>}
      <div className="card-body">
        <p className="card-title">{item.name}</p>
        <p className="card-sub">{item.itemTypeDisplay || item.itemType}</p>
      </div>
    </Link>
  );
}

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
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">SL</span>
            <span>Sprite Lookup</span>
          </Link>
          <Link href="/" className="btn">
            <ArrowLeft size={14} /> Catalog
          </Link>
        </div>
      </header>

      <main className="shell" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : (
          <>
            <section className="hero" style={{ padding: "0 0 1rem" }}>
              <h1>Leaks</h1>
              <p>Unreleased &amp; recently added cosmetics scraped from the API.</p>
            </section>

            <section>
              <div className="section-title">
                <h2>Unreleased / Leaked</h2>
                <span className="meta">{unreleased.length}</span>
              </div>
              <div className="grid">
                {unreleased.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section style={{ marginTop: "2rem" }}>
              <div className="section-title">
                <h2>Recently added</h2>
                <span className="meta">{recent.length}</span>
              </div>
              <div className="grid">
                {recent.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
