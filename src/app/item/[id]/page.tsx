import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rarityGradient, rarityStyle, videoThumb } from "@/lib/rarity";
import { Calendar, ShoppingCart, Radio, ArrowLeft } from "lucide-react";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.cosmeticItem.findUnique({
    where: { id },
    include: {
      shopHistory: { orderBy: { seenAt: "desc" }, take: 30 },
    },
  });

  if (!item) notFound();

  const rs = rarityStyle(item.rarity);
  const art = item.featuredUrl || item.iconUrl || item.smallIconUrl;
  const isEmote = item.itemType === "emote" || item.itemType === "dance";
  const thumb = videoThumb(item.showcaseVideo);
  // emotes look better as the video thumb on the detail art too
  const artSrc = isEmote && thumb ? thumb : art;

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

      <main className="shell" style={{ paddingTop: "1.5rem", paddingBottom: "2.5rem" }}>
        <div className="detail-grid">
          <div className="detail-art">
            {artSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artSrc} alt={item.name} />
            ) : (
              <span className="meta">No image</span>
            )}
            <div
              className="detail-shade"
              style={{ background: rarityGradient(item.rarity) }}
            />
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                {item.rarityDisplay && (
                  <span
                    className="badge rarity-tag"
                    style={{ position: "static", transform: "none" }}
                  >
                    <span style={{ transform: "none" }}>{rs.label}</span>
                  </span>
                )}
                <span
                  className="badge"
                  style={{ position: "static", transform: "none" }}
                >
                  <span style={{ transform: "none" }}>
                    {item.itemTypeDisplay || item.itemType}
                  </span>
                </span>
                {item.isUnreleased && (
                  <span
                    className="badge leak"
                    style={{ position: "static", transform: "none" }}
                  >
                    <span style={{ transform: "none" }}>Unreleased</span>
                  </span>
                )}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-now, Oswald), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                  fontSize: "2.1rem",
                  lineHeight: 1,
                }}
              >
                {item.name}
              </h1>
              {item.description && (
                <p
                  className="meta"
                  style={{ marginTop: "0.6rem", lineHeight: 1.55 }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {item.showcaseVideo && (
              <div>
                <div
                  className="meta"
                  style={{
                    fontFamily: "var(--font-now, Oswald), sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Showcase
                </div>
                <div className="video-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${item.showcaseVideo}`}
                    title={`${item.name} showcase`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="panel">
              <div
                className="meta"
                style={{
                  fontFamily: "var(--font-now, Oswald), sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                }}
              >
                Timeline
              </div>
              <div className="timeline-row">
                <div className="timeline-icon"><Calendar size={15} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>First introduced</div>
                  <div className="meta">{item.introductionText || "Unknown"}</div>
                </div>
              </div>
              <div className="timeline-row">
                <div className="timeline-icon"><ShoppingCart size={15} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>Last in shop</div>
                  <div className="meta">
                    {item.lastShopAppearance
                      ? new Date(item.lastShopAppearance).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not recorded yet (shop tracking started recently)"}
                  </div>
                  {item.lastShopAppearance && (
                    <div className="meta">
                      Seen {item.shopAppearances} time{item.shopAppearances !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
              <div className="timeline-row">
                <div className="timeline-icon"><Radio size={15} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>Added to API</div>
                  <div className="meta">
                    {item.addedToApi
                      ? new Date(item.addedToApi).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div
                className="meta"
                style={{
                  fontFamily: "var(--font-now, Oswald), sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                  marginBottom: "0.7rem",
                }}
              >
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
                <span>Type</span>
                <span>{item.itemTypeDisplay || item.itemType}</span>
                <span>ID</span>
                <span style={{ wordBreak: "break-all" }}>{item.id}</span>
              </div>
            </div>
          </div>
        </div>

        {item.shopHistory.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className="section-title">
              <h2>Shop appearances</h2>
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
                      <td>
                        {new Date(entry.seenAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="meta">{entry.section || "—"}</td>
                      <td style={{ textAlign: "right" }}>{entry.price ?? "—"}</td>
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
