(function () {
  console.log("lazada Crawler!!! ", document);

  let currentMarketplace = undefined;

  function fetchProduct() {
    const search_products = document.querySelectorAll(
      'div[data-tracking="product-card"]'
    );

    const products = [];

    for (let product of search_products) {
      console.log("PRODUCT ", product);
      const content = product.querySelector(":scope div > div");

      // console.log("Product Content ", content);

      // GET PRODUCT LINK
      const prodcutLink = content.querySelector(":scope > div > div > a");
      // pass
      if (!prodcutLink) {
        continue;
      }
      const productLinkText = prodcutLink.href;

      // GET PRODUCT IMAGE
      const productImage = content.querySelector(
        ":scope .picture-wrapper > img"
      );
      // pass
      if (!productImage) {
        continue;
      }
      // console.log("productImage", productImage);
      const productImageSrc = productImage.src;

      // GET PRODUCT TITLE
      const productTitle = content.querySelector(
        ":scope > :last-child > div:nth-of-type(2) > a"
      );
      const clone = productTitle.cloneNode(true);
      clone.querySelectorAll("i").forEach((i) => i.remove());
      const productTitleText = clone.textContent.trim();

      // GET PRODUCT PRICE
      const productPrice = content.querySelector(
        ":scope > :last-child > div:nth-of-type(3) > span"
      );
      const productPriceText = productPrice.textContent;

      // GET PRODUCT SOLD
      let productSoldText = "";
      const productSold = content.querySelector(
        ":scope > :last-child > :last-child > span > span"
      );
      if (productSold) {
        productSoldText = productSold.textContent;
      }

      // GET PRODUCT SOURCE
      let productSourceText = "";
      const productSource = content.querySelector(
        ":scope > :last-child > :last-child > :last-child"
      );
      if (productSourceText) {
        productSourceText = productSource.textContent;
      }

      // console.log("productLinkText ", productLinkText);
      // console.log("productImage", productImageSrc);
      // console.log("productTitle", productTitleText);
      // console.log("productPriceText", productPriceText);
      // console.log("productSoldText", productSoldText);
      // console.log("productSource", productSourceText);

      products.push({
        title: productTitleText,
        price: productPriceText,
        link: productLinkText,
        imgSrc: productImageSrc,
        sold: productSoldText,
        rating: "",

        delivery: "",
        source: productSourceText,
      });
    }

    console.log(products);

    chrome.runtime.sendMessage({
      action: "productData",
      data: products,
      origin: document.location.origin,
    });

    // return products;
  }

  const scrollToBottom = async () => {
    return new Promise((resolve) => {
      let lastScroll = -1;
      let index = 1;
      let maxIndex = 14;
      const interval = setInterval(() => {
        window.scrollTo(
          0,
          (document.body.scrollHeight - 200) * (index / maxIndex)
        );

        window.dispatchEvent(new Event("focus"));
        document.dispatchEvent(new Event("visibilitychange"));

        if (
          index == maxIndex - 2 ||
          document.documentElement.scrollTop === lastScroll
        ) {
          clearInterval(interval);
          resolve();
        } else {
          lastScroll = document.documentElement.scrollTop;
        }
        index += 1;
      }, 750); // scroll every second
    }).finally(() => {
      fetchProduct();
    });
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("YOU HAVE MESSAGe ", message, sender);

    if (message.action == "initial" && message.currentMarketplace) {
      currentMarketplace = message.currentMarketplace;

      chrome.runtime.sendMessage({
        action: "focusMe",
      });
    }

    if (message.action == "scrollNow") {
      setTimeout(async () => {
        await scrollToBottom();
      });
    }
  });

  // Wait 3s to allow JS to render content
})();
