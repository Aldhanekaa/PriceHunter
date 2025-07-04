(function () {
  // Delay to ensure page loads fully
  setTimeout(() => {
    console.log("THIS IS AMAZON!");

    const title = document.querySelector("#productTitle")?.innerText.trim();
    const price = document
      .querySelector("#priceblock_ourprice, #priceblock_dealprice")
      ?.innerText.trim();
    const image = document.querySelector("#landingImage")?.src;

    const productData = {
      title: title || "No title found",
      price: price || "No price found",
      image: image || "No image found",
    };

    chrome.runtime.sendMessage({
      action: "productData",
      data: productData,
    });
  }, 3000); // Wait 3s to allow Amazon's JS to render content
})();
