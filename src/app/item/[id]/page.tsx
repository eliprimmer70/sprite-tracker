import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.cosmeticItem.findUnique({
    where: { id },
    include: {
      shopHistory: { orderBy: { seenAt: "desc" }, take: 30 },
    },
  });

  if (!item) notFound();

  const rarityStyles: Record<string, string> = {
    uncommon: "bg-green-500/10 text-green-400 border-green-500/20",
    rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    legendary: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    marvel: "bg-red-500/10 text-red-400 border-red-500/20",
    dc: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    gaminglegends: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    starwars: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#3b6bff]/30">
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b6bff] text-sm font-bold shadow-lg shadow-[#3b6bff]/20">
              I
            </span>
            <span className="text-sm font-medium tracking-tight text-white/60">Item</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 transition-colors hover:text-white/60">← Back</Link>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]" style={{ aspectRatio: "4/3" }}>
            {item.iconUrl && (
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url(${item.iconUrl})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />
            {item.isUnreleased && (
              <div className="absolute left-3 top-3 rounded-md bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400 backdrop-blur-sm">
                UNRELEASED
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                {item.rarity && (
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${rarityStyles[item.rarity] ?? "bg-white/5 text-white/60 border-white/10"}`}>
                    {item.rarityDisplay || item.rarity}
                  </span>
                )}
                <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-xs text-white/50">
                  {item.itemTypeDisplay || item.itemType}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{item.name}</h1>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-white/50">{item.description}</p>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Timeline</h2>
              <div className="space-y-5">
                <TimelineRow icon="📅" title="First Introduced" subtitle={item.introductionText || "Unknown"} />
                <TimelineRow
                  icon="🛒"
                  title="Last in Shop"
                  subtitle={
                    item.lastShopAppearance
                      ? new Date(item.lastShopAppearance).toLocaleDateString("en-US", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })
                      : "Not yet recorded (tracking started today)"
                  }
                  meta={item.lastShopAppearance ? `Appeared ${item.shopAppearances} time${item.shopAppearances !== 1 ? "s" : ""}` : undefined}
                />
                <TimelineRow
                  icon="📡"
                  title="Added to API"
                  subtitle={
                    item.addedToApi
                      ? new Date(item.addedToApi).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "Unknown"
                  }
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Details</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {item.set && <DetailRow label="Set" value={item.set} />}
                {item.series && <DetailRow label="Series" value={item.series} />}
                <DetailRow label="ID" value={item.id} />
                <DetailRow label="Type" value={item.itemTypeDisplay || item.itemType} />
              </div>
            </div>
          </div>
        </div>

        {/* Shop History */}
        {item.shopHistory.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-base font-semibold tracking-tight">Shop Appearances</h2>
            <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-4 py-3 text-left font-medium text-white/30">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-white/30">Section</th>
                    <th className="px-4 py-3 text-right font-medium text-white/30">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {item.shopHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/80">
                        {new Date(entry.seenAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-white/40">{entry.section || "—"}</td>
                      <td className="px-4 py-3 text-right text-white/80">
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

function TimelineRow({ icon, title, subtitle, meta }: { icon: string; title: string; subtitle: string; meta?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-sm text-white/50">{subtitle}</p>
        {meta && <p className="text-xs text-white/30">{meta}</p>}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-white/30">{label}</span>
      <span className="truncate text-right">{value}</span>
    </>
  );
}
