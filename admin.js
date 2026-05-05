const ADMIN_PASSWORD = "181818";
const ADMIN_AUTH_KEY = "yanex_shop_admin_authenticated";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function eventClickElement(event) {
  const n = event.target;
  if (n && n.nodeType === 1) return n;
  if (n && n.parentElement) return n.parentElement;
  return null;
}

// ============================================
// FEATURED PRODUCTS MANAGEMENT
// ============================================

function getFeaturedFromStorage() {
  return getFeaturedSlugs();
}

function saveFeaturedToStorage(slugList) {
  saveFeaturedSlugs(slugList);
}

function renderFeaturedPreview() {
  const preview = document.getElementById("featured-preview-grid");
  if (!preview) return;
  const featured = getFeaturedFromStorage();
  const products = getProducts();
  preview.innerHTML = featured
    .map((slug) => {
      const p = products.find((x) => x.slug === slug);
      if (!p) return "";
      return `
      <article class="product">
        <div class="product-img"><img class="main" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"></div>
        <div class="product-info">
          <h3>${escapeHtml(p.name)}</h3>
          <span class="tag">${escapeHtml(p.tagline || "")}</span>
          ${productBadgesHtml(p)}
          <div class="price"><strong>${formatPrice(p.price, p.currency)}</strong><span>${escapeHtml(p.category)}</span></div>
        </div>
      </article>`;
    })
    .join("");
}

const YFeatured = {
  slugs: [],

  refresh() {
    this.slugs = getFeaturedFromStorage();
    this.render();
    renderFeaturedPreview();
  },

  render() {
    const ol = document.getElementById("featured-order-list");
    const addSelect = document.getElementById("featured-add-select");
    if (!ol || !addSelect) return;

    const products = getProducts();
    ol.innerHTML = this.slugs
      .map((slug, i) => {
        const p = products.find((x) => x.slug === slug);
        const title = p ? escapeHtml(p.name) : `${escapeHtml(slug)} <span style="color:#ff8b8b">(introuvable)</span>`;
        const upDis = i === 0 ? " disabled" : "";
        const downDis = i === this.slugs.length - 1 ? " disabled" : "";
        return `<li>
            <span class="featured-slug-title">${title}</span>
            <span class="featured-slug-code">${escapeHtml(slug)}</span>
            <span class="btn-row">
              <button type="button" class="btn btn-ghost" style="padding:6px 10px;font-size:12px" data-feat="up" data-i="${i}"${upDis}>Monter</button>
              <button type="button" class="btn btn-ghost" style="padding:6px 10px;font-size:12px" data-feat="down" data-i="${i}"${downDis}>Descendre</button>
              <button type="button" class="btn btn-ghost" style="padding:6px 10px;font-size:12px" data-feat="remove" data-i="${i}">Retirer</button>
            </span>
          </li>`;
      })
      .join("");

    const inList = new Set(this.slugs);
    const rest = products.filter((p) => !inList.has(p.slug));
    addSelect.innerHTML =
      '<option value="">Choisir un produit à ajouter…</option>' +
      rest.map((p) => `<option value="${escapeHtml(p.slug)}">${escapeHtml(p.name)}</option>`).join("");
  },

  setMsg(text, isError) {
    const featMsg = document.getElementById("featured-editor-msg");
    if (!featMsg) return;
    featMsg.textContent = text;
    featMsg.style.color = isError ? "#ff8b8b" : "var(--muted)";
  },

  onEditorClick(event) {
    const btn = event.target.closest("button");
    if (!btn) return;
    const addSelect = document.getElementById("featured-add-select");
    const action = btn.getAttribute("data-feat");

    if (btn.id === "featured-add-btn") {
      event.preventDefault();
      const value = addSelect && addSelect.value;
      if (!value || this.slugs.includes(value)) {
        this.setMsg("Sélectionne un produit disponible avant d'ajouter.", true);
        return;
      }
      this.slugs.push(value);
      saveFeaturedToStorage(this.slugs);
      this.render();
      renderFeaturedPreview();
      this.setMsg("Produit ajouté et enregistré.", false);
      return;
    }

    if (btn.id === "featured-save-btn") {
      event.preventDefault();
      saveFeaturedToStorage(this.slugs);
      this.setMsg("Sélection enregistrée. Recharge la page d'accueil pour voir les changements.", false);
      return;
    }

    if (btn.id === "featured-reset-btn") {
      event.preventDefault();
      this.slugs = [];
      saveFeaturedToStorage([]);
      this.render();
      renderFeaturedPreview();
      this.setMsg("Sélection vidée.", false);
      return;
    }

    if (!action) return;
    event.preventDefault();
    const index = parseInt(btn.getAttribute("data-i"), 10);
    if (!Number.isFinite(index) || index < 0) return;

    if (action === "remove") {
      this.slugs.splice(index, 1);
    } else if (action === "up" && index > 0) {
      [this.slugs[index - 1], this.slugs[index]] = [this.slugs[index], this.slugs[index - 1]];
    } else if (action === "down" && index < this.slugs.length - 1) {
      [this.slugs[index + 1], this.slugs[index]] = [this.slugs[index], this.slugs[index + 1]];
    }

    saveFeaturedToStorage(this.slugs);
    this.render();
    renderFeaturedPreview();
  },

  init() {
    const box = document.getElementById("featured-editor");
    if (!box) return;
    this.refresh();
    box.addEventListener("click", (event) => this.onEditorClick(event));
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("admin-gate");
  const panel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("admin-login-form");
  const loginError = document.getElementById("admin-login-error");

  function isAuthed() {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "1";
  }

  function showPanel() {
    if (gate) gate.hidden = true;
    if (panel) panel.hidden = false;
    initAdminDashboard();
  }

  function showGate() {
    if (gate) gate.hidden = false;
    if (panel) panel.hidden = true;
  }

  if (isAuthed()) {
    showPanel();
    return;
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginError.textContent = "";
    const password = new FormData(loginForm).get("password");
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
      showPanel();
    } else {
      loginError.textContent = "Mot de passe incorrect.";
    }
  });
});

