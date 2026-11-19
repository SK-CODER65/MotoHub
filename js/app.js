// Shared MotoHub functionality. All demo data is saved in the browser's localStorage.
const $ = (selector, root = document) => root.querySelector(selector);
const money = amount => "₹" + Number(amount).toLocaleString("en-IN");
const getStore = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const setStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const page = document.body.dataset.page;
const base = page === "home" ? "" : "../";
const cart = () => getStore("motohub_cart");
const wishlist = () => getStore("motohub_wishlist");
const findProduct = id => PRODUCTS.find(p => p.id === Number(id));

function toast(message) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function updateCounts() {
  const c = cart().reduce((n, i) => n + i.qty, 0);
  const w = wishlist().length;
  const cartCount = $("#cart-count"), wishCount = $("#wish-count");
  if (cartCount) cartCount.textContent = c;
  if (wishCount) wishCount.textContent = w;
}

function header() {
  const links = page === "home" ? ["Shop", "Orders"] : ["Home", "Shop", "Orders"];
  const hrefs = {
    "Home": base + "index.html",
    "Shop": base + "pages/products.html",
    "Orders": base + "pages/orders.html"
  };
  $("#site-header").innerHTML = `<header class="site-header"><div class="nav-wrap"><a class="logo" href="${base}index.html">MOTO<span>HUB.</span></a><nav id="nav-links" class="nav-links">${links.map(x => `<a href="${hrefs[x]}">${x}</a>`).join("")}</nav><div class="nav-actions"><a class="nav-icon" href="${base}pages/wishlist.html" aria-label="Wishlist">♡<span id="wish-count" class="count">0</span></a><a class="nav-icon" href="${base}pages/cart.html" aria-label="Cart">⌑<span id="cart-count" class="count">0</span></a><a class="nav-icon account-link" href="${base}pages/login.html" aria-label="Account">♙</a></div><button class="menu-toggle" id="menu-toggle" aria-label="Open navigation">☰</button></div></header>`;
  $("#menu-toggle").addEventListener("click", () => $("#nav-links").classList.toggle("open"));
  updateCounts();
}

function footer() {
  $("#site-footer").innerHTML = `<footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a class="logo" href="${base}index.html">MOTO<span>HUB.</span></a><p>Thoughtfully selected riding gear and accessories for the road ahead. Gear up and make every ride count.</p></div><div class="footer-links"><div><strong>EXPLORE</strong><a href="${base}pages/products.html">All products</a><a href="${base}pages/products.html?category=Helmets">Helmets</a><a href="${base}pages/products.html?category=Jackets">Jackets</a></div><div><strong>YOUR ACCOUNT</strong><a href="${base}pages/login.html">Sign in</a><a href="${base}pages/wishlist.html">Wishlist</a><a href="${base}pages/orders.html">Orders</a></div><div><strong>HELP</strong><a href="${base}pages/cart.html">Shopping cart</a><a href="${base}pages/checkout.html">Checkout</a><a href="${base}index.html#about">About MotoHub</a></div></div></div><div class="footer-bottom"><span>© 2026 MotoHub.</span><span>Made for the love of the ride.</span></div></footer>`;
}

function card(p) {
  const saved = wishlist().includes(p.id);
  return `<article class="product-card"><div class="product-image"><a href="${base}pages/product-details.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/600x500/e9ede7/53604e?text=MotoHub+Gear'"></a>${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}<button class="heart-btn ${saved ? "saved" : ""}" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist">${saved ? "♥" : "♡"}</button></div><div class="product-info"><span class="product-category">${p.category}</span><a class="product-name" href="${base}pages/product-details.html?id=${p.id}">${p.name}</a><div class="product-rating"><span>★</span> ${p.rating} <span style="color:#929a92">(${p.reviews} reviews)</span></div><div class="product-bottom"><div class="price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div><button class="quick-add" data-add="${p.id}">+ Add</button></div></div></article>`;
}

