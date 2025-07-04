document.getElementById("crawlBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "openAmazonTab" });
});
