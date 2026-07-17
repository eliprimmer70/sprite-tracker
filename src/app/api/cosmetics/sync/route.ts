import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const res = await fetch(
      "https://fortnite-api.com/v2/cosmetics/br?language=en",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `API fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const d = await res.json();
    const items = d.data ?? [];
    let created = 0;
    let updated = 0;

    for (const item of items) {
      const intro = item.introduction ?? {};
      const type = item.type ?? {};
      const rarity = item.rarity ?? {};
      const setData = item.set ?? {};
      const images = item.images ?? {};

      const existing = await prisma.cosmeticItem.findUnique({
        where: { id: item.id },
      });

      const baseData = {
        name: item.name ?? "Unknown",
        description: item.description ?? null,
        itemType: type.value ?? "unknown",
        itemTypeDisplay: type.displayValue ?? null,
        rarity: rarity.value ?? null,
        rarityDisplay: rarity.displayValue ?? null,
        series: item.series?.value ?? null,
        set: setData.text ?? null,
        introductionChapter: intro.chapter ?? null,
        introductionSeason: intro.season ?? null,
        introductionText: intro.text ?? null,
        iconUrl: images.icon ?? images.smallIcon ?? null,
        smallIconUrl: images.smallIcon ?? null,
        featuredUrl: images.featured ?? null,
        showcaseVideo: item.showcaseVideo ?? null,
        addedToApi: item.added ? new Date(item.added) : null,
        isUnreleased: !intro.text,
      };

      await prisma.cosmeticItem.upsert({
        where: { id: item.id },
        create: { id: item.id, ...baseData },
        update: baseData,
      });

      if (existing) updated++;
      else created++;
    }

    return NextResponse.json({ created, updated, total: items.length });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