function renderCards(target, items) {
  const el = $(target);
  if (!el) return;
  el.innerHTML = items.map(card).join("");
}

function addToCart(id, qty = 1) {
  const items = cart();
  const existing = items.find(i => i.id === Number(id));
  if (existing) existing.qty += qty;
  else items.push({ id: Number(id), qty });
  setStore("motohub_cart", items);
  updateCounts();
  toast("Added to your cart");
}

function toggleWish(id) {
  let items = wishlist();
  items = items.includes(Number(id)) ? items.filter(x => x !== Number(id)) : [...items, Number(id)];
  setStore("motohub_wishlist", items);
  updateCounts();
  toast(items.includes(Number(id)) ? "Saved to wishlist" : "Removed from wishlist");
  return items;
}

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);
  const wish = e.target.closest("[data-wish]");
  if (wish) {
    toggleWish(wish.dataset.wish);
    wish.classList.toggle("saved");
    wish.textContent = wish.classList.contains("saved") ? "♥" : "♡";
  }
});

function home() {
  renderCards("#featured-products", PRODUCTS.slice(0, 4));
}

function shop() {
  const categoryFilters = $("#category-filters"),
    search = $("#search-input"),
    sort = $("#sort-select"),
    price = $("#price-filter"),
    priceValue = $("#price-value");
  const categories = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  let active = new URLSearchParams(location.search).get("category") || "All";
  if (!categories.includes(active)) active = "All";
  categoryFilters.innerHTML = categories.map(c => `<label><input type="radio" name="category" value="${c}" ${c === active ? "checked" : ""}> ${c}</label>`).join("");

  function update() {
    let list = PRODUCTS.filter(p => (active === "All" || p.category === active) && p.price <= Number(price.value) && p.name.toLowerCase().includes(search.value.toLowerCase()));
    if (sort.value === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort.value === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort.value === "rating") list.sort((a, b) => b.rating - a.rating);
    $("#results-count").textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;
    renderCards("#shop-products", list);
    $("#empty-state").classList.toggle("hidden", list.length > 0);
    priceValue.textContent = money(price.value);
  }

  categoryFilters.addEventListener("change", e => {
    if (e.target.name === "category") {
      active = e.target.value;
      update();
    }
  });
  search.addEventListener("input", update);
  sort.addEventListener("change", update);
  price.addEventListener("input", update);
  $("#clear-filters").addEventListener("click", () => {
    active = "All";
    search.value = "";
    sort.value = "featured";
    price.value = 15000;
    categoryFilters.querySelector('input[value="All"]').checked = true;
    update();
  });
  update();
}

function details() {
  const id = new URLSearchParams(location.search).get("id");
  const p = findProduct(id);
  if (!p) {
    $("#product-detail").innerHTML = '<div class="empty-panel"><h2>Product not found</h2><a class="btn btn-dark" href="products.html">Back to shop</a></div>';
    return;
  }
  document.title = p.name + " | MotoHub";
  $("#product-detail").innerHTML = `<div class="detail-image"><img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/700x600/e9ede7/53604e?text=MotoHub+Gear'"></div><div class="detail-info"><span class="eyebrow">${p.category.toUpperCase()} / MOTOHUB EDIT</span><h1>${p.name}</h1><div class="product-rating"><span>★</span> ${p.rating} · ${p.reviews} reviews</div><div class="detail-price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div><p class="detail-description">${p.description}</p><strong style="font-size:12px">Select a size (where applicable)</strong><div class="detail-options" id="size-options"><button class="selected" type="button">Standard</button><button type="button">M</button><button type="button">L</button><button type="button">XL</button></div><div class="detail-actions"><button class="btn btn-dark" id="detail-add">Add to cart →</button><button class="btn" id="detail-wish" style="background:#edf1e8">♡ Save</button></div><div class="detail-meta"><span>✓ Demo product listing — check actual specifications before purchase</span><span>✓ Secure demo checkout</span><span>✓ Order saved in this browser</span></div></div>`;
  $("#size-options").addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      [...$("#size-options").children].forEach(b => b.classList.remove("selected"));
      e.target.classList.add("selected");
    }
  });
  $("#detail-add").addEventListener("click", () => addToCart(p.id));
  $("#detail-wish").addEventListener("click", () => {
    const w = toggleWish(p.id);
    $("#detail-wish").textContent = w.includes(p.id) ? "♥ Saved" : "♡ Save";
  });
  renderCards("#related-products", PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4));
}

