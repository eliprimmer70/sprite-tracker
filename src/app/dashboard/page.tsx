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
  "outfit", "backpack", "pickaxe", "glider", "wrap",
  "emote", "spray", "emoji", "loading_screen", "music_pack",
  "contrail", "pet",
];

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9147ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sprite Tracker</h1>
          <p className="mt-1 text-[#9ca3af]">
            {username} &middot; {ownedCount} / {total} owned ({pct}%)
          </p>
        </div>
        <a
          href="/api/auth/logout"
          className="rounded-lg border border-[#1e1e2d] px-4 py-2 text-sm text-[#6b7280] transition-colors hover:bg-[#1a1a25] hover:text-[#f0f0f0]"
        >
          Logout
        </a>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-[#1e1e2d] bg-[#13131a] p-1">
          {(["all", "missing", "owned"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-[#9147ff] text-white"
                  : "text-[#6b7280] hover:text-[#f0f0f0]"
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
          className="rounded-lg border border-[#1e1e2d] bg-[#13131a] px-3 py-2 text-sm text-[#f0f0f0] outline-none"
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {TYPE_ICONS[t] ?? "📦"} {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-[#6b7280]">
          Click any sprite to toggle owned status
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filtered.map((item) => {
          const has = owned.has(item.id);
          const isToggling = toggling === item.id;

          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item)}
              disabled={isToggling}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                has
                  ? "border-green-500/30 bg-[#13131a] hover:border-green-500/60"
                  : "border-[#1e1e2d]/50 bg-[#13131a]/60 opacity-60 saturate-0 hover:opacity-90 hover:saturate-100"
              } ${isToggling ? "pointer-events-none opacity-50" : ""}`}
            >
              {item.iconUrl && (
                <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-[#0a0a0f] p-2">
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
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-[#6b7280]">
          {catalog.length === 0 ? (
            <p>Loading catalog...</p>
          ) : (
            <p>Nothing matches your filters</p>
          )}
        </div>
      )}
    </div>
  );
}
