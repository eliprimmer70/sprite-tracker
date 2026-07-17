import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const items = await prisma.trackedItem.findMany({
    where: { userId: session.userId },
    orderBy: { itemType: "asc" },
  });

  return NextResponse.json({ items });
}
