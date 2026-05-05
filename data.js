// YANEX SHOP — Product Catalog
const WHATSAPP_NUMBER = "50940507232";

const CATEGORY_LABEL = {
  hair: "Hair & Wigs",
  fashion: "Fashion",
  accessories: "Accessories",
  sneakers: "Sneakers",
};

function normalizeCurrency(c) {
  return c === "HTG" ? "HTG" : "USD";
}

function formatPrice(amount, currency) {
  const cur = normalizeCurrency(currency);
  const n = Number(amount);
  if (!Number.isFinite(n)) return cur === "HTG" ? "0 Gdes" : "$0";
  if (cur === "HTG") {
    return `${Math.round(n).toLocaleString("fr-HT")} Gdes`;
  }
  const rounded = Math.round(n * 100) / 100;
  const text = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(2);
  return `$${text}`;
}

function formatPriceForMessage(price, currency) {
  const cur = normalizeCurrency(currency);
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (cur === "HTG") return `${Math.round(n).toLocaleString("fr-HT")} Gdes`;
  const rounded = Math.round(n * 100) / 100;
  const text = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(2);
  return `$${text} USD`;
}

function normalizeAvailability(value) {
  if (value === "past" || value === "future") return value;
  return "present";
}

function normalizeStock(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function availabilityLabelFr(value) {
  switch (normalizeAvailability(value)) {
    case "past":
      return "Passé";
    case "future":
      return "Futur";
    default:
      return "Présent";
  }
}

function stockLabelFr(stock) {
  const n = normalizeStock(stock);
  if (n === null) return "";
  if (n === 0) return "Épuisé (0)";
  return `${n} dispo`;
}

function productBadgesHtml(p) {
  const av = normalizeAvailability(p.availability);
  const bits = [];
  if (av === "past") bits.push('<span class="badge badge-past">Passé</span>');
  if (av === "future") bits.push('<span class="badge badge-future">À venir</span>');
  const stockText = stockLabelFr(p.stock);
  if (stockText) bits.push(`<span class="badge badge-stock">${stockText}</span>`);
  if (!bits.length) return "";
  return `<div class="product-badges">${bits.join("")}</div>`;
}

/*const BASE_PRODUCTS = [
  { slug:"wavy-glow-bundle", name:"Wavy Glow Bundle", tagline:"Silky 22\" body wave extensions", price:38, category:"hair",
    image:"assets/product-wig.jpg", altImage:"assets/style-preview.jpg",
    description:"Soft, lightweight 22-inch body wave bundle with a natural shine. Tangle-free, easy to style, and built for that effortless glow.",
    whyLove:["Silky body wave with zero tangle","Lightweight — wear it all day","Heat-friendly, easy to restyle"]},
  { slug:"midnight-curl-bob", name:"Midnight Curl Bob", tagline:"Lace front curly bob wig", price:40, category:"hair",
    image:"assets/product-wig2.jpg", altImage:"assets/style-preview.jpg",
    description:"A bold, playful curly bob in deep midnight black. Pre-styled lace front for a clean, natural hairline straight out of the box.",
    whyLove:["Pre-plucked natural hairline","Bouncy curls that hold their shape","Ready to wear in minutes"]},
  { slug:"soft-rib-midi", name:"Soft Rib Midi Dress", tagline:"Sculpting ribbed knit dress", price:32, category:"fashion", gender:"women",
    image:"assets/product-dress.jpg", altImage:"assets/lifestyle.jpg",
    description:"A second-skin ribbed midi that hugs every curve. Mock neck, side slit, and a clean silhouette that goes from brunch to date night.",
    whyLove:["Stretch knit that flatters every shape","Effortless dress-up or dress-down","One piece, endless looks"]},
  { slug:"gilt-tote", name:"The Gilt Tote", tagline:"Structured leather handbag", price:36, category:"accessories",
    image:"assets/product-bag.jpg", altImage:"assets/lifestyle.jpg",
    description:"A clean, structured tote with polished gold hardware. Big enough for daily essentials, refined enough for the office.",
    whyLove:["Premium vegan leather","Gold-finished turn-lock closure","Roomy interior with secure zip"]},
  { slug:"noir-shades", name:"Noir Shades", tagline:"Oversized cat-eye sunglasses", price:22, category:"accessories",
    image:"assets/product-sunglasses.jpg", altImage:"assets/lifestyle.jpg",
    description:"Oversized silhouette with a subtle gold accent. UV400 protection in a frame that elevates any outfit instantly.",
    whyLove:["Full UV400 sun protection","Lightweight, comfortable fit","Goes with literally everything"]},
  { slug:"trio-chain", name:"Trio Gold Chain", tagline:"Layered gold-plated necklace", price:24, category:"accessories",
    image:"assets/product-jewelry.jpg", altImage:"assets/lifestyle.jpg",
    description:"Three delicate gold-plated chains layered into one piece. Tarnish-resistant and designed to wear daily.",
    whyLove:["18k gold-plated, tarnish-resistant","Three layers, one easy clasp","Adjustable for the perfect drop"]},
  { slug:"ivory-glide-sneakers", name:"Ivory Glide Sneakers", tagline:"Premium low-top with gold accents", price:45, category:"sneakers",
    image:"assets/product-sneakers.jpg", altImage:"assets/product-sneakers2.jpg",
    description:"Clean ivory low-tops finished with subtle gold hardware. Cushioned sole for all-day comfort, refined enough for any look.",
    whyLove:["Soft cushioned insole — wear all day","Premium leather feel, gold accents","Pairs with denim, dresses, anything"]},
  { slug:"cream-stride-sneakers", name:"Cream Stride Sneakers", tagline:"Minimalist everyday white sneakers", price:38, category:"sneakers",
    image:"assets/product-sneakers2.jpg", altImage:"assets/product-sneakers.jpg",
    description:"A timeless minimalist white sneaker with a soft cream sole. Lightweight, breathable, and made to go everywhere with you.",
    whyLove:["Lightweight & breathable","Goes with every outfit","Built to last season after season"]},
  { slug:"linen-ease-shirt", name:"Linen Ease Shirt", tagline:"Relaxed cream linen button-up", price:42, category:"fashion", gender:"men",
    image:"assets/product-men-shirt.jpg", altImage:"assets/lifestyle.jpg",
    description:"An effortless cream linen shirt cut for a relaxed, refined fit. Breathable, weekend-ready, and easy to dress up.",
    whyLove:["Breathable premium linen","Tailored relaxed silhouette","Pairs with chinos or denim"]},
  { slug:"tailored-chinos", name:"Tailored Chinos", tagline:"Beige stretch tailored pants", price:38, category:"fashion", gender:"men",
    image:"assets/product-men-pants.jpg", altImage:"assets/lifestyle.jpg",
    description:"Clean tailored chinos in warm beige. Subtle stretch for all-day comfort, sharp enough for the office, easy enough for the weekend.",
    whyLove:["Stretch comfort weave","Sharp tailored leg","Goes from desk to dinner"]},
  { slug:"essential-noir-tee", name:"Essential Noir Tee", tagline:"Heavyweight black cotton tee", price:22, category:"fashion", gender:"men",
    image:"assets/product-men-tee.jpg", altImage:"assets/lifestyle.jpg",
    description:"The black tee, perfected. Heavyweight cotton, clean drop shoulder, and a fit that holds its shape wash after wash.",
    whyLove:["Heavyweight premium cotton","Holds its shape — no sag","Layer it or wear it solo"]},
];*/

const BASE_PRODUCTS = [];
const DEFAULT_FEATURED = ["wavy-glow-bundle", "soft-rib-midi", "linen-ease-shirt", "ivory-glide-sneakers"];
const PRODUCTS_STORAGE_KEY = "yanex_admin_products";

function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeReadAdminProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveAdminProducts(items) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
}

