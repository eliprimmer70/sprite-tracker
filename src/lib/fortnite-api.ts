const COMMUNITY_API_BASE = "https://fortnite-api.com/v2/cosmetics/br";

export interface CosmeticCatalogEntry {
  id: string;
  name: string;
  type: { value: string; displayValue: string };
  rarity: { value: string; displayValue: string };
  series?: { value: string; displayValue: string };
  images: { icon?: string; featured?: string; background?: string };
  description?: string;
  introduced?: { name?: string };
}

interface CommunityApiResponse {
  data: CosmeticCatalogEntry[];
}

export async function fetchCosmeticCatalog(): Promise<CosmeticCatalogEntry[]> {
  const res = await fetch(`${COMMUNITY_API_BASE}?language=en`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Catalog fetch failed (${res.status})`);
  }

  const data: CommunityApiResponse = await res.json();
  return data.data;
}
