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
import AreTheseTwoArraysEqualUnordered from "../utils/AreTheseTwoArraysEqualUnordered";
import StarIcon from "../icons/starIcon";

type Product = {
  title: string;
  price: string;
  link: string;
  imgSrc: string;
  sold: string;
  rating: string;

  delivery: string;
  source: string;
};

type Variant = "horizontal-row" | "vertical-row" | "grid";

function ProductCard({ data, variant }: { data: Product; variant: Variant }) {
  return (
    <div
      className={`relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm product-card-${variant} p-1`}
    >
      <a
        className="relative mx-1 mt-1 flex h-40 overflow-hidden rounded-md"
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="object-cover w-full h-full"
          src={data.imgSrc}
          alt={data.title}
        />
        {/* {data.sold && (
          <span className="absolute top-0 left-0 m-1 rounded bg-black px-1 text-center text-xs font-medium text-white">
            Sold: {data.sold}
          </span>
        )} */}
      </a>
      <div className="mt-2 px-2 pb-2">
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          <h5 className="text-sm tracking-tight text-blue-900 line-clamp-2">
            {data.title}
          </h5>
        </a>
        <div className="mt-1 mb-2 flex items-center justify-between">
          <p>
            <span className="text-base font-bold text-blue-600">
              {data.price}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <StarIcon />
          <span className=" rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-semibold">
            {data.rating ? data.rating : "-"}
          </span>
          {/* separator */}
          <span className="mx-1 h-3 w-px bg-gray-300 inline-block align-middle"></span>
          <span className="text-xs text-gray-500">{data.sold}</span>
        </div>
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 bg-neutral-900 flex items-center justify-center rounded px-2 py-1 text-center text-xs font-medium "
        >
          <p className="text-white">View</p>
        </a>
      </div>
    </div>
  );
}

export default function CrawlerPage() {
  const [variant] = useState<Variant>("horizontal-row");

  const [isFetching, setIsFetching] = useState(false);
  const [availableMarketplaceToFetch, setAvailableMarketplaceToFetch] =
    useState<SupportedMarketplace[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<
    Record<SupportedMarketplace, Array<Product>>
  >({} as Record<SupportedMarketplace, Array<Product>>);

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

      for (const marketplace of availableMarketplaceToFetch) {
        if (currentMarketplace != marketplace) {
          crawlTargetSites.push(marketplaces[marketplace]);
        }
      }

      console.log("availableMarketplaceToFetch", availableMarketplaceToFetch);

      console.log("DO CRAWL NOW !!!");
      chrome.runtime.sendMessage({
        type: "CRAWL_TAB_NOW",
        payload: {
          url: url.current,
          marketplace: currentMarketplace,
          crawlTargetSites: crawlTargetSites,
          currentQuery: currentQuery,
        },
      });
    }
  }

  async function EventListener() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    console.log(
      `CRAWL LISTENER , ${tab} ${tab.id} crawlState_${tab.id}`,
      `crawlSites_${tab.id}`
    );

    if (tab.id) {
      let currentProducts_mainTabs: Partial<
        Record<SupportedMarketplace, Array<Product>>
      > = {};
      const result = await chrome.storage.local.get("products_mainTabs");
      const duplicate_currentProducts_mainTabs: Partial<
        Record<SupportedMarketplace, Array<Product>>
      > = {};

      if ("products_mainTabs" in result) {
        const products_mainTabs = result["products_mainTabs"];
        if (tab.id in products_mainTabs) {
          currentProducts_mainTabs = products_mainTabs[tab.id];
        }
      }

      for (const marketplaceOrigin in currentProducts_mainTabs) {
        const marketplace = getCurrentMarketplaceFromURL(marketplaceOrigin);
        if (marketplace !== "Not found") {
          duplicate_currentProducts_mainTabs[marketplace] =
            currentProducts_mainTabs[
              marketplaceOrigin as keyof typeof currentProducts_mainTabs
            ];
        }
      }

      console.log("products_mainTabs", currentProducts_mainTabs);
      setFetchedProducts(
        Object.assign({}, fetchedProducts, duplicate_currentProducts_mainTabs)
      );
    }

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

    chrome.storage.local.get(["settings"], (result) => {
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
    EventListener();
  }, []);

  useEffect(() => {
    const handler = (
      message: {
        type: string;
        status: "products_list";
        origin: string;
        data: Array<Product>;
      },
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === "ALERT_USER") {
        console.log("Message from background:", sender, message);
        const currentMarketplace = getCurrentMarketplaceFromURL(message.origin);

        // Only include valid SupportedMarketplace keys
        const fetchedMarketplaces: SupportedMarketplace[] = [
          ...Object.keys(fetchedProducts).filter(
            (key): key is SupportedMarketplace =>
              (availableMarketplaceToFetch as string[]).includes(key)
          ),
          ...(currentMarketplace !== "Not found" ? [currentMarketplace] : []),
        ];

        // console.log(
        //   "fetchedMarketplaces :",
        //   fetchedMarketplaces,
        //   availableMarketplaceToFetch
        // );

        const isFetchingDone =
          AreTheseTwoArraysEqualUnordered<SupportedMarketplace>(
            fetchedMarketplaces,
            availableMarketplaceToFetch
          );

        // console.log(isFetchingDone);

        setFetchedProducts((prev) =>
          Object.assign({}, prev, {
            [currentMarketplace]: message.data,
          })
        );
        // console.log(fetchedProducts);

        if (isFetchingDone) {
          setIsFetching(false);
        }
        // console.log(isFetchingDone);

        // alert(message.payload);
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    // Cleanup to avoid memory leaks
    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, [availableMarketplaceToFetch, fetchedProducts]);

  console.log("fetchedProducts", fetchedProducts);

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
        {Object.keys(fetchedProducts).length > 0 ? (
          Object.keys(fetchedProducts).map((marketplace) => {
            return (
              <div key={marketplace} className="relative">
                <div className="sticky -top-9 pl-2 z-10 bg-white/90 backdrop-blur-sm py-1">
                  <h2 className="text-xl font-semibold">
                    {marketplaces[marketplace as SupportedMarketplace].name}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {fetchedProducts[marketplace as SupportedMarketplace].map(
                    (product: Product) => (
                      <ProductCard
                        key={product.link}
                        data={product}
                        variant={variant}
                      />
                    )
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center">
            <p className="text-lg">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
