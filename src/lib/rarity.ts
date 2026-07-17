// Rarity color system, matched to fortnite.com's item-shop card gradients.
// Each rarity gets a base hex used for the card's bottom-up gradient + accent.
// Values align to the `rarity` field stored from the Fortnite API.

export interface RarityStyle {
  /** solid rarity color — bottom of the card gradient, badges, accents */
  hex: string;
  /** rgba of the same color, for glows / translucent fills */
  rgb: string;
  /** human label */
  label: string;
}

// Default fallback (dark slate) for unknown / missing rarity.
const DEFAULT: RarityStyle = {
  hex: "#3a4150",
  rgb: "58, 65, 80",
  label: "Standard",
};

// Keys are the `rarity.value` strings the API actually emits.
// Colors sampled from fortnite.com item-shop card gradients + the in-game palette.
const MAP: Record<string, RarityStyle> = {
  common: { hex: "#9aa3b0", rgb: "154, 163, 176", label: "Common" },
  uncommon: { hex: "#4b7a3a", rgb: "75, 122, 58", label: "Uncommon" },
  rare: { hex: "#3c6fb5", rgb: "60, 111, 181", label: "Rare" },
  epic: { hex: "#7b4bc3", rgb: "123, 75, 195", label: "Epic" },
  legendary: { hex: "#c79a3a", rgb: "199, 154, 58", label: "Legendary" },
  mythic: { hex: "#d9a441", rgb: "217, 164, 65", label: "Mythic" },
  // Series — these use richer multicolor treatments on fortnite.com; we use the
  // dominant tone from each series' palette.
  icon: { hex: "#00c2a4", rgb: "0, 194, 164", label: "ICON" },
  marvel: { hex: "#a73d2f", rgb: "167, 61, 47", label: "Marvel" },
  dc: { hex: "#3a5a8c", rgb: "58, 90, 140", label: "DC" },
  starwars: { hex: "#caa128", rgb: "202, 161, 40", label: "Star Wars" },
  gaminglegends: { hex: "#5e40ce", rgb: "94, 64, 206", label: "Gaming Legends" },
  slurp: { hex: "#00adff", rgb: "0, 173, 255", label: "Slurp" },
  frozen: { hex: "#8ab3ff", rgb: "138, 179, 255", label: "Frozen" },
  lava: { hex: "#c4631a", rgb: "196, 99, 26", label: "Lava" },
  dark: { hex: "#63559d", rgb: "99, 85, 157", label: "Dark" },
  shadow: { hex: "#3a306c", rgb: "58, 48, 108", label: "Shadow" },
};

export function rarityStyle(rarity: string | null | undefined): RarityStyle {
  if (!rarity) return DEFAULT;
  return MAP[rarity.toLowerCase()] ?? DEFAULT;
}

/** CSS for the fortnite.com-style bottom-up card gradient. */
export function rarityGradient(rarity: string | null | undefined): string {
  const { rgb } = rarityStyle(rarity);
  return `linear-gradient(0deg, rgba(${rgb}, 0.95) 0%, rgba(${rgb}, 0) 55%)`;
}

/** Convert a YouTube video id (as stored in showcaseVideo) to a thumbnail url. */
export function videoThumb(videoId: string | null | undefined): string | null {
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
