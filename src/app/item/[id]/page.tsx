import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

type ShopEntry = {
  id: string;
  seenAt: Date;
  price: number | null;
  section: string | null;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  itemType: string;
  itemTypeDisplay: string | null;
  rarity: string | null;
  rarityDisplay: string | null;
  series: string | null;
  set: string | null;
  introductionChapter: string | null;
  introductionSeason: string | null;
  introductionText: string | null;
  iconUrl: string | null;
  smallIconUrl: string | null;
  featuredUrl: string | null;
  showcaseVideo: string | null;
  addedToApi: Date | null;
  isUnreleased: boolean;
  lastShopAppearance: Date | null;
  shopAppearances: number;
  shopHistory: ShopEntry[];
};

async function getItem(id: string): Promise<Item | null> {
  const item = await prisma.cosmeticItem.findUnique({
    where: { id },
    include: { shopHistory: { orderBy: { seenAt: "desc" }, take: 40 } },
  });
  return item as unknown as Item | null;
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const art = item.featuredUrl || item.iconUrl || item.smallIconUrl;
  const rColor = `var(--c-${(item.rarity || "common").replace(/[^a-z0-9]/gi, "").toLowerCase() || "common"}, #b8c2d1)`;

  const fmtLong = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">FX</span>
            <span>Fortnite Tracker</span>
          </Link>
          <Link href="/" className="btn btn-ghost">← Catalog</Link>
        </div>
      </header>

      <main className="shell" style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div className="detail-grid">
          <div>
            <div
              className="detail-art"
              style={{ ["--rarity" as string]: rColor } as React.CSSProperties}
            >
              {art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art} alt={item.name} />
              ) : (
                <span className="meta">No image available</span>
              )}
            </div>

            {item.showcaseVideo && (
              <div style={{ marginTop: 14 }}>
                <div className="meta" style={{
                  textTransform: "uppercase", letterSpacing: 0.06,
                  fontSize: 11, marginBottom: 8, fontWeight: 600,
                }}>
                  Showcase
                </div>
                <div className="vid-wrap">
                  <iframe
                    src={`https://www.youtube.com/embed/${item.showcaseVideo}`}
                    title={`${item.name} showcase`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {item.rarityDisplay && (
                  <span
                    className="badge"
                    style={{
                      background: `color-mix(in srgb, ${rColor} 18%, transparent)`,
                      borderColor: `color-mix(in srgb, ${rColor} 55%, transparent)`,
                      color: rColor,
                    }}
                  >
                    {item.rarityDisplay}
                  </span>
                )}
                <span className="badge">{item.itemTypeDisplay || item.itemType}</span>
                {item.isUnreleased && <span className="badge leak">UNRELEASED</span>}
              </div>
              <h1 className="now" style={{
                margin: 0, fontSize: "clamp(1.7rem, 3.2vw, 2.2rem)",
                fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.01em", lineHeight: 1.04,
              }}>
                {item.name}
              </h1>
              {item.description && (
                <p className="meta" style={{ marginTop: 8, lineHeight: 1.55, fontSize: 14 }}>
                  {item.description}
                </p>
              )}
            </div>

            <div className="panel">
              <div className="meta" style={{
                textTransform: "uppercase", letterSpacing: 0.07,
                fontSize: 11, fontWeight: 600, marginBottom: 12,
              }}>
                Timeline
              </div>
              <div className="timeline-row">
                <div className="timeline-icon">📅</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>First introduced</div>
                  <div className="meta">{item.introductionText || "Unknown"}</div>
                </div>
              </div>
              <div className="timeline-row">
                <div className="timeline-icon">🛒</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Last in shop</div>
                  <div className="meta">
                    {item.lastShopAppearance
                      ? `${fmtLong(new Date(item.lastShopAppearance))}`
                      : "Not recorded (shop tracking recently started)"}
                  </div>
                  {item.shopAppearances > 0 && (
                    <div className="meta">
                      Seen {item.shopAppearances} time{item.shopAppearances !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
              <div className="timeline-row">
                <div className="timeline-icon">📡</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Added to API</div>
                  <div className="meta">
                    {item.addedToApi ? fmtLong(new Date(item.addedToApi)) : "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="meta" style={{
                textTransform: "uppercase", letterSpacing: 0.07,
                fontSize: 11, fontWeight: 600, marginBottom: 12,
              }}>
                Details
              </div>
              <div className="kv">
                {item.set && (
                  <>
                    <span>Set</span>
                    <span>{item.set}</span>
                  </>
                )}
                {item.series && (
                  <>
                    <span>Series</span>
                    <span>{item.series}</span>
                  </>
                )}
                {item.introductionChapter && (
                  <>
                    <span>Chapter</span>
                    <span>{item.introductionChapter}</span>
                  </>
                )}
                {item.introductionSeason && (
                  <>
                    <span>Season</span>
                    <span>{item.introductionSeason}</span>
                  </>
                )}
                <span>Type</span>
                <span>{item.itemTypeDisplay || item.itemType}</span>
                <span>ID</span>
                <span style={{ wordBreak: "break-all", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
                  {item.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {item.shopHistory.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="section-title">
              <h2>Shop appearances</h2>
              <span className="meta">{item.shopHistory.length} records</span>
            </div>
            <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Section</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {item.shopHistory.map((entry) => (
                    <tr key={entry.id}>
                      <td>{fmtShort(new Date(entry.seenAt))}</td>
                      <td className="meta">{entry.section || "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        {entry.price ? `${entry.price.toLocaleString()} V-Bucks` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
