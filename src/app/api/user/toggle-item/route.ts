import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { itemName, itemType, iconUrl, rarity, status } = await req.json();

    if (!itemName) {
      return NextResponse.json({ error: "itemName required" }, { status: 400 });
    }

    const existing = await prisma.trackedItem.findUnique({
      where: {
        userId_itemName_itemType: {
          userId: session.userId,
          itemName,
          itemType: itemType ?? "unknown",
        },
      },
    });

    if (existing) {
      await prisma.trackedItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ tracked: false, status: null });
    }

    await prisma.trackedItem.create({
      data: {
        userId: session.userId,
        itemName,
        itemType: itemType ?? "unknown",
        iconUrl: iconUrl ?? null,
        rarity: rarity ?? null,
        status: status ?? "owned",
      },
    });

    return NextResponse.json({ tracked: true, status: status ?? "owned" });
  } catch (err) {
    console.error("Toggle item error:", err);
    return NextResponse.json({ error: "Failed to toggle item" }, { status: 500 });
  }
}
