// content full
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "wco4fvyvde01",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "JhAbFr2RxXJ2ZJgNsyTC2UrGPrwpwSEIUvLfmxfbbfg",
});

console.log(client);
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItemsNumber = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
cart = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await client.getEntries({
        content_type: "comfyHouse",
      });
      let products = result.items.map((item) => {
        let { id } = item.sys;
        let { title, price } = item.fields;
        let image = item.fields.image.fields.file.url;

        return { id, title, price, image };
      });

      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

// buttons
let bagBtnsDOM = [];

// display products
class UI {
  displayProduct(products) {
    let result = "";
    products.forEach((product) => {
      const { id, title, price, image } = product;
      result += `
        <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src="${image}"
              alt="${title}"
              class="product-img"
            />
            <button class="bag-btn" data-id="${id}">
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div> 
          <h3>${title}</h3>
          <h4>$${price}</h4>
        </article>
        <!-- end of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagBtn() {
    let bagBtns = [...document.querySelectorAll(".bag-btn")];
    bagBtnsDOM = bagBtns;
    bagBtns.forEach((btn) => {
      let btnID = btn.dataset.id;
      let inCart = cart.find((item) => item.id === btnID);
      if (inCart) {
        btn.textContent = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.textContent = "In Cart";
        e.target.disabled = true;
        // add item to cart and the number of item
        let selectedProduct = { ...Storage.getProductInfo(btnID), amount: 1 };
        cart = [...cart, selectedProduct];
        // save cart in local storage
        Storage.saveCart(cart);
        // recalculate cart values
        this.updateCartValues(cart);
        // add list of cart item
        this.updateCartItemsList(cart);
        // display cart
        this.showCart();
      });
    });
  }

  updateCartValues(cart) {
    let cartItems = 0;
    let cartTotalAmt = 0;
    cart.forEach((item) => {
      cartItems += item.amount;
      cartTotalAmt += item.amount * item.price;
    });
    cartItemsNumber.textContent = cartItems;
    cartTotal.textContent = parseFloat(cartTotalAmt.toFixed(2));
  }

  updateCartItemsList(cart) {
    let cartList = "";
    if (cart) {
      cart.forEach((item) => {
        const { image, title, price, amount, id } = item;
        cartList += `
      <div class="cart-item">
            <img src="${image}" alt="${title}" />
            <div>
              <h4>${title}</h4>
              <h5>$${price}</h5>
              <span class="remove-item" data-id="${id}">remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id="${id}"></i>
              <p class="item-amount">${amount}</p>
              <i class="fas fa-chevron-down" data-id="${id}"></i>
            </div>
          </div>
      `;
      });
    }
    // add event listener for remove item button
    cartContent.innerHTML = cartList;
    const removeItemBtn = document.querySelectorAll(".remove-item");
    const increaseAmt = document.querySelectorAll(".fas.fa-chevron-up");
    const decreaseAmt = document.querySelectorAll(".fas.fa-chevron-down");

    removeItemBtn.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.removeCartItem(e.target.dataset.id);
      });
    });
    increaseAmt.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.increaseItemAmt(e.target.dataset.id);
      });
    });
    decreaseAmt.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.decreaseItemAmt(e.target.dataset.id);
      });
    });
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setupAPP() {
    // check cart inside the local storage
    cart = Storage.getCartItems();
    // update the amount of items and total
    this.updateCartValues(cart);
    this.updateCartItemsList(cart);
    // add function for display and hide cart
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  cartClearAllItems() {
    Storage.removeCart();
    cart = [];
    this.updateCartItemsList(cart);
    this.updateCartValues(cart);
    this.bagBtnsDOMUpdate(cart);
  }

  removeCartItem(id) {
    cart = Storage.getCartItems();
    cart = cart.filter((item) => item.id !== id);
    this.updateCartItemsList(cart);
    this.updateCartValues(cart);
    this.bagBtnsDOMUpdate(cart);
    Storage.saveCart(cart);
  }

  increaseItemAmt(id) {
    let newCart = Storage.getCartItems();
    console.log(newCart);
    cart = newCart.map((item) => {
      if (item.id === id) {
        return { ...item, amount: item.amount + 1 };
      }
      return item;
    });

    this.updateCartValues(cart);
    this.updateCartItemsList(cart);
    this.bagBtnsDOMUpdate(cart);
    Storage.saveCart(cart);
  }

  decreaseItemAmt(id) {
    let newCart = Storage.getCartItems();
    console.log(newCart);
    cart = newCart
      .map((item) => {
        if (item.id === id) {
          if (item.amount > 0) {
            return { ...item, amount: item.amount - 1 };
          }
        }
        return item;
      })
      .filter((item) => item.amount !== 0);

    this.updateCartValues(cart);
    this.updateCartItemsList(cart);
    this.bagBtnsDOMUpdate(cart);
    Storage.saveCart(cart);
  }

  bagBtnsDOMUpdate(cart) {
    bagBtnsDOM.forEach((button) => {
      if (!cart.find((item) => item.id === button.dataset.id)) {
        button.innerHTML = ` <i class="fas fa-shopping-cart"></i>
              add to bag`;
        button.disabled = false;
      }
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.cartClearAllItems();
    });
  }
}

// local storage
class Storage {
  static storeProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProductInfo(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let foundedProduct = products.find((product) => product.id === id);
    return foundedProduct;
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCartItems() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }

  static removeCart() {
    localStorage.removeItem("cart");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup application
  ui.setupAPP();
  //   get products
  products
    .getProducts()
    .then((products) => {
      ui.displayProduct(products);
      Storage.storeProducts(products);
    })
    .then(() => {
      ui.getBagBtn();
      ui.cartLogic();
    });
});