function getProducts() {
  const adminProducts = safeReadAdminProducts();
  const bySlug = new Map();
  [...BASE_PRODUCTS, ...adminProducts].forEach(product => {
    if (!product || !product.slug) return;
    bySlug.set(product.slug, {
      ...product,
      currency: normalizeCurrency(product.currency),
      availability: normalizeAvailability(product.availability),
      stock: normalizeStock(product.stock),
    });
  });
  return Array.from(bySlug.values());
}

function upsertAdminProduct(input) {
  const slug = normalizeSlug(input.slug || input.name);
  if (!slug) throw new Error("Le slug du produit est invalide.");
  if (!input.name || !input.category || !input.image) {
    throw new Error("Nom, categorie et image sont obligatoires.");
  }

  const product = {
    slug,
    name: String(input.name).trim(),
    tagline: String(input.tagline || "").trim(),
    price: Number(input.price) || 0,
    currency: normalizeCurrency(input.currency),
    category: String(input.category),
    gender: input.gender ? String(input.gender) : undefined,
    image: String(input.image).trim(),
    altImage: String(input.altImage || input.image).trim(),
    description: String(input.description || "").trim(),
    whyLove: Array.isArray(input.whyLove)
      ? input.whyLove.map(line => String(line).trim()).filter(Boolean).slice(0, 6)
      : [],
    availability: normalizeAvailability(input.availability),
    stock: normalizeStock(input.stock),
  };

  const current = safeReadAdminProducts();
  const next = current.filter(item => item.slug !== slug);
  next.push(product);
  saveAdminProducts(next);
  return product;
}

