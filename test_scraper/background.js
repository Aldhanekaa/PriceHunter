chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openAmazonTab") {
    chrome.tabs.create({
      url: "https://www.amazon.com/ToLife-Dehumidifiers-Dehumidifier-Basement-Bathroom/dp/B0F6S3VNRT", // Replace with a real product ASIN
      active: false,
    });

    chrome.tabs.create({
      url: "https://shopee.co.id/IPHONE-15-Plus-Second-Original-IPHONE-15-512GB-256GB-128GB-Bekas-FULLSET-MULUS-i.1548596988.41002012013", // Replace with a real product ASIN
      active: false,
    });
  }

  if (message.action === "productData") {
    console.log("Received product data:", message.data);
    // You can do more here: save, send to server, etc.
  }
});
