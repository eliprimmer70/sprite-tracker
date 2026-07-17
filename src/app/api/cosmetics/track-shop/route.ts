import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    const now = new Date();
    let tracked = 0;

    for (const e of entries) {
      const items = [...(e.brItems ?? []), ...(e.items ?? [])];
      const section = e.layout?.name ?? "Featured";
      const price = e.finalPrice ?? 0;

      for (const item of items) {
        const cosmeticId = item.id;
        if (!cosmeticId) continue;

        // Record appearance
        await prisma.shopAppearance.create({
          data: {
            itemId: cosmeticId,
            seenAt: now,
            price: price,
            section: section,
          },
        });

        // Update the cosmetic item's last seen + count
        await prisma.cosmeticItem.update({
          where: { id: cosmeticId },
          data: {
            lastShopAppearance: now,
            shopAppearances: { increment: 1 },
          },
        });

        tracked++;
      }
    }

    return NextResponse.json({
      tracked,
      date: now.toISOString(),
      message: `Tracked ${tracked} shop appearances`,
    });
  } catch (err) {
    console.error("Track shop error:", err);
    return NextResponse.json(
      { error: "Failed to track shop" },
      { status: 500 }
    );
  }
}
