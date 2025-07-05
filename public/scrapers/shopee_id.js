(function () {
  console.log("Shopee Crawler!");
  let currentMarketplace = undefined;

  function fetchProduct() {
    const search_products = document.querySelectorAll('li[data-sqe="item"]');
    const products = [];

    // console.log(search_products);

    for (let product of search_products) {
      console.log("EACH PRODUCT ", product);
      const prodcutLink = product.querySelector(":scope a");
      console.log("product link ", prodcutLink);

      // pass
      if (!prodcutLink) {
        continue;
      }
      const productLinkText = prodcutLink.href;

      const productImage = product.querySelector(
        ":scope .contents > div > div > img"
      );

      // pass
      if (!productImage) {
        continue;
      }
      console.log("productImage ", productImage);
      const productImageSrc = productImage.src;

      const productTitle = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > div > div"
      );

      const clone = productTitle.cloneNode(true);
      clone.querySelectorAll("img").forEach((img) => img.remove());

      const productTitleText = clone.textContent.trim();
      // console.log("productTitleText ", productTitleText);
      console.log("productTitle ", productTitle);

      const productPriceCurrency = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > span"
      );
      const productPriceAmount = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > span:nth-of-type(2)"
      );
      const productPriceText = `${productPriceCurrency.textContent} ${productPriceAmount.textContent}`;

      let productRatingText = "";
      const productRating = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > div:nth-of-type(2) > :last-child > div > :last-child"
      );

      if (productRating) {
        productRatingText = productRating.textContent;
      }
      console.log("productRating", productRating, productRatingText);

      let productSoldText = "";
      const productSold = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > div:nth-of-type(2) > :last-child > :last-child"
      );

      // no one has bought this lol, this is not an error btw, it's ok.
      if (productSold) {
        productSoldText = productSold.textContent;
      }

      const productDeliveryEstimation = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > :last-child > div > :last-child"
      );
      let productDeliveryEstimationText = "";
      if (productDeliveryEstimation) {
        productDeliveryEstimationText = productDeliveryEstimation.textContent;
      }

      const productSource = product.querySelector(
        ":scope .contents > div > div:nth-of-type(2) > :last-child > :last-child > :last-child"
      );
      const productSourceText = productSource.textContent;

      console.log(
        "productDeliveryEstimationText ",
        productDeliveryEstimationText
      );
      console.log("productSourceText ", productSourceText);

      console.log("productSold", productSold);
      console.log(productSoldText);

      products.push({
        title: productTitleText,
        price: productPriceText,
        link: productLinkText,
        imgSrc: productImageSrc,
        sold: productSoldText,
        rating: productRatingText,

        delivery: productDeliveryEstimationText,
        source: productSourceText,
      });

      // console.log("currentMarketplace ", currentMarketplace);
    }

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
      let maxIndex = 3;
      const interval = setInterval(() => {
        window.scrollTo(
          0,
          (document.body.scrollHeight - 200) * (index / maxIndex)
        );

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
      }, 500); // scroll every second
    }).finally(() => {
      fetchProduct();
    });
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("YOU HAVE MESSAGe ", message, sender);

    if (message.action == "initial" && message.currentMarketplace) {
      currentMarketplace = message.currentMarketplace;

      setTimeout(async () => {
        await scrollToBottom();
      }, 3000);
    }

    // if (message.action == "fetchNow") {
    //   fetchProduct();
    // }
  });

  // Wait 3s to allow JS to render content
})();
