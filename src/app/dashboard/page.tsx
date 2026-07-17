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

const RARITY_BORDERS: Record<string, string> = {
  uncommon: "ring-green-500/30",
  rare: "ring-blue-500/30",
  epic: "ring-purple-500/30",
  legendary: "ring-orange-500/30",
  marvel: "ring-red-500/30",
  dc: "ring-blue-500/30",
  icon: "ring-cyan-500/30",
  gaminglegends: "ring-yellow-500/30",
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-36 w-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      {/* Gradient orbs */}
      <div className="fixed left-0 top-0 h-96 w-96 rounded-full bg-[#4a3aff]/10 blur-[120px]" />
      <div className="fixed right-0 top-1/3 h-80 w-80 rounded-full bg-[#9147ff]/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Sprite Tracker
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">{username}</p>
          </div>
          <a
            href="/api/auth/logout"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#6b7280] transition-colors hover:border-white/20 hover:text-white"
          >
            Logout
          </a>
        </header>

        {/* Stats Cards */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          {[
            { label: "Total Cosmetics", value: total, color: "text-white" },
            { label: "Owned", value: ownedCount, color: "text-green-400" },
            { label: "Complete", value: `${pct}%`, color: "text-[#9147ff]" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-all hover:border-white/20"
            >
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#6b7280]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {(["all", "missing", "owned"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${
                  tab === t
                    ? "bg-[#9147ff] text-white shadow-lg"
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
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none backdrop-blur-sm transition-all focus:border-[#9147ff]"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {TYPE_ICONS[t] ?? "📦"} {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <span className="hidden text-xs text-[#6b7280] md:block">
            Click any cosmetic to toggle owned
          </span>
        </div>

        {/* Cosmetic Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {filtered.map((item, idx) => {
            const has = owned.has(item.id);
            const isToggling = toggling === item.id;
            const rarityColor = item.rarity ?? "";
            const borderColor = RARITY_BORDERS[rarityColor] ?? "ring-white/10";

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                disabled={isToggling}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  has
                    ? `border-white/10 bg-white/[0.03] hover:border-[#9147ff]/50 hover:bg-white/[0.06]`
                    : "border-white/5 bg-white/[0.02] opacity-50 saturate-0 hover:opacity-80 hover:saturate-100"
                } ${
                  isToggling ? "pointer-events-none scale-95 opacity-40" : ""
                } hover:ring-2 ${has ? borderColor : "hover:ring-white/20"}`}
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                {/* Cosmetic Icon */}
                <div className="relative mb-3 flex aspect-square items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-b ${
                      RARITY_COLORS[rarityColor] ?? "from-white/5 to-transparent"
                    }`}
                  />
                  {item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt={item.itemName}
                      className="relative h-4/5 w-4/5 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  {/* Owned badge */}
                  {has && (
                    <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {item.itemName}
                  </p>
                  <p className="truncate text-xs text-[#6b7280] capitalize">
                    {item.itemType.replace(/_/g, " ")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-24 text-center text-[#6b7280]">
            {catalog.length === 0 ? (
              <p>Catalog not synced yet.</p>
            ) : (
              <p>Nothing matches your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