function initAdminDashboard() {
  const form = document.getElementById("product-form");
  const msg = document.getElementById("admin-msg");
  const list = document.getElementById("admin-list");
  const statsEl = document.getElementById("admin-inventory-stats");
  const resetBtn = document.getElementById("reset-form");
  const logoutBtn = document.getElementById("admin-logout");

  if (!form || !msg || !list || !resetBtn) return;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      location.reload();
    });
  }

  function setMessage(text, isError) {
    msg.textContent = text;
    msg.style.color = isError ? "#ff8b8b" : "var(--muted)";
  }

  function readAdminOnlyProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function renderInventoryStats() {
    if (!statsEl || typeof getInventorySummary !== "function") return;
    const s = getInventorySummary();
    const row = (label, key) => {
      const m = s[key];
      const stockHint =
        m.withQuantity > 0
          ? `${m.unitsDeclared} unité(s) déclarée(s) sur ${m.withQuantity} article(s)`
          : "Aucune quantité saisie";
      return `<div class="admin-stats-card"><strong>${label}</strong><span class="admin-stats-count">${m.articles} article(s)</span><small>${stockHint}</small></div>`;
    };
    statsEl.innerHTML = `<p class="admin-stats-title">Inventaire par période (tout le catalogue)</p><div class="admin-stats-grid">${row("Passé", "past")}${row("Présent", "present")}${row("Futur", "future")}</div>`;
  }

  function renderAdminList() {
    const items = readAdminOnlyProducts();
    if (!items.length) {
      list.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;text-align:center">Aucun produit ajoute pour le moment.</p>';
      renderInventoryStats();
      return;
    }

    list.innerHTML = items.map((p) => {
      const av = availabilityLabelFr(p.availability);
      const st = stockLabelFr(p.stock) || "Stock non indiqué";
      return `
      <article class="product" data-slug="${p.slug}">
        <div class="product-img"><img class="main" src="${p.image}" alt="${p.name}"></div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <span class="tag">${p.tagline || "-"} · ${av} · ${st}</span>
          <div class="price"><strong>${formatPrice(p.price || 0, p.currency)}</strong><span>${p.category}</span></div>
          <div class="btn-row" style="margin-top:10px">
            <button class="btn btn-ghost" type="button" data-action="edit">Modifier</button>
            <button class="btn btn-ghost" type="button" data-action="delete">Supprimer</button>
          </div>
        </div>
      </article>`;
    }).join("");
    renderInventoryStats();
  }

  function fillForm(product) {
    form.name.value = product.name || "";
    form.slug.value = product.slug || "";
    form.tagline.value = product.tagline || "";
    form.price.value = Number.isFinite(Number(product.price)) ? Number(product.price) : "";
    form.currency.value = product.currency === "HTG" ? "HTG" : "USD";
    form.stock.value =
      product.stock === null || product.stock === undefined || product.stock === ""
        ? ""
        : String(product.stock);
    form.availability.value = normalizeAvailability(product.availability);
    form.category.value = product.category || "";
    form.gender.value = product.gender || "";
    form.image.value = product.image || "";
    form.altImage.value = product.altImage || "";
    form.description.value = product.description || "";
    form.whyLove.value = (product.whyLove || []).join("\n");
    if (form.featured) {
      const featured = getFeaturedFromStorage();
      form.featured.checked = featured.includes(product.slug);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);

    try {
      const saved = upsertAdminProduct({
        name: data.get("name"),
        slug: data.get("slug"),
        tagline: data.get("tagline"),
        price: data.get("price"),
        currency: data.get("currency"),
        stock: data.get("stock"),
        availability: data.get("availability"),
        category: data.get("category"),
        gender: data.get("gender"),
        image: data.get("image"),
        altImage: data.get("altImage"),
        description: data.get("description"),
        whyLove: String(data.get("whyLove") || "").split("\n"),
      });
      
      const slug = saved.slug;
      const wantFeatured = data.has("featured");
      const featured = getFeaturedFromStorage();
      
      if (wantFeatured) {
        if (!featured.includes(slug)) {
          featured.push(slug);
          saveFeaturedToStorage(featured);
        }
      } else {
        const idx = featured.indexOf(slug);
        if (idx !== -1) {
          featured.splice(idx, 1);
          saveFeaturedToStorage(featured);
        }
      }
      
      YFeatured.refresh();
      setMessage(`Produit enregistre: ${saved.name}. Recharge les pages boutique pour voir la mise a jour.`, false);
      renderAdminList();
      form.reset();
    } catch (error) {
      setMessage(error.message || "Erreur lors de l'enregistrement du produit.", true);
    }
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    setMessage("Formulaire vide.", false);
  });

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || !target.dataset.action) return;
    const card = target.closest("[data-slug]");
    if (!card) return;
    const slug = card.dataset.slug;

    if (target.dataset.action === "delete") {
      deleteAdminProduct(slug);
      setMessage(`Produit supprime: ${slug}`, false);
      renderAdminList();
      if (typeof window.refreshFeaturedEditor === "function") window.refreshFeaturedEditor();
      return;
    }

    if (target.dataset.action === "edit") {
      const items = readAdminOnlyProducts();
      const product = items.find((p) => p.slug === slug);
      if (!product) return;
      fillForm(product);
      setMessage(`Mode edition: ${product.name}`, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  renderAdminList();
  YFeatured.init();
}
