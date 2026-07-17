"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CatalogItem {
  id: string;
  itemType: string;
  itemName: string;
  iconUrl: string | null;
  rarity: string | null;
  series: string | null;
}

type Tab = "all" | "missing" | "owned";

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
};

const TYPE_ORDER = [
  "outfit",
  "backpack",
  "pickaxe",
  "glider",
  "wrap",
  "emote",
  "spray",
  "emoji",
  "loading_screen",
  "music_pack",
  "contrail",
  "pet",
];

const RARITY_COLORS: Record<string, string> = {
  uncommon: "from-green-500/20 to-green-500/5 border-green-500/30",
  rare: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  epic: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  legendary: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  marvel: "from-red-500/20 to-red-500/5 border-red-500/30",
  dc: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  icon: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  gaminglegends: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
};

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => {
        if (!r.ok) throw new Error("not authed");
        return r.json();
      })
      .then((p) => setUsername(p.username))
      .catch(() => router.push("/"));
  }, [router]);

  const loadData = useCallback(async () => {
    const [catalogRes, invRes] = await Promise.all([
      fetch("/api/catalog"),
      fetch("/api/user/inventory"),
    ]);
    if (catalogRes.ok) {
      const d = await catalogRes.json();
      setCatalog(d.items ?? []);
    }
    if (invRes.ok) {
      const d = await invRes.json();
      setOwned(new Set(d.items.map((i: { itemId: string }) => i.itemId)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleItem(item: CatalogItem) {
    setToggling(item.id);
    try {
      const res = await fetch("/api/user/toggle-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemType: item.itemType,
          itemName: item.itemName,
          iconUrl: item.iconUrl,
          rarity: item.rarity,
          series: item.series,
        }),
      });
      const data = await res.json();
      setOwned((prev) => {
        const next = new Set(prev);
        if (data.owned) next.add(item.id);
        else next.delete(item.id);
        return next;
      });
    } finally {
      setToggling(null);
    }
  }

  const filtered = catalog
    .filter((item) => {
      const has = owned.has(item.id);
      if (tab === "owned" && !has) return false;
      if (tab === "missing" && has) return false;
      return true;
    })
    .filter((item) => typeFilter === "all" || item.itemType === typeFilter)
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.itemType);
      const bi = TYPE_ORDER.indexOf(b.itemType);
      if (ai !== bi) return ai - bi;
      return a.itemName.localeCompare(b.itemName);
    });

  const types = [...new Set(catalog.map((i) => i.itemType))].sort(
    (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)
  );

  const total = catalog.length;
  const ownedCount = catalog.filter((i) => owned.has(i.id)).length;
  const pct = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="m-2 h-32 w-24 animate-pulse rounded-xl bg-[#13131a]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a3aff]/5 via-[#9147ff]/3 to-[#00d4ff]/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Sprite Tracker
              </h1>
              <p className="mt-1 text-[#9ca3af]">{username}</p>
            </div>
            <a
              href="/api/auth/logout"
              className="glass glass-hover rounded-lg px-4 py-2 text-sm text-[#6b7280] transition-all hover:text-white"
            >
              Logout
            </a>
          </div>
        </header>

        {/* Stats */}
        <div className="mb-8 grid animate-fadeInUp grid-cols-3 gap-4" style={{ animationDelay: "0.05s" }}>
          <div className="stat-enter glass rounded-xl p-5 text-center" style={{ animationDelay: "0.1s" }}>
            <p className="text-3xl font-bold text-white">{total}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[#6b7280]">
              Total Cosmetics
            </p>
          </div>
          <div className="stat-enter glass rounded-xl p-5 text-center" style={{ animationDelay: "0.15s" }}>
            <p className="text-3xl font-bold text-green-400">{ownedCount}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[#6b7280]">
              Owned
            </p>
          </div>
          <div className="stat-enter glass rounded-xl p-5 text-center" style={{ animationDelay: "0.2s" }}>
            <p className="text-3xl font-bold text-[#9147ff]">{pct}%</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[#6b7280]">
              Complete
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="mb-6 flex animate-fadeInUp flex-wrap items-center gap-2"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex gap-1 rounded-lg border border-[#1e1e2d] bg-[#13131a]/80 p-1 backdrop-blur-sm">
            {(["all", "missing", "owned"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${
                  tab === t
                    ? "bg-[#9147ff] text-white shadow-lg shadow-purple-500/20"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                {t}
                {t === "all" && ` (${total})`}
                {t === "missing" && ` (${total - ownedCount})`}
                {t === "owned" && ` (${ownedCount})`}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-[#1e1e2d] bg-[#13131a]/80 px-3 py-2 text-sm text-white outline-none backdrop-blur-sm transition-all focus:border-[#9147ff]"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {TYPE_ICONS[t] ?? "📦"} {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-[#6b7280]">
            Click any cosmetic to toggle
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {filtered.map((item, idx) => {
            const has = owned.has(item.id);
            const isToggling = toggling === item.id;
            const rarityBg =
              RARITY_COLORS[item.rarity ?? ""] ??
              "from-gray-500/10 to-gray-500/5 border-gray-500/20";

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                disabled={isToggling}
                className={`grid-item-enter group relative overflow-hidden rounded-xl border bg-gradient-to-b p-3 text-left transition-all duration-300 ${
                  has
                    ? `${rarityBg} bg-[#13131a] hover:scale-[1.03] hover:shadow-lg`
                    : "border-[#1e1e2d]/50 bg-[#13131a]/60 opacity-60 saturate-0 hover:scale-[1.03] hover:opacity-90 hover:saturate-100"
                } ${isToggling ? "pointer-events-none scale-95 opacity-50" : ""}`}
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                {item.iconUrl && (
                  <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-black/30 p-2 transition-transform duration-300 group-hover:scale-110">
                    <img
                      src={item.iconUrl}
                      alt={item.itemName}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {item.itemName}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#6b7280] capitalize">
                      {TYPE_ICONS[item.itemType] ?? "📦"}{" "}
                      {item.itemType.replace(/_/g, " ")}
                    </span>
                  </div>
                  {has && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                      Owned
                    </span>
                  )}
                  {!has && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#6b7280]/10 px-2 py-0.5 text-xs text-[#6b7280] opacity-0 transition-opacity group-hover:opacity-100">
                      Click to claim
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-[#6b7280]">
            {catalog.length === 0 ? (
              <p className="animate-fadeInUp">
                Catalog not synced yet. Admin needs to call{" "}
                <code className="rounded bg-[#13131a] px-2 py-1 text-[#9147ff]">
                  POST /api/catalog
                </code>
              </p>
            ) : (
              <p className="animate-fadeInUp">Nothing matches your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
