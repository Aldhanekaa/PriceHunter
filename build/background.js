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

function AreTheseTwoArraysEqualUnordered(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
}

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

var currentTabId = 0; // this the tabId when user focuses on specific tab to do scraping (some of marketplaces has lazy loaded image where user has to presence in the tab)
var mainTabId = 0; // this is the mainTab user is currently scraping the data for
var tabIdNeedToFocusQueues = []; // this is queue for tabs that user need to focus in order to scrape it
// let tabIdsNeedToFocus = [];

var openedMainTabsId = [];

async function IsFetchingDone(fetchedSites) {
  const result = await chrome.storage.local.get([`crawlSites_${mainTabId}`]);
  // console.log("ISFETCHINGDONE FUNC result", result);
  // console.log(`WHOA result[crawlSites_${mainTabId}]`);
  // console.log(`WHOA 2`, result[`crawlSites_${mainTabId}`]);

  if (result[`crawlSites_${mainTabId}`]) {
    console.log(
      `WHOA COMPARE AreTheseTwoArraysEqual()`,
      fetchedSites,
      result[`crawlSites_${mainTabId}`]
    );

    return AreTheseTwoArraysEqualUnordered(
      fetchedSites,
      result[`crawlSites_${mainTabId}`]
    );
  }

  return undefined;
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("[background] Received:", message);

  if (message.type === "POPUP_OPENED") {
    if (!tabIdNeedToFocusQueues) {
      tabIdNeedToFocusQueues = [];
    }

    console.log("Popup was opened");

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];

      // if the extension is NOT fetching data by activating a tab
      if (currentTab && currentTabId == 0) {
        mainTabId = currentTab.id;

        // if the tab has not opened the pop up
        if (!openedMainTabsId.includes(currentTab.id)) {
          openedMainTabsId.push(currentTab.id);
          chrome.storage.local.set({ [`crawlState_${mainTabId}`]: "idle" });
        } else {
          let fetchedSites = [];
          const result = await chrome.storage.local.get(["products_mainTabs"]);
          let products_mainTabs = {};

          if (result.products_mainTabs) {
            products_mainTabs = result.products_mainTabs;
          }

          if (mainTabId in products_mainTabs) {
            fetchedSites = Object.keys(products_mainTabs[mainTabId]);

            const isFetchingDone = await IsFetchingDone(fetchedSites);

            if (isFetchingDone) {
              chrome.storage.local.set({
                [`crawlState_${mainTabId}`]: "fetched",
              });
            }
          }
        }

        // console.log("Popup opened on tab:", currentTab);
        // const origin = new URL(currentTab.url).origin;

        // console.log("Popup origin:", origin);

        // You can access currentTab.url, currentTab.id, etc.
      }
    });
  }

  if (message.type === "PING") {
    sendResponse({ reply: "PONG from background" });
  }

  if (message.type === "CRAWL_TAB_NOW") {
    const payload = message.payload;

    /** @type {TargetSites} */
    const crawlTargetSites = payload.crawlTargetSites;
    // return true;

    CrawlSite(crawlTargetSites, payload.currentQuery);
    chrome.storage.local.set({ [`crawlState_${mainTabId}`]: "fetching" });

    // Send back response after tab is created
    sendResponse({ status: "Tab opened" });

    // ❗ Important: keep the message channel alive
    return true;
  }

  // this action sent from the content script of marketplace that opened to do scraping
  if (message.action === "focusMe") {
    tabIdNeedToFocusQueues.push(sender.tab.id);

    if (currentTabId == 0) {
      currentTabId = sender.tab.id;
      chrome.tabs.update(sender.tab.id, { active: true }, () => {
        chrome.action.openPopup();
      });
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "scrollNow",
      });
    }
  }

  if (message.action === "productData") {
    console.log("Received product data:", message.data);
    chrome.tabs.remove(sender.tab.id);
    let fetchedSites = [];

    chrome.storage.local.get(["products_mainTabs"], async (result) => {
      const newProductData = message.data;
      let draft_products_mainTabs = {};

      if (result.products_mainTabs) {
        draft_products_mainTabs = result.products_mainTabs;
      }

      draft_products_mainTabs = Object.assign({}, draft_products_mainTabs, {
        [mainTabId]: {
          ...(mainTabId in draft_products_mainTabs &&
            draft_products_mainTabs[mainTabId]),
          [message.origin]: newProductData,
        },
      });
      console.log("FETCHED SITESS ", draft_products_mainTabs);

      if (mainTabId in draft_products_mainTabs) {
        fetchedSites = Object.keys(draft_products_mainTabs[mainTabId]);

        const isFetchingDone = await IsFetchingDone(fetchedSites);

        console.log("isFetchingDone", isFetchingDone);
        if (isFetchingDone) {
          chrome.storage.local.set({ [`crawlState_${mainTabId}`]: "fetched" });
          chrome.runtime.sendMessage({
            type: "ALERT_USER",
            status: "fetch_status",
            origin: message.origin,
            data: "fetched",
          });
        }
        // console.log("FETCHED isFetchingDone ", fetchedSites, isFetchingDone);
      }

      chrome.storage.local.set({
        products_mainTabs: Object.assign({}, draft_products_mainTabs),
      });
    });

    chrome.runtime.sendMessage({
      type: "ALERT_USER",
      status: "products_list",
      origin: message.origin,
      data: message.data,
    });

    if (currentTabId != 0 && currentTabId == sender.tab.id) {
      currentTabId = 0;
      chrome.tabs.update(mainTabId, { active: true });
      chrome.action.openPopup();

      if (tabIdNeedToFocusQueues.length > 0) {
        tabIdNeedToFocusQueues = tabIdNeedToFocusQueues.shift();
        if (tabIdNeedToFocusQueues.length > 0) {
          const nextTabId = new_tabIdNeedToFocusQueues[1];
          tabIdNeedToFocusQueues.push(nextTabId);
          currentTabId = nextTabId;

          chrome.tabs.update(nextTabId, { active: true }, () => {
            chrome.action.openPopup();
          });
          chrome.tabs.sendMessage(nextTabId, {
            action: "scrollNow",
          });
        }
      }
    }
    // console.log("Sender ", sender, message);
    // chrome.tabs.remove(sender.tab.id);
    // You can do more here: save, send to server, etc.
  }

  if (message.action === "askMeToFetch") {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "fetchNow",
    });
    // console.log("Sender ", sender, message);
    // chrome.tabs.remove(sender.tab.id);
    // You can do more here: save, send to server, etc.
  }

  // Return true to allow async sendResponse
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  openedMainTabsId = openedMainTabsId.filter((mainTabId) => mainTabId != tabId);

  chrome.storage.local.get(["products_mainTabs"], (result) => {
    let draft_products_mainTabs = {};

    chrome.storage.local.remove([`crawlSites_${tabId}`, `crawlState_${tabId}`]);

    if (result.products_mainTabs) {
      draft_products_mainTabs = result.products_mainTabs;

      if (result.products_mainTabs) {
        delete draft_products_mainTabs[tabId];

        chrome.storage.local.set({
          products_mainTabs: Object.assign({}, draft_products_mainTabs),
        });
      }
    }
  });
});

