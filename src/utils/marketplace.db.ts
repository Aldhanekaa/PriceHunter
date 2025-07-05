export type SupportedMarketplace =
  | "Shopee_Indonesia"
  | "Tokopedia"
  | "Lazada_Indonesia";
export type SupportedMarketplaceCrawlScript =
  | "shopee_id"
  | "tokopedia"
  | "lazada_id";

export const marketplaces: {
  [key in SupportedMarketplace]: {
    name: string;
    url: string;
    searchUrl: string;
    queryKey: string;
    pageQueryKey: string;
    site: SupportedMarketplaceCrawlScript;

    searchResultItem?: string;

    needToFocus: boolean;
  };
} = {
  Shopee_Indonesia: {
    name: "Shopee Indonesia",
    site: "shopee_id",
    url: "https://shopee.co.id",
    searchUrl: "/search",

    queryKey: "keyword",
    pageQueryKey: "page",

    searchResultItem: 'li[data-sqe="item"]',
    needToFocus: false,
  },
  Tokopedia: {
    name: "Tokopedia",
    site: "tokopedia",
    url: "https://www.tokopedia.com",
    searchUrl: "/search",

    queryKey: "q",
    pageQueryKey: "page",

    searchResultItem: 'div[data-sqe="item"]',
    needToFocus: false,
  },

  Lazada_Indonesia: {
    name: "Lazada Indonesia",
    site: "lazada_id",
    url: "https://www.lazada.co.id",
    searchUrl: "/catalog",

    queryKey: "q",
    pageQueryKey: "page",

    searchResultItem: 'div[data-tracking="product-card"]',
    needToFocus: true,
  },
};

export function IsThisSiteSupported(url: string) {
  try {
    const inputOrigin = new URL(url).origin;
    for (const key of Object.keys(marketplaces) as Array<
      keyof typeof marketplaces
    >) {
      const marketplaceUrl = marketplaces[key].url;
      if (marketplaceUrl) {
        const marketplaceOrigin = new URL(marketplaceUrl).origin;
        if (inputOrigin === marketplaceOrigin) {
          return true;
        }
      }
    }
  } catch {
    // Invalid URL
    return false;
  }
  return false;
}
