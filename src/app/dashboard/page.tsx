"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ShopItem {
  name: string;
  icon: string;
  renderImage: string;
  regularPrice: number;
  finalPrice: number;
  section: string;
  rarity: string;
  type: string;
}

interface ShopSection {
  name: string;
  items: ShopItem[];
}

interface TrackedEntry {
  itemName: string;
  itemType: string;
  status: string;
}

const statusIcons: Record<string, string> = {
  owned: "✅",
  want: "⭐",
};

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [tracked, setTracked] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    const [shopRes, invRes] = await Promise.all([
      fetch("/api/shop"),
      fetch("/api/user/inventory"),
    ]);
    if (shopRes.ok) {
      const d = await shopRes.json();
      setSections(d.sections ?? []);
    }
    if (invRes.ok) {
      const d = await invRes.json();
      const map = new Map<string, string>();
      for (const item of d.items ?? []) {
        map.set(`${item.itemName}|${item.itemType}`, item.status);
      }
      setTracked(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncShop = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/shop");
      const d = await res.json();
      setSections(d.sections ?? []);
    } catch (e) {
      console.error(e);
    }
    setSyncing(false);
  }, []);

  async function toggleItem(item: ShopItem) {
    const key = `${item.name}|${item.type}`;
    const current = tracked.get(key);

    try {
      const res = await fetch("/api/user/toggle-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.name,
          itemType: item.type || "unknown",
          iconUrl: item.icon,
          rarity: item.rarity,
          status: current === "owned" ? "want" : "owned",
        }),
      });
      const data = await res.json();
      setTracked((prev) => {
        const next = new Map(prev);
        if (data.tracked) {
          next.set(key, data.status);
        } else {
          next.delete(key);
        }
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }

  const flatItems = sections.flatMap((s) => s.items);
  const sectionNames = sections.map((s) => s.name);

  const activeSections =
    activeSection === "all"
      ? sections
      : sections.filter((s) => s.name === activeSection);

  const ownedCount = flatItems.filter(
    (i) => tracked.get(`${i.name}|${i.type}`) === "owned"
  ).length;
  const wantCount = flatItems.filter(
    (i) => tracked.get(`${i.name}|${i.type}`) === "want"
  ).length;

  const hasDiscount = (item: ShopItem) => item.finalPrice < item.regularPrice;
  const discountPct = (item: ShopItem) =>
    Math.round(
      ((item.regularPrice - item.finalPrice) / item.regularPrice) * 100
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9147ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <span className="text-lg font-bold">Sprite Tracker</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/50">
              {username}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncShop}
              disabled={syncing}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              {syncing ? "Refreshing..." : "Refresh Shop"}
            </button>
            <a
              href="/api/auth/logout"
              className="rounded-lg px-3 py-1.5 text-sm text-white/50 transition-all hover:text-white"
            >
              Logout
            </a>
          </div>
        </div>
      </div>

      {/* Section filter */}
      <div className="sticky top-[57px] z-30 border-b border-white/5 bg-[#0d0d15]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveSection("all")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeSection === "all"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              All ({flatItems.length})
            </button>
            {sectionNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveSection(name)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeSection === name
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-2xl font-bold">{flatItems.length}</p>
            <p className="text-xs text-[#6b7280]">In Shop</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{ownedCount}</p>
            <p className="text-xs text-[#6b7280]">Owned</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{wantCount}</p>
            <p className="text-xs text-[#6b7280]">Want</p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { key: "all", label: "All", count: flatItems.length },
            { key: "owned", label: "Owned", count: ownedCount, color: "text-green-400" },
            { key: "want", label: "Want", count: wantCount, color: "text-yellow-400" },
            { key: "none", label: "Untracked", count: flatItems.length - ownedCount - wantCount },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                statusFilter === t.key
                  ? "bg-[#9147ff] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.label} <span className={t.color ?? "text-white/40"}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Shop sections */}
        {activeSections.map((section) => {
          const filteredItems = section.items.filter((item) => {
            const key = `${item.name}|${item.type}`;
            const status = tracked.get(key);
            if (statusFilter === "all") return true;
            if (statusFilter === "none") return !status;
            return status === statusFilter;
          });

          if (filteredItems.length === 0) return null;

          const hasRender = section.items.some((i) => i.renderImage);

          return (
            <section key={section.name} className="mb-12">
              <h3 className="mb-5 text-xl font-bold">{section.name}</h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredItems.map((item, i) => {
                  const key = `${item.name}|${item.type}`;
                  const status = tracked.get(key);
                  const onSale = hasDiscount(item);
                  const discount = discountPct(item);
                  const isRender = hasRender && item.renderImage;

                  return (
                    <button
                      key={`${item.name}-${i}`}
                      onClick={() => toggleItem(item)}
                      className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                        status
                          ? status === "owned"
                            ? "border-green-500/40 bg-green-500/[0.04]"
                            : "border-yellow-500/40 bg-yellow-500/[0.04]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
                        {isRender ? (
                          <img
                            src={item.renderImage}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-6">
                            <img
                              src={item.icon}
                              alt={item.name}
                              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {onSale && (
                          <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold">
                            -{discount}%
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
                          {item.type || "Item"}
                        </div>

                        {status && (
                          <div className="absolute right-2 top-2 text-lg drop-shadow-lg">
                            {statusIcons[status] ?? "✅"}
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {onSale ? (
                            <>
                              <span className="text-sm font-bold">
                                {item.finalPrice}
                              </span>
                              <span className="text-xs text-[#6b7280] line-through">
                                {item.regularPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold">
                              {item.regularPrice}
                            </span>
                          )}
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#ffd700" />
                            <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">V</text>
                          </svg>
                        </div>
                        {status && (
                          <p className="mt-1 text-[11px] capitalize text-white/40">
                            {status === "owned" ? "✅ Owned" : "⭐ Want"}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {activeSections.length === 0 && (
          <div className="mt-24 text-center text-[#6b7280]">
            <p>Loading item shop...</p>
          </div>
        )}
      </main>
    </div>
  );
}
