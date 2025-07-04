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
    url: string;
    searchUrl: string;
    queryKey: string;
    pageQueryKey: string;
    site: SupportedMarketplaceCrawlScript;
  };
} = {
  Shopee_Indonesia: {
    url: "https://shopee.co.id",
    searchUrl: "/search",
    queryKey: "keyword",
    pageQueryKey: "page",
    site: "shopee_id",
  },
  Tokopedia: {
    url: "https://www.tokopedia.com",
    searchUrl: "/search",

    queryKey: "q",
    pageQueryKey: "page",

    site: "tokopedia",
  },
  Lazada_Indonesia: {
    url: "https://www.lazada.co.id",
    searchUrl: "/catalog",

    queryKey: "q",
    pageQueryKey: "page",

    site: "lazada_id",
  },
};
