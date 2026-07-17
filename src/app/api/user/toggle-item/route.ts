import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { itemId, itemType, itemName, iconUrl, rarity, series } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    const existing = await prisma.ownedItem.findUnique({
      where: { userId_itemId: { userId: session.userId, itemId } },
    });

    if (existing) {
      await prisma.ownedItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ owned: false });
    }

    await prisma.ownedItem.create({
      data: {
        userId: session.userId,
        itemId,
        itemType: itemType ?? "unknown",
        itemName: itemName ?? itemId,
        iconUrl: iconUrl ?? null,
        rarity: rarity ?? null,
        series: series ?? null,
      },
    });

    return NextResponse.json({ owned: true });
  } catch (err) {
    console.error("Toggle item error:", err);
    return NextResponse.json({ error: "Failed to toggle item" }, { status: 500 });
  }
}
