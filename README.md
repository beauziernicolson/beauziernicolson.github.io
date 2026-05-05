# YANEX SHOP — Version statique HTML / CSS / JavaScript

Site cinématique, premium et 100% statique. Aucune dépendance, aucun build.

## Lancer le site
Ouvre simplement `index.html` dans ton navigateur, ou sers le dossier :
```
python3 -m http.server 8080
```

## Déploiement (hébergement)
Envoie **tout le contenu** de ce dossier (`index.html`, `css/`, `js/`, `assets/`, etc.) à la **racine** de ton site (`public_html`, `www`, `htdocs`…), pas dans un sous-dossier vide. Sinon le serveur affiche une liste de fichiers au lieu de la page d’accueil.

## Structure
```
yanex-shop-cinematic/
├── index.html          # Accueil cinématique (intro, hero parallax, catégories, story, trust, témoignages)
├── category.html       # Page catégorie (hair, fashion women/men, sneakers, accessories)
├── product.html        # Fiche produit (galerie + WhatsApp)
├── css/style.css       # Thème noir + or, animations, responsive
├── js/data.js          # Catalogue produits + numéro WhatsApp
├── js/app.js           # Animations, parallax, reveal scroll, rendu produits
└── assets/             # Images
```

## Personnaliser
- **Numéro WhatsApp** : `js/data.js` → `WHATSAPP_NUMBER = "509XXXXXXXX"`
- **Produits** : ajouter/modifier dans `PRODUCTS` (`js/data.js`)
- **Couleurs** : variables CSS dans `:root` de `css/style.css` (`--gold`, `--bg`...)

## Dashboard admin (sans backend)
- Ouvre `admin.html`
- Remplis le formulaire pour ajouter/modifier un produit
- Les produits sont sauvegardes dans le navigateur (`localStorage`)
- Ils apparaissent ensuite automatiquement sur `index.html`, `category.html` et `product.html`

## Effets cinématiques inclus
- Intro logo lettre par lettre
- Hero plein écran avec **Ken Burns** + grain + scroll cue animé
- Parallax sur la section Story
- Reveal au scroll (`IntersectionObserver`)
- Hover image-swap sur les fiches produits
- Header qui change au scroll
- Sous-menu Fashion (Women / Men)
- Bouton WhatsApp flottant pulsant

Made in Haiti 🇭🇹
