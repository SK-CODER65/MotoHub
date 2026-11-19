# MotoHub — Motorcycle Gear E-commerce Demo

A responsive, multi-page e-commerce frontend made with **HTML5, CSS3 and vanilla JavaScript only**.

## Run the project
1. Extract the `MotoHub` folder.
2. Open `index.html` in your browser, or open the folder in VS Code and use the Live Server extension.
3. No build tools, package installation, framework or backend is required.

## Pages
- `index.html` — homepage and featured products
- `pages/products.html` — catalogue, search, category/price filters and sorting
- `pages/product-details.html` — product details, size selector, add-to-cart and wishlist
- `pages/wishlist.html` — saved products
- `pages/cart.html` — quantities, removal, subtotal and delivery calculation
- `pages/checkout.html` — validated delivery form and demo order confirmation
- `pages/login.html` / `pages/register.html` — demo account flow
- `pages/orders.html` — order history

## Folder structure
```text
MotoHub/
├── index.html
├── pages/
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── products.js
├── images/
│   ├── banners/
│   ├── icons/
│   └── products/
└── README.md
```

## Functionality
- Product search, category and maximum-price filters, sorting
- Product detail view with a simple option selector
- Wishlist and cart saved with `localStorage`
- Quantity updates, item removal and free-delivery threshold
- Checkout form validation and locally stored demo orders
- Demo registration and sign-in stored in the current browser
- Responsive navigation and layouts

## Important limitations
This is a **frontend-only student project**. It does not connect to a real inventory, server, payment gateway, email service or shipping provider. Checkout options are simulations and no money is collected. Demo account passwords are stored in browser localStorage and are **not secure**; do not use real passwords or personal information. Product photography is loaded from Unsplash over the internet; an internet connection is needed for those images. The product listings are sample content, not verified safety certifications or purchase recommendations.

## Customising products
Edit the `PRODUCTS` array in `js/products.js`. Each item has an `id`, `name`, `category`, `price`, `oldPrice`, `rating`, `reviews`, `tag`, `image` and `description`.

## Suggested demo flow
Homepage → Shop → Search/filter → Product details → Wishlist → Add to cart → Change quantity → Checkout → Order confirmation → Order history.