/**
 *
 * @param {TargetSites} crawlTargetSites
 */
async function CrawlSite(crawlTargetSites, currentQuery) {
  const ids_markpetlace = {};
  const marketplaces = {};
  const marketplaceMessagesSentStatus = {};

  const events = new Events();

  let marketplacesToCrawl = crawlTargetSites.map((data) => data.url);

  const products_mainTabs = await chrome.storage.local.get([
    "products_mainTabs",
  ]);
  chrome.storage.local.set({
    products_mainTabs: Object.assign(
      {},
      {
        ...products_mainTabs,
        [mainTabId]: {},
      }
    ),
  });

  chrome.storage.local.set({
    [`crawlSites_${mainTabId}`]: marketplacesToCrawl,
  });

  crawlTargetSites.forEach((data) => {
    let hasSentMessage = false;

    chrome.tabs.create(
      {
        url: `${data.url}${data.searchUrl}?${data.queryKey}=${currentQuery}`,
        active: false,
      },
      async (createdTab) => {
        // console.log("CREATED TAB ", createdTab);
        ids_markpetlace[createdTab.id] = data.site;

        // console.log("CREATED TAB ", createdTab);

        marketplaces[data.site] = data;

        // if (data.needToFocus) {
        // tabIdsNeedToFocus.push(createdTab.id);
        // }

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
        return;
      }

      // console.log("LOADED!", info, tabId, ids_markpetlace[tabId]);

      if (info && info.status == "complete") {
        // executeCrawlerScript(tabId, currentMarketplace);

        events.dispatch(currentMarketplace, (signal) => {
          // console.log("PROCESSING! ", currentMarketplace);
          // console.log("HEY! ", marketplaceMessagesSentStatus, marketplaces);

          if (!marketplaceMessagesSentStatus[currentMarketplace]) {
            try {
              chrome.tabs.sendMessage(tabId, {
                currentMarketplace: marketplaces[currentMarketplace],
                mainTabId: mainTabId,
                action: "initial",
              });
            } catch (error) {}
            marketplaceMessagesSentStatus[currentMarketplace] = true;
          }

          // signal.addEventListener("abort", () => {
          //   console.log("Aborted!!");
          // });
        });
      } else if (info.status == "loading") {
        events.abort(currentMarketplace);
      }
    });
  });
}
