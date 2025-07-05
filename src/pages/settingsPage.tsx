import { useEffect, useState } from "react";
import { marketplaces } from "../utils/marketplace.db";

export default function SettingsPage() {
  const [settingsObject, setSettingsObject] = useState<Record<string, boolean>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["settings"], (result) => {
      let SettingsStorageObject: Record<string, boolean> = {};

      if (result.settings) {
        SettingsStorageObject = { ...result.settings };
      }

      Object.keys(marketplaces).forEach((data) => {
        if (!(data in SettingsStorageObject)) {
          SettingsStorageObject[data] = false;
        }
      });
      chrome.storage.local.set({ settings: SettingsStorageObject });
      setSettingsObject(SettingsStorageObject);
    });
  }, []);

  function handleToggle(marketplaceKey: string) {
    const newSettingsObject = { ...settingsObject };
    newSettingsObject[marketplaceKey] = !newSettingsObject[marketplaceKey];

    chrome.storage.local.set({ settings: newSettingsObject });
    setSettingsObject(newSettingsObject);
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-5">
      <h4 className="text-xl text-neutral-800 text-center mb-3">
        Marketplace Settings
      </h4>
      <p className="text-lg text-neutral-800 text-center mb-5">
        Use this config to compare product across many marketplace.
      </p>

      <form className="max-w-md mx-auto">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-neutral-800 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Your Marketplace..."
            required
          />
        </div>
      </form>
      <div className=" pt-5">
        <div className=" flex flex-col gap-3">
          {Object.keys(settingsObject)
            .filter((marketplaceKey) => {
              const marketplace =
                marketplaces[marketplaceKey as keyof typeof marketplaces];
              return marketplace?.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            })
            .map((marketplaceKey) => (
              <div key={marketplaceKey} className="flex justify-between px-3">
                <div>
                  <p className="text-xl text-neutral-900">
                    {
                      marketplaces[marketplaceKey as keyof typeof marketplaces]
                        ?.name
                    }
                  </p>
                </div>

                <div>
                  <label className="inline-flex items-center cursor-pointer gap-2">
                    <span className="ms-3 text-sm font-medium text-gray-400">
                      {settingsObject[marketplaceKey] ? "Enabled" : "Disabled"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settingsObject[marketplaceKey] || false}
                      onChange={() => handleToggle(marketplaceKey)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
