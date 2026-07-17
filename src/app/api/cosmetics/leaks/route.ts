import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // "Leaks" = items in the API with no introduction text (unreleased/upcoming)
  // Or items added very recently that haven't been officially announced
  try {
    const unreleased = await prisma.cosmeticItem.findMany({
      where: { isUnreleased: true },
      orderBy: { addedToApi: "desc" },
      take: 50,
    });

    // Also get recently added items (past 14 days) that ARE released
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recent = await prisma.cosmeticItem.findMany({
      where: {
        addedToApi: { gte: twoWeeksAgo },
        isUnreleased: false,
      },
      orderBy: { addedToApi: "desc" },
      take: 20,
    });

    return NextResponse.json({
      unreleased,
      recent,
      totalUnreleased: await prisma.cosmeticItem.count({
        where: { isUnreleased: true },
      }),
    });
  } catch (err) {
    console.error("Leaks error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
