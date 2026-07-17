import { NextResponse } from "next/server";

interface ShopItemEntry {
  name: string;
  icon: string;
  renderImage: string;
  regularPrice: number;
  finalPrice: number;
  section: string;
  rarity: string;
  type: string;
  layoutId: string;
  tileSize: string;
  colors: { color1?: string; color3?: string; textBackgroundColor?: string };
}

export async function GET() {
  try {
    const res = await fetch("https://fortnite-api.com/v2/shop", {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Shop fetch failed" },
        { status: 502 }
      );
    }

    const d = await res.json();
    const entries = d.data?.entries ?? [];
    const sectionMap = new Map<string, ShopItemEntry[]>();

    const now = new Date();

    function isLive(e: Record<string, unknown>): boolean {
      const inDate = e.inDate as string | undefined;
      const outDate = e.outDate as string | undefined;
      if (inDate && new Date(inDate) > now) return false;
      if (outDate && new Date(outDate) < now) return false;
      return true;
    }

    for (const e of entries) {
      if (!isLive(e)) continue;
      const layout = e.layout ?? {};
      const sectionName = layout.name ?? "Featured";
      const colors = e.colors ?? {};
      const render =
        e.newDisplayAsset?.renderImages?.[0]?.image ?? "";
      const regular = e.regularPrice ?? 0;
      const final = e.finalPrice ?? 0;

      // Collect items from multiple possible sources
      const items = [
        ...(e.brItems ?? []),
        ...(e.items ?? []),
        ...(e.tracks ?? []).map((t: Record<string, unknown>) => ({
          name: t.title ?? t.devName ?? "Unknown Track",
          images: { icon: "" },
          rarity: { displayValue: "Uncommon", value: "uncommon" },
          type: { displayValue: "Jam Track", value: "jamtrack" },
        })),
      ];

      for (const item of items) {
        const name = item.name;
        const icon = item.images?.icon;
        if (name) {
          const entry: ShopItemEntry = {
            name,
            icon: icon ?? "",
            renderImage: render,
            regularPrice: regular,
            finalPrice: final,
            section: sectionName,
            rarity:
              item.rarity?.displayValue ?? item.rarity?.value ?? "",
            type: item.type?.displayValue ?? "",
            layoutId: layout.id ?? "",
            tileSize: e.tileSize ?? "Size_1_x_1",
            colors,
          };
          const existing = sectionMap.get(sectionName) ?? [];
          existing.push(entry);
          sectionMap.set(sectionName, existing);
        }
      }
    }

    const sections = Array.from(sectionMap.entries())
      .map(([name, items]) => ({ name, items }))
      .filter((s) => s.items.length > 0);

    return NextResponse.json({
      date: d.data?.date,
      sections,
      totalItems: sections.reduce((s, sec) => s + sec.items.length, 0),
    });
  } catch (err) {
    console.error("Shop API error:", err);
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
}
