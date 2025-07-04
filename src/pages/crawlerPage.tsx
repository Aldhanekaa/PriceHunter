import { useEffect, useRef, useState } from "react";
import {
  marketplaces,
  type SupportedMarketplace,
} from "../utils/marketplace.db";
import getCurrentMarketplaceFromURL from "../utils/getCurrentMarketplaceFromURL";

export default function CrawlerPage() {
  const [activeMarketplace] = useState<SupportedMarketplace[]>([
    "Shopee_Indonesia",
    "Tokopedia",
  ]);
  const url = useRef("");
  const [currentMarketplace, setCurrentMarketplace] = useState<
    SupportedMarketplace | "Not Loaded"
  >("Not Loaded");
  async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);

    console.log("activeMarketplace", activeMarketplace);

    chrome.runtime.sendMessage({ type: "PING" }, (response) => {
      console.log("[popup] Response from background:", response);
    });

    if (tab.url) {
      const currentMarketplace = getCurrentMarketplaceFromURL(tab.url);

      if (currentMarketplace != "Not found") {
        url.current = tab.url;
        setCurrentMarketplace(currentMarketplace);
      }
    }

    // executeCrawl();
    return tab;
  }

  function doCrawl() {
    if (currentMarketplace != "Not Loaded") {
      const crawlTargetSites = [];
      const queries = new URLSearchParams(url.current);
      const currentQuery = queries.get(
        marketplaces[currentMarketplace].queryKey
      );

      for (const marketplace of Object.keys(
        marketplaces
      ) as SupportedMarketplace[]) {
        if (currentMarketplace != marketplace) {
          crawlTargetSites.push(marketplaces[marketplace]);
        }
      }

      chrome.runtime.sendMessage(
        {
          type: "CURRENT_TAB",
          payload: {
            url: url.current,
            marketplace: currentMarketplace,
            crawlTargetSites: crawlTargetSites,
            currentQuery: currentQuery,
          },
        },
        (response) => {
          console.log("[popup] Response from background:", response);
        }
      );
    }
  }
  useEffect(() => {
    getCurrentTab();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-5">
      <p className=" text-2xl font-medium">Similar Products</p>
      <button onClick={doCrawl}>Crawl Now!</button>
      <div className="flex flex-col gap-4 mt-5">
        <div>
          <h2 className="text-xl">Shopee Indonesia</h2>
          <p>Loading..</p>
        </div>
        <div>
          <h2 className="text-xl">Lazada Indonesia</h2>
          <p>Loading..</p>
        </div>
      </div>
    </div>
  );
}