function wishlistPage() {
  const grid = $("#wishlist-products");
  const empty = $("#wishlist-empty");

  function render() {
    const items = PRODUCTS.filter(p => wishlist().includes(p.id));
    renderCards("#wishlist-products", items);
    empty.classList.toggle("hidden", items.length > 0);
  }

  grid.addEventListener("click", e => {
    const w = e.target.closest("[data-wish]");
    if (w) setTimeout(render, 0);
  });

  render();
}

function cartPage() {
  const content = $("#cart-content");

  function render() {
    const items = cart();
    if (!items.length) {
      content.innerHTML = `<div class="empty-panel" style="grid-column:1/-1"><div class="empty-icon">⌑</div><h2>Your cart is taking a break</h2><p>Add something useful for your next ride.</p><a class="btn btn-dark" href="products.html">Browse gear</a></div>`;
      return;
    }
    const subtotal = items.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0);
    const shipping = subtotal >= 3000 ? 0 : 99;
    content.innerHTML = `<div class="cart-items">${items.map(i => {
      const p = findProduct(i.id);
      return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${p.category}</p><div class="qty-control"><button data-qty="${p.id}" data-change="-1">−</button><span>${i.qty}</span><button data-qty="${p.id}" data-change="1">+</button></div><button class="remove-btn" data-remove="${p.id}">Remove</button></div><strong class="price">${money(p.price * i.qty)}</strong></div>`;
    }).join("")}</div><aside class="summary-card"><h2>Order summary</h2><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${shipping ? money(shipping) : "FREE"}</strong></div><div class="summary-line"><span>Taxes</span><span>Included</span></div><div class="summary-line summary-total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div><a class="btn btn-dark" href="checkout.html">Continue to checkout →</a><p class="summary-note">${subtotal >= 3000 ? "You've unlocked free delivery." : "Free delivery on orders above ₹3,000."}</p></aside>`;
  }

  content.addEventListener("click", e => {
    const q = e.target.closest("[data-qty]");
    const r = e.target.closest("[data-remove]");
    let list = cart();
    if (q) {
      const item = list.find(i => i.id === Number(q.dataset.qty));
      if (!item) return;
      item.qty += Number(q.dataset.change);
      if (item.qty < 1) list = list.filter(i => i.id !== item.id);
      setStore("motohub_cart", list);
      updateCounts();
      render();
    }
    if (r) {
      setStore("motohub_cart", list.filter(i => i.id !== Number(r.dataset.remove)));
      updateCounts();
      render();
    }
  });

  render();
}