function deleteAdminProduct(slug) {
  const clean = normalizeSlug(slug);
  const current = safeReadAdminProducts();
  const next = current.filter(item => item.slug !== clean);
  saveAdminProducts(next);
}

const PRODUCTS = getProducts();

function getFeaturedSlugs() {
  try {
    const raw = localStorage.getItem("yanex_featured_list");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [...DEFAULT_FEATURED];
  } catch (e) {
    return [...DEFAULT_FEATURED];
  }
}

function saveFeaturedSlugs(slugs) {
  try {
    localStorage.setItem("yanex_featured_list", JSON.stringify(slugs));
  } catch (e) {
    console.error("Failed to save featured slugs", e);
  }
}

const FEATURED = getFeaturedSlugs();

function getInventorySummary() {
  const list = getProducts();
  const buckets = { past: [], present: [], future: [] };
  list.forEach(p => {
    buckets[normalizeAvailability(p.availability)].push(p);
  });
  function metrics(arr) {
    let unitsDeclared = 0;
    let withQuantity = 0;
    arr.forEach(p => {
      const n = normalizeStock(p.stock);
      if (n !== null) {
        withQuantity += 1;
        unitsDeclared += n;
      }
    });
    return { articles: arr.length, withQuantity, unitsDeclared };
  }
  return {
    past: metrics(buckets.past),
    present: metrics(buckets.present),
    future: metrics(buckets.future),
  };
}

function whatsappUrl(name, price, currency, meta) {
  const priceBit = name && price ? ` (${formatPriceForMessage(price, currency)})` : "";
  let tail = "";
  if (name && meta) {
    const n = normalizeStock(meta.stock);
    if (n !== null) tail += ` — ${n} en stock`;
    const av = normalizeAvailability(meta.availability);
    if (av === "future") tail += " — [Produit à venir]";
    if (av === "past") tail += " — [Collection passée]";
  }
  const msg = name
    ? `Hello Yanex Shop!  J'aimerais commander: *${name}*${priceBit}${tail}. Can you confirm availability and delivery?`
    : `Hello Yanex Shop! J'aimerais savoir plus d'informations sur vos produits.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
