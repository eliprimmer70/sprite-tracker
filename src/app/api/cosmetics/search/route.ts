import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const rarity = searchParams.get("rarity") || "";
  const unreleased = searchParams.get("unreleased") || "";
  const sort = searchParams.get("sort") || "name";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "48"), 100);

  const where: Record<string, unknown> = {};

  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }
  if (type) where.itemType = type;
  if (rarity) where.rarity = rarity;
  if (unreleased === "true") where.isUnreleased = true;
  if (unreleased === "false") where.isUnreleased = false;

  const orderBy: Record<string, string> =
    sort === "name"
      ? { name: "asc" }
      : sort === "recent"
        ? { addedToApi: "desc" }
        : sort === "shop"
          ? { lastShopAppearance: "desc" }
          : { name: "asc" };

  const [items, total] = await Promise.all([
    prisma.cosmeticItem.findMany({
      where: where as Parameters<typeof prisma.cosmeticItem.findMany>[0]["where"],
      orderBy: orderBy as Parameters<typeof prisma.cosmeticItem.findMany>[0]["orderBy"],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cosmeticItem.count({
      where: where as Parameters<typeof prisma.cosmeticItem.count>[0]["where"],
    }),
  ]);

  const types = await prisma.cosmeticItem.groupBy({
    by: ["itemType"],
    _count: { itemType: true },
    orderBy: { _count: { itemType: "desc" } },
  });

  const rarities = await prisma.cosmeticItem.groupBy({
    by: ["rarity"],
    _count: { rarity: true },
    orderBy: { _count: { rarity: "desc" } },
  });

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    filters: {
      types: types.map((t) => ({
        value: t.itemType,
        count: t._count.itemType,
      })),
      rarities: rarities.map((r) => ({
        value: r.rarity,
        count: r._count.rarity,
      })),
    },
  });
}