function checkout() {
  const items = cart();
  const target = $("#checkout-content");
  if (!items.length) {
    target.innerHTML = '<div class="empty-panel"><h2>Your cart is empty</h2><a class="btn btn-dark" href="products.html">Shop gear</a></div>';
    return;
  }
  const subtotal = items.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0),
    shipping = subtotal >= 3000 ? 0 : 99;
  target.innerHTML = `<div class="checkout-layout"><form id="checkout-form" class="form-card"><h2>Delivery details</h2><p class="muted">All fields marked by the browser are required.</p><div class="checkout-form"><label>Full name<input name="name" required minlength="2" placeholder="Your full name"></label><label>Email<input name="email" type="email" required placeholder="you@example.com"></label><label>Phone number<input name="phone" type="tel" required pattern="[0-9]{10}" placeholder="10-digit mobile number"></label><label>PIN code<input name="pin" required pattern="[0-9]{6}" placeholder="6-digit PIN code"></label><label class="full-field">Delivery address<textarea name="address" required minlength="10" placeholder="House number, street, area, city"></textarea></label><label class="full-field">Payment method<select name="payment"><option>Cash on Delivery (demo)</option><option>UPI (demo — no payment will be taken)</option></select></label><button class="btn btn-dark" type="submit">Place demo order →</button></div><p id="checkout-message" class="form-message"></p></form><aside class="summary-card"><h2>Your order</h2><div class="checkout-items">${items.map(i => `<div class="checkout-item"><span>${findProduct(i.id).name} × ${i.qty}</span><strong>${money(findProduct(i.id).price * i.qty)}</strong></div>`).join("")}</div><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${shipping ? money(shipping) : "FREE"}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div><p class="summary-note">This is a frontend demo. No real payment is processed.</p></aside></div>`;
  $("#checkout-form").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const orders = getStore("motohub_orders");
    orders.unshift({
      id: "MH" + Date.now().toString().slice(-8),
      date: new Date().toLocaleString("en-IN"),
      customer: data,
      items: items,
      total: subtotal + shipping,
      status: "Order placed"
    });
    setStore("motohub_orders", orders);
    setStore("motohub_cart", []);
    updateCounts();
    target.innerHTML = `<div class="empty-panel"><div class="empty-icon">✓</div><span class="eyebrow">ORDER CONFIRMED</span><h2>You're all set, ${data.name.split(" ")[0]}.</h2><p>Your demo order <strong>${orders[0].id}</strong> has been saved in this browser.</p><a class="btn btn-dark" href="orders.html">View my orders →</a> <a class="btn" href="../index.html">Back home</a></div>`;
  });
}

function ordersPage() {
  const orders = getStore("motohub_orders"), el = $("#orders-list");
  if (!orders.length) {
    el.innerHTML = '<div class="empty-panel"><div class="empty-icon">↗</div><h2>No orders yet</h2><p>Your placed demo orders will appear here.</p><a class="btn btn-dark" href="products.html">Start shopping</a></div>';
    return;
  }
  el.innerHTML = orders.map(o => `<article class="order-card"><div class="order-head"><div><strong>Order ${o.id}</strong><br><span class="muted">${o.date}</span></div><span class="order-status">${o.status}</span></div>${o.items.map(i => `<div class="order-product"><span>${findProduct(i.id)?.name || "Product"} × ${i.qty}</span><strong>${money((findProduct(i.id)?.price || 0) * i.qty)}</strong></div>`).join("")}<div class="order-total">Total: ${money(o.total)}</div></article>`).join("");
}

function auth() {
  const login = $("#login-form"), register = $("#register-form");
  if (login) login.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(login));
    const users = getStore("motohub_users");
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password);
    if (!user) {
      $("#auth-message").textContent = "We couldn't find an account with those details.";
      return;
    }
    setStore("motohub_user", { name: user.name, email: user.email });
    $("#auth-message").textContent = "Signed in successfully. Redirecting...";
    setTimeout(() => location.href = "orders.html", 700);
  });
  if (register) register.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(register));
    const users = getStore("motohub_users");
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      $("#auth-message").textContent = "An account with this email already exists.";
      return;
    }
    users.push(data);
    setStore("motohub_users", users);
    setStore("motohub_user", { name: data.name, email: data.email });
    $("#auth-message").textContent = "Account created. Redirecting...";
    setTimeout(() => location.href = "orders.html", 700);
  });
}

header();
footer();
({
  home,
  products: shop,
  details,
  wishlist: wishlistPage,
  cart: cartPage,
  checkout,
  orders: ordersPage,
  login: auth,
  register: auth
}[page] || (() => {}))();