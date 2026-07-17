import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

const TYPE_ICONS: Record<string, string> = {
  outfit: "👕",
  backpack: "🎒",
  pickaxe: "⛏️",
  emote: "💃",
  glider: "🪂",
  wrap: "🎨",
  spray: "🎭",
  emoji: "😄",
  loading_screen: "🖼️",
  music_pack: "🎵",
  contrail: "✨",
  pet: "🐾",
  jamtrack: "🎸",
  shoe: "👟",
};

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.cosmeticItem.findUnique({
    where: { id },
    include: {
      shopHistory: {
        orderBy: { seenAt: "desc" },
        take: 30,
      },
    },
  });

  if (!item) notFound();

  const rarityColor = item.rarity ?? "common";
  const rarityGradient: Record<string, string> = {
    uncommon: "from-green-500 to-green-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-orange-500 to-orange-600",
    marvel: "from-red-500 to-red-600",
    dc: "from-blue-500 to-blue-600",
    icon: "from-cyan-500 to-cyan-600",
    gaminglegends: "from-yellow-500 to-yellow-600",
    starwars: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">🎯</Link>
            <span className="text-sm text-[#6b7280]">Item Details</span>
          </div>
          <Link href="/" className="text-sm text-[#6b7280] hover:text-white">
            ← Catalog
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div>
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10"
              style={{ aspectRatio: "1/0.76" }}
            >
              {item.iconUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.iconUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[#1a1a2e]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {item.isUnreleased && (
                <div className="absolute left-3 top-3 -skew-x-12 rounded-sm bg-yellow-500 px-3 py-1 shadow-lg">
                  <span className="inline-block skew-x-12 text-xs font-black uppercase text-black">
                    Unreleased
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                  {TYPE_ICONS[item.itemType] ?? "📦"} {item.itemTypeDisplay || item.itemType}
                </span>
                {item.rarityDisplay && (
                  <span
                    className={`rounded bg-gradient-to-r ${rarityGradient[rarityColor] ?? "from-gray-500 to-gray-600"} px-2 py-0.5 text-xs font-medium text-white`}
                  >
                    {item.rarityDisplay}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold">{item.name}</h1>
              {item.description && (
                <p className="mt-2 text-[#9ca3af]">{item.description}</p>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
                Timeline
              </h2>

              <div className="space-y-4">
                {/* First Introduced */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm">📅</div>
                  <div>
                    <p className="text-sm font-medium">First Introduced</p>
                    <p className="text-sm text-[#9ca3af]">
                      {item.introductionText || "Unknown"}
                    </p>
                    {item.introductionChapter && (
                      <p className="text-xs text-[#6b7280]">
                        Chapter {item.introductionChapter}
                        {item.introductionSeason ? `, Season ${item.introductionSeason}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Last Shop Appearance */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-sm">🛒</div>
                  <div>
                    <p className="text-sm font-medium">Last in Shop</p>
                    {item.lastShopAppearance ? (
                      <>
                        <p className="text-sm text-[#9ca3af]">
                          {new Date(item.lastShopAppearance).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          Appeared in shop {item.shopAppearances} time{item.shopAppearances !== 1 ? "s" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#6b7280]">Never appeared in the shop</p>
                    )}
                  </div>
                </div>

                {/* API Added */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-sm">📡</div>
                  <div>
                    <p className="text-sm font-medium">Added to API</p>
                    <p className="text-sm text-[#9ca3af]">
                      {item.addedToApi
                        ? new Date(item.addedToApi).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
                Details
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {item.set && (
                  <>
                    <span className="text-[#6b7280]">Set</span>
                    <span className="text-right">{item.set}</span>
                  </>
                )}
                {item.series && (
                  <>
                    <span className="text-[#6b7280]">Series</span>
                    <span className="text-right">{item.series}</span>
                  </>
                )}
                {item.rarity && (
                  <>
                    <span className="text-[#6b7280]">Rarity</span>
                    <span className="text-right capitalize">{item.rarity}</span>
                  </>
                )}
                {item.itemType && (
                  <>
                    <span className="text-[#6b7280]">Type</span>
                    <span className="text-right capitalize">{item.itemTypeDisplay || item.itemType}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shop History */}
        {item.shopHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold">Recent Shop Appearances</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.03]">
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Section</th>
                    <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {item.shopHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        {new Date(entry.seenAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af]">{entry.section || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {entry.price ? `${entry.price} 🪙` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
