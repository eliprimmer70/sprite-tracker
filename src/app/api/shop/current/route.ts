import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  set: string | null;
};

type ShopSection = {
  name: string;
  layoutId: string;
  items: (ShopItem & { price: number; regularPrice: number; tileSize: string })[];
};

export async function GET() {
  try {
    const res = await fetch("https://fortnite-api.com/v2/shop", {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Shop fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const d = await res.json();
    const entries = d.data?.entries ?? [];

    const sectionMap = new Map<string, ShopSection>();

    for (const e of entries) {
      const sectionName = e.layout?.name ?? "Featured";
      const layoutId = e.layout?.id ?? "unknown";

      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, { name: sectionName, layoutId, items: [] });
      }

      const itemList = [...(e.brItems ?? []), ...(e.items ?? [])];
      for (const item of itemList) {
        if (!item.id) continue;
        const imgs = item.images ?? {};
        sectionMap.get(sectionName)!.items.push({
          id: item.id,
          name: item.name ?? "Unknown",
          description: item.description ?? null,
          itemType: item.type?.value ?? "unknown",
          itemTypeDisplay: item.type?.displayValue ?? null,
          rarity: item.rarity?.value ?? null,
          rarityDisplay: item.rarity?.displayValue ?? null,
          iconUrl: imgs.icon ?? imgs.smallIcon ?? null,
          featuredUrl: imgs.featured ?? null,
          showcaseVideo: item.showcaseVideo ?? null,
          series: item.series?.value ?? null,
          set: item.set?.text ?? null,
          price: e.finalPrice ?? 0,
          regularPrice: e.regularPrice ?? e.finalPrice ?? 0,
          tileSize: e.tileSize ?? "normal",
        });
      }
    }

    const sections = Array.from(sectionMap.values()).filter((s) => s.items.length > 0);

    return NextResponse.json({
      sections,
      totalItems: sections.reduce((a, s) => a + s.items.length, 0),
      date: d.data?.date ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error("Shop current error:", err);
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
}