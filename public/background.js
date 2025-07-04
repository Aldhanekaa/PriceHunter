/**
 * @typedef {"shopee_id" | "tokopedia" | "lazada_id"} SupportedMarketplaceCrawlScript
 */

/**
 * @typedef {Object} TargetSite
 * @property {string} url
 * @property {string} searchUrl
 * @property {string} queryKey
 * @property {SupportedMarketplaceCrawlScript} site
 */

/**
 * @typedef {Function} EventCallback
 * @param {AbortSignal} data - The data passed to the callback
 * @returns {void}
 */

class CancellableEvent {
  constructor() {
    this.controller = null;
    /** @type {EventCallback|null} */
    this.callback = null;
  }

  /**
   * @param {EventCallback} callback
   */
  dispatch(callback) {
    // Abort previous controller if running
    if (this.controller) {
      this.controller.abort();
    }

    this.controller = new AbortController();
    const signal = this.controller.signal;

    // Store the callback
    callback(signal);
  }

  abort() {
    // Abort previous controller if running
    if (this.controller) {
      this.controller.abort();
    }
  }
}

class Events {
  constructor() {
    /**
     * @type {Object.<string, CancellableEvent>}
     */
    this.events = {};
  }

  /**
   * @param {string} key
   * @param {EventCallback} callback
   * @returns {CancellableEvent}
   */
  dispatch(key, callback) {
    if (this.events[key]) {
      this.events[key].dispatch(callback);
    }
    this.events[key] = new CancellableEvent();
    this.events[key].dispatch(callback);
    return this.events[key];
  }

  abort(key) {
    if (this.events[key]) {
      this.events[key].abort();
    }
  }
}

/**
 * @typedef {TargetSite[]} TargetSites
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension ssinstalledss.");
});
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("[background] Received:", message);

  if (message.type === "PING") {
    sendResponse({ reply: "PONG from background" });
  }

  if (message.type === "CURRENT_TAB") {
    const payload = message.payload;

    /** @type {TargetSites} */
    const crawlTargetSites = payload.crawlTargetSites;
    // return true;

    CrawlSite(crawlTargetSites, payload.currentQuery);

    // Send back response after tab is created
    sendResponse({ status: "Tab opened" });

    // ❗ Important: keep the message channel alive
    return true;
  }

  // Return true to allow async sendResponse
  return true;
});

/**
 *
 * @param {string} tabId
 * @param {SupportedMarketplaceCrawlScript} site_name
 */
function executeCrawlerScript(tabId, site_name) {
  console.log(`EXECUTE for tab ${tabId} ${site_name}`);
  // Inject the content script
  chrome.scripting.executeScript({
    target: { tabId },
    // files: [`scrapers/${site_name}.js`],
    func: () => {
      console.log("FUNC FOR ", site_name);
      console.log(document);
    },
  });
}
/**
 *
 * @param {TargetSites} crawlTargetSites
 */
function CrawlSite(crawlTargetSites, currentQuery) {
  const tabIds = [];
  const ids_markpetlace = {};

  const events = new Events();

  crawlTargetSites.forEach((data) => {
    chrome.tabs.create(
      {
        url: `${data.url}${data.searchUrl}?${data.queryKey}=${currentQuery}`,
        active: false,
      },
      async (createdTab) => {
        console.log("CREATED TAB ", createdTab);
        ids_markpetlace[createdTab.id] = data.site;

        // await chrome.scripting.executeScript({
        //   target: { tabId: createdTab.id },
        //   // runAt: "document_end",
        //   files: [`scrapers/${data.site}.js`],
        // });
        // await chrome.scripting.registerContentScripts;
      }
    );

    chrome.tabs.onUpdated.addListener(function listener(tabId, info, tab) {
      if (info == "") {
      }
      const currentMarketplace = ids_markpetlace[tabId];

      if (currentMarketplace == undefined) {
        chrome.tabs.onUpdated.removeListener(listener);
      }

      console.log("LOADED!", info, tabId, ids_markpetlace[tabId]);

      if (info && info.status == "complete") {
        // executeCrawlerScript(tabId, currentMarketplace);

        events.dispatch(currentMarketplace, (signal) => {
          console.log("PROCESSING! ", currentMarketplace);

          signal.addEventListener("abort", () => {
            console.log("Aborted!!");
          });
        });
      } else if (info.status == "loading") {
        events.abort(currentMarketplace);
      }
    });
  });
}
