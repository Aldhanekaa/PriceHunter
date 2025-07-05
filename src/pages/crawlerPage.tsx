import { useEffect, useRef, useState } from "react";
import {
  IsThisSiteSupported,
  marketplaces,
  type SupportedMarketplace,
} from "../utils/marketplace.db";
import getCurrentMarketplaceFromURL from "../utils/getCurrentMarketplaceFromURL";
import GithubIcon from "../icons/github";
import ShoppingCart from "../icons/shopping-cart";
import { Link } from "react-router-dom";

export default function CrawlerPage() {
  const [isFetching, setIsFetching] = useState(false);
  const [availableMarketplaceToFetch, setAvailableMarketplaceToFetch] =
    useState<SupportedMarketplace[]>([]);
  const url = useRef("");
  const tabId = useRef(0);
  const origin = useRef("");

  const [currentMarketplace, setCurrentMarketplace] = useState<
    SupportedMarketplace | "Not Loaded"
  >("Not Loaded");

  function getCurrentQuery() {
    if (
      currentMarketplace !== "Not Loaded" &&
      marketplaces[currentMarketplace]
    ) {
      const queries = new URLSearchParams(url.current);
      return queries.get(marketplaces[currentMarketplace].queryKey);
    }
    return null;
  }

  async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const [tab] = await chrome.tabs.query(queryOptions);

    if (tab.id) tabId.current = tab.id;

    // console.log("availableMarketplaceToFetch", availableMarketplaceToFetch);

    chrome.runtime.sendMessage({ type: "PING" }, (response) => {
      console.log("[popup] Response from background:", response);
    });

    if (tab.url) {
      const currentMarketplace = getCurrentMarketplaceFromURL(tab.url);

      if (currentMarketplace != "Not found") {
        url.current = tab.url;
        origin.current = new URL(tab.url).origin;
        setCurrentMarketplace(currentMarketplace);
      }
    }

    // executeCrawl();
    return tab;
  }

  function doCrawl() {
    if (currentMarketplace != "Not Loaded" && !isFetching) {
      setIsFetching(true);
      const crawlTargetSites = [];
      const currentQuery = getCurrentQuery();

      for (const marketplace of Object.keys(
        marketplaces
      ) as SupportedMarketplace[]) {
        if (currentMarketplace != marketplace) {
          crawlTargetSites.push(marketplaces[marketplace]);
        }
      }

      console.log("SEND RUNTIME !!!");
      chrome.runtime.sendMessage(
        {
          type: "CRAWL_TAB_NOW",
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

  async function EventListener() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    console.log(
      `CRAWL LISTENER , ${tab} ${tab.id} crawlState_${tab.id}`,
      `crawlSites_${tab.id}`
    );
    chrome.storage.local.get(
      [`crawlState_${tab.id}`, `crawlSites_${tab.id}`],
      (result) => {
        console.log("CRAWL STORAGE! ", result);
        if (
          `crawlState_${tab.id}` in result &&
          result[`crawlState_${tab.id}`] == "fetching"
        ) {
          setIsFetching(true);
        }
      }
    );

    chrome.storage.local.get(["crawlState", "settings"], (result) => {
      let SettingsStorageObject: Record<string, boolean> = {};

      if (result.settings) {
        SettingsStorageObject = { ...result.settings };
      }

      if (Object.keys(SettingsStorageObject).length > 0) {
        const currentMarketplace = getCurrentMarketplaceFromURL(url.current);
        const data_availableMarketplaceToFetch: SupportedMarketplace[] = [];

        Object.keys(SettingsStorageObject).forEach((marketplaceKey) => {
          if (
            marketplaceKey != currentMarketplace &&
            SettingsStorageObject[marketplaceKey]
          ) {
            data_availableMarketplaceToFetch.push(
              marketplaceKey as SupportedMarketplace
            );
          }
        });

        setAvailableMarketplaceToFetch(data_availableMarketplaceToFetch);
      }
    });
  }
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "POPUP_OPENED" });

    getCurrentTab();

    const handler = (
      message: {
        type: string;
        status: "products_list";
        origin: string;
        data: Array<{
          title: string;
          link: string;
          imgSrc: string;
          sold: string;
          rating: string;

          delivery: string;
          source: string;
        }>;
      },
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === "ALERT_USER") {
        console.log("Message from background:", sender, message);
        // alert(message.payload);
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    EventListener();

    // Cleanup to avoid memory leaks
    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);

  if (availableMarketplaceToFetch.length == 0) {
    return (
      <div className="w-full h-full overflow-y-auto px-4 py-5">
        <p className=" text-2xl font-bold text-center px-6 mb-4">
          Please Go to Settings to Activate The Marketplace
        </p>

        <div className="flex justify-center">
          <Link to="/settings" className="text-white">
            <div className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-neutral-800 text-white hover:bg-neutral-700 focus:outline-hidden focus:bg-neutral-600 disabled:opacity-50 disabled:pointer-events-none">
              Settings
            </div>
          </Link>
        </div>
      </div>
    );
  }

  if (!url.current || !IsThisSiteSupported(url.current)) {
    return (
      <div className="w-full h-full overflow-y-auto px-4 py-5">
        <p className=" text-2xl font-bold text-center">
          This Site Is Not Supported
        </p>
        <p className=" text-lg text-center my-3">
          Want to request for this site?
        </p>
        <div className="flex justify-center">
          <a
            href="https://github.com/Aldhanekaa/PriceHunter"
            className="text-white"
            target="_blank"
          >
            <div
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-neutral-800 text-white hover:bg-neutral-700 focus:outline-hidden focus:bg-neutral-600 disabled:opacity-50 disabled:pointer-events-none"
              onClick={doCrawl}
            >
              Make a PR!
              <span className=" text-sm">
                {" "}
                <GithubIcon />
              </span>
            </div>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4 pt-8 pb-5">
      <div className="flex justify-center mb-3">
        <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium border border-gray-200 bg-white dark:bg-white text-gray-800 shadow-2xs">
          {url.current && new URL(url.current).origin.replace("https://", "")}
        </span>
      </div>

      <p className=" text-2xl font-medium text-center">Currently Searching</p>
      <p className=" text-xl text-center">{getCurrentQuery()}</p>

      <div className="flex justify-center py-5">
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          onClick={doCrawl}
        >
          {isFetching ? (
            "Fetching.."
          ) : (
            <>
              <span className=" text-sm">
                {" "}
                <ShoppingCart />
              </span>
              Find & Compare Similar Product!
            </>
          )}
        </button>
      </div>

      <div className="inline-flex rounded-lg shadow-2xs">
        <button
          type="button"
          className="py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-300 dark:border-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-200 dark:focus:bg-neutral-200"
        >
          Small
        </button>
        <button
          type="button"
          className="py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-200 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-300 dark:border-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-200 dark:focus:bg-neutral-200"
        >
          Small
        </button>
        <button
          type="button"
          className="py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-200 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-300 dark:border-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-200 dark:focus:bg-neutral-200"
        >
          Small
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-5">
        <div>
          <h2 className="text-xl">Shopee Indonesia</h2>
          <p>Loading..</p>
        </div>
        <div>
          <h2 className="text-xl">Lazada Indonesia</h2>
          <p>Loading..</p>
        </div>
        <div>
          <h2 className="text-xl">Toco Indonesia</h2>
          <p>Loading..</p>
        </div>
        <div>
          <h2 className="text-xl">OLX Indonesia</h2>
          <p>Loading..</p>
        </div>
      </div>
    </div>
  );
}
