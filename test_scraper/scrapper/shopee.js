(function () {
  // Delay to ensure page loads fully
  setTimeout(() => {
    console.log("SHOPEE");

    chrome.runtime.sendMessage({
      action: "productData",
      data: {
        message: "ngentot enak",
      },
    });
  }, 3000); // Wait 3s to allow Amazon's JS to render content
})();
