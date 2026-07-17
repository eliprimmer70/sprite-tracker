import { NextResponse } from "next/server";
import { fetchCosmeticCatalog } from "@/lib/fortnite-api";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function POST() {
  try {
    const catalog = await fetchCosmeticCatalog();

    for (const entry of catalog) {
      await prisma.catalogItem.upsert({
        where: { id: entry.id },
        update: {
          itemType: entry.type.value,
          itemName: entry.name,
          iconUrl: entry.images.icon ?? null,
          rarity: entry.rarity.value ?? null,
          series: entry.series?.value ?? null,
          description: entry.description ?? null,
        },
        create: {
          id: entry.id,
          itemType: entry.type.value,
          itemName: entry.name,
          iconUrl: entry.images.icon ?? null,
          rarity: entry.rarity.value ?? null,
          series: entry.series?.value ?? null,
          description: entry.description ?? null,
        },
      });
    }

    return NextResponse.json({ synced: catalog.length });
  } catch (err) {
    console.error("Catalog sync failed:", err);
    return NextResponse.json(
      { error: "Failed to sync catalog" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const rarity = searchParams.get("rarity");
  const search = searchParams.get("search");

  const where: Prisma.CatalogItemWhereInput = {};

  if (type) where.itemType = type;
  if (rarity) where.rarity = rarity;
  if (search) {
    where.itemName = { contains: search };
  }

  const items = await prisma.catalogItem.findMany({
    where,
    orderBy: { itemName: "asc" },
    take: 500,
  });

  return NextResponse.json({ items });
}
