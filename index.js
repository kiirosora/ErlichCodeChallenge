$(function () {
  // Get cart items from local storage on load
  var cart = JSON.parse(localStorage.getItem("cart") || "[]");

  var $cartModal = $("#cart-modal"),
    $cartItems = $cartModal.find(".cart-items"),
    $cartSummary = $cartModal.find(".open-checkout"),
    $cartCheckoutButton = $cartModal.find(".cart-summary"),
    $cartQuantity = $cartModal.find(".cart-quantity > span"),
    $cartTotal = $cartModal.find(".cart-total > span"),
    $coPage = $("#checkout-page"),
    $coModal = $("#checkout-page .checkout-modal"),
    $coItems = $coModal.find(".checkout-items"),
    $coSubtotal = $coModal.find(".subtotal span"),
    $coTotal = $coModal.find(".total span");

  // Splide slider
  var splide = new Splide(".splide", {
    type: "loop",
  });
  splide.mount();

  cartRefresh();

  // Handle buy button click
  $(".buy-button").on("click", function () {
    var parentFig = $(this).parents("figure");
    var prodData = {};

    //Collect product data
    prodData.id = parentFig.data("productid");
    prodData.idDiscounted = parentFig.hasClass("discounted");
    prodData.img = parentFig.find("img").first().attr("src");
    prodData.description = parentFig.find("figcaption").first().html();
    prodData.normalPrice = parseFloat(
      parentFig.find(".normal-price").first().html().replace("$", "")
    );
    prodData.salePrice = 0.0;
    // Check if product is discounted
    if (prodData.idDiscounted)
      prodData.salePrice = parseFloat(
        parentFig.find(".discounted-price").first().html().replace("$", "")
      );

    // Check if item already exists
    var index = cart.findIndex((item) => item.id == prodData.id);
    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      prodData.quantity = 1;
      cart.push(prodData);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    cartRefresh();
  });

  // Handle cart button click
  $("#cart-button a").on("click", function (e) {
    e.preventDefault();

    cartRefresh();

    $cartModal.toggle();
  });

  // Handle cart item remove button click
  $(document).on(
    "click",
    "#cart-modal button.remove, .checkout-items button.remove",
    function () {
      var id = $(this).data("id");
      cartRemove(id);
      cartRefresh();
    }
  );

  // Handle checkout button click
  $(".open-checkout").on("click", function () {
    $("#checkout-page").removeClass("hide");
    $cartModal.hide();
  });

  // Handle checkout button close click
  $("#button-close-checkout").on("click", function () {
    $("#checkout-page").addClass("hide");
  });

  function cartRefresh() {
    var totalQuantity = 0,
      totalPrice = 0;

    $cartItems.empty();
    $coItems.empty();

    if (cart.length) {
      // List items in cart
      cart.forEach(function (item) {
        // Create element for the cart view
        var $cartItem = $(
          `<figure class="cart-item ${item.idDiscounted ? "discounted" : ""}">`
        );

        $cartItem.append(
          `<img src="${item.img}"><figcaption>${
            item.description
          }<strong>quantity: ${
            item.quantity
          }</strong><em><span class="discounted-price">${
            item.idDiscounted ? "$" + item.salePrice : ""
          }</span>
        <span class="normal-price">$${
          item.normalPrice
        }</span></em><div><button class="remove" data-id="${
            item.id
          }">remove</button></div></figcaption>`
        );

        // Create element for the checkout view
        var $coItem = $(
          `<li><figure class="cart-item ${
            item.idDiscounted ? "discounted" : ""
          }"></figure><li>`
        );
        $coItem.find("figure").append(
          `<img src="${item.img}"><figcaption>${
            item.description
          }</figcaption><em class="qty">Quantity: ${
            item.quantity
          }</em><em class="price">
        <span class="normal-price">$${item.normalPrice.toFixed(
          2
        )}</span><span class="discounted-price">${
            item.idDiscounted ? "$" + item.salePrice.toFixed(2) : ""
          }</span><button class="remove" data-id="${
            item.id
          }">remove</button></em>`
        );

        totalQuantity += item.quantity;
        totalPrice +=
          item.quantity *
          (item.idDiscounted ? item.salePrice : item.normalPrice);

        $coItems.append($coItem);
        $cartItems.append($cartItem);
      });

      $cartSummary.show();
      $cartCheckoutButton.show();
    } else {
      $cartItems.html('<div class="no-item">No items in shopping bag</div>');
      $cartSummary.hide();
      $cartCheckoutButton.hide();
      $("#checkout-page").addClass("hide");
    }

    // Update cart summary
    $cartQuantity.html(totalQuantity);
    $cartTotal.html(totalPrice.toFixed(2));
    // Update cart summary
    $coSubtotal.html("$" + totalPrice.toFixed(2));
    $coTotal.html("$" + totalPrice.toFixed(2));
  }

  function cartRemove(id) {
    var index = cart.findIndex((item) => item.id == id);
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));
  }
});
