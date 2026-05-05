// YANEX SHOP — Cinematic interactions
document.addEventListener("DOMContentLoaded", () => {
  // ---- Intro loader ----
  const intro = document.querySelector(".intro");
  if (intro) {
    setTimeout(() => intro.classList.add("hide"), 1800);
    setTimeout(() => intro.remove(), 2800);
  }

  // ---- Header scroll state ----
  const header = document.querySelector(".header");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
    // Parallax
    document.querySelectorAll("[data-parallax]").forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * -0.4;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");
  if (menuBtn) menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));

  // ---- Reveal on scroll ----
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .reveal-stagger").forEach(el => io.observe(el));

  // ---- Render featured products ----
  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid) {
    featuredGrid.innerHTML = FEATURED.map(slug => {
      const p = PRODUCTS.find(x => x.slug === slug);
      return productCard(p);
    }).join("");
  }

  // ---- Category page ----
  const catGrid = document.getElementById("category-grid");
  if (catGrid) renderCategory();

  // ---- Product page ----
  const productPage = document.getElementById("product-page");
  if (productPage) renderProduct();
});

function productCard(p) {
  if (!p) return "";
  const url = `product.html?slug=${p.slug}`;
  return `
    <a class="product" href="${url}">
      <div class="product-img">
        <img class="main" src="${p.image}" alt="${p.name}" loading="lazy">
        <img class="alt" src="${p.altImage || p.image}" alt="" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <span class="tag">${p.tagline}</span>
        ${productBadgesHtml(p)}
        <div class="price"><strong>${formatPrice(p.price, p.currency)}</strong><span>View →</span></div>
        <button class="btn btn-primary add-to-cart-btn" data-slug="${p.slug}" onclick="event.preventDefault(); addToCart('${p.slug}')">Add to cart</button>
      </div>
    </a>`;
}

function addToCart(slug) {
  const product = PRODUCTS.find(p => p.slug === slug);
  if (product && cartManager) {
    cartManager.addItem(product);
  }
}

function renderCategory() {
  const params = new URLSearchParams(location.search);
  const cat = params.get("c") || "hair";
  const gender = params.get("g");
  const titleEl = document.getElementById("cat-title");
  const subEl = document.getElementById("cat-sub");
  const tabsEl = document.getElementById("gender-tabs");
  const grid = document.getElementById("category-grid");

  let label = CATEGORY_LABEL[cat] || "Collection";
  let items = PRODUCTS.filter(p => p.category === cat);

  if (cat === "fashion") {
    tabsEl.style.display = "inline-flex";
    const g = gender === "men" ? "men" : "women";
    items = items.filter(p => p.gender === g);
    label = g === "men" ? "Men's Fashion" : "Women's Fashion";
    tabsEl.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.g === g));
    tabsEl.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const u = new URL(location.href); u.searchParams.set("g", b.dataset.g); location.href = u.toString();
    }));
  } else {
    tabsEl.style.display = "none";
  }

  document.title = `${label} — YANEX SHOP`;
  titleEl.textContent = label;
  subEl.textContent = `${items.length} pieces curated with care.`;
  grid.innerHTML = items.map(productCard).join("") || `<p style="color:var(--muted);grid-column:1/-1;text-align:center">No items yet.</p>`;
}

function renderProduct() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const p = PRODUCTS.find(x => x.slug === slug);
  const root = document.getElementById("product-page");
  if (!p) { root.innerHTML = `<p style="text-align:center;padding:60px;color:var(--muted)">Product not found. <a href="index.html" style="color:var(--gold-2)">Back home</a></p>`; return; }

  document.title = `${p.name} — YANEX SHOP`;
  const images = [p.image, p.altImage].filter(Boolean);
  root.innerHTML = `
    <div class="product-gallery">
      <div class="gallery-main"><img id="main-img" src="${images[0]}" alt="${p.name}"></div>
      <div class="thumbs">
        ${images.map((src,i) => `<button class="${i===0?'active':''}" data-src="${src}"><img src="${src}" alt=""></button>`).join("")}
      </div>
    </div>
    <div class="product-detail reveal">
      <span class="eyebrow">${CATEGORY_LABEL[p.category]}</span>
      <h1>${p.name}</h1>
      <p class="tagline">${p.tagline}</p>
      <div class="big-price">${formatPrice(p.price, p.currency)}</div>
      ${productBadgesHtml(p)}
      <p class="desc">${p.description}</p>
      <div class="why">
        <h4>Why you'll love it</h4>
        <ul>${(p.whyLove || []).map(l => `<li>${l}</li>`).join("")}</ul>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="addToCart('${p.slug}')">Add to cart</button>
        <a class="btn btn-ghost" href="${whatsappUrl(p.name, p.price, p.currency, { stock: p.stock, availability: p.availability })}" target="_blank">Order on WhatsApp</a>
        <a class="btn btn-ghost" href="index.html#categories" onclick="closeCart('categories')">Continue shopping</a>
      </div>
      <div class="guarantees">
        <div><strong>Fast</strong>Delivery in Haiti</div>
        <div><strong>Secure</strong>Pay on delivery</div>
        <div><strong>Real</strong>Verified products</div>
      </div>
    </div>`;

  root.querySelectorAll(".thumbs button").forEach(btn => btn.addEventListener("click", () => {
    root.querySelectorAll(".thumbs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("main-img").src = btn.dataset.src;
  }));

  // trigger reveal
  setTimeout(() => root.querySelector(".product-detail").classList.add("in"), 80);
}
