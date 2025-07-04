import type { SupportedMarketplace } from "./marketplace.db";

export default function getCurrentMarketplaceFromURL(
  url: string
): SupportedMarketplace | "Not found" {
  if (url.includes("www.tokopedia.com")) {
    return "Tokopedia";
  } else if (url.includes("shopee.co.id")) {
    return "Shopee_Indonesia";
  } else if (url.includes("www.lazada.co.id")) {
    return "Lazada_Indonesia";
  }
  return "Not found";
}
