# AUDY COOK – Redesign

## Original problem statement
"je veux que tu me redesign ce site: https://audycook.com en plus plus joli"
- Style **Chaleureux & terroir** (warm, premium, modern but authentic)
- Site **multi-pages**
- **Panier + checkout** réels (Stripe + WhatsApp)
- **Bilingue FR/EN**
- Tech stack imposé : **NestJS** (backend) + **React + TypeScript + SCSS** (frontend)
- **Mini back-office admin** (login + CRUD produits, menu, blog)

## Architecture

### Backend — NestJS (port 8001)
- Modules: `auth` (JWT bcrypt), `products`, `menu`, `blog`, `checkout` (Stripe), `resellers`
- MongoDB via `@nestjs/mongoose`
- JWT Bearer auth, single seeded admin
- Validation pipe globale (class-validator)
- Routes sous `/api/*`
- Stripe via `stripe` SDK Node

### Frontend — React 19 + TypeScript + SCSS (port 3000)
- React Router multi-pages
- Context API : I18n, Cart (persist localStorage), Auth admin
- SCSS modules + design system `_design.scss` (variables, mixins)
- Fonts : Cormorant Garamond (display) + Outfit (body)
- Palette : Sand `#FAF8F5`, Spice `#A64036`, Moss `#2C4A3B`, Ochre `#D99C3D`, Cacao `#1F1A17`

## Pages
- `/` Home (hero éditorial, marquee, story, produits, menu sur fond moss, traiteur, blog)
- `/products` catalogue + filtres catégorie
- `/menu` menu traditionnel (commande WhatsApp)
- `/catering` service gastronomique
- `/resellers` points relais par pays (LU/BE/DE/CM/AE)
- `/blog` + `/blog/:slug`
- `/cart` panier détaillé + checkout Stripe + WhatsApp
- `/checkout/success?session_id=...` polling Stripe
- `/admin/login` + `/admin` (dashboard CRUD)

## What's been implemented (Jan 2026)
- ✅ Backend NestJS complet (auth, products, menu, blog, checkout, resellers, seed)
- ✅ Auth JWT admin (bcrypt, seed idempotent)
- ✅ CRUD admin products / menu / blog (protégés JWT)
- ✅ Frontend multi-pages bilingue FR/EN avec design éditorial terroir
- ✅ Panier persistent + drawer + checkout Stripe + WhatsApp
- ✅ Mini back-office admin avec modales d'édition
- ✅ Test backend 25/25 ✓ (`/app/test_reports/iteration_1.json`)

### Iteration 2 (Jan 2026)
- ✅ Page produit détaillée `/products/:slug` (galerie, sélecteur quantité, témoignages clients, produits liés)
- ✅ Composant FreeShipping : bandeau + barre de progression "Livraison offerte dès 50€"
- ✅ Intégration FreeShipping dans CartDrawer + page Cart
- ✅ ProductCard cliquable vers la page détail

### Iteration 3 (Jan 2026) — Programme de parrainage
- ✅ Backend : module `referrals` (schema unique code uppercase, validate, listAll, generateForCustomer, incrementUses)
- ✅ Endpoints: `POST /api/referrals/validate` (public), `POST /api/admin/referrals` + `GET /api/admin/referrals` (Bearer)
- ✅ Checkout: `referral_code` accepté → applique −10%, ligne Stripe consolidée, métadonnées tracées
- ✅ Auto-génération d'un code à la complétion du paiement (`AUDY-XXX-YYYY`)
- ✅ Frontend Cart: champ code parrainage + validation + ligne discount + total réduit
- ✅ Page CheckoutSuccess: affichage + bouton copier + bouton partage WhatsApp
- ✅ Admin tab "Parrainages" : liste codes + nb d'utilisations
- ✅ Test backend 39/39 ✓ (`/app/test_reports/iteration_3.json`)

### Iteration 4 (Jan 2026) — Logo officiel AUDY COOK
- ✅ Logo officiel intégré dans Header & Footer : **sceau circulaire** (silhouette à foulard wax + couronne végétale + lettrage audy/cook + tagline)
- ✅ Header : sceau circulaire en hauteur 78px, animation hover (scale 1.06 + tilt -2°)
- ✅ Footer : sceau grand format clamp(200-260px) sur fond cacao
- ✅ Favicon + apple-touch-icon utilisent le même sceau circulaire
- ✅ Title de la page : "AUDY COOK — Le Cameroun à portée de table"
- ✅ Meta description SEO optimisée
- Assets : `/app/frontend/public/brand/audycook-logo.png` (sceau circulaire — utilisé partout)
- Note : `audycook-logo-horizontal.png` est conservé dans le dossier brand pour usage futur (emails, factures, mobile compact, etc.)

## ⚠ Stripe note
`STRIPE_API_KEY=sk_test_emergent` est un placeholder Emergent qui ne fonctionne qu'avec la lib Python `emergentintegrations`. Comme on est en NestJS / SDK Stripe Node officiel, **pour activer le paiement par carte réel**, l'utilisateur doit fournir une vraie clé `sk_test_...` (depuis dashboard Stripe).
**WhatsApp checkout fonctionne dès maintenant**.

## Backlog / Future
- P1: vraie clé Stripe test à brancher
- P2: webhook Stripe `/api/webhook/stripe` + mise à jour transaction
- P2: filtre par tag dans la page Blog
- P2: SEO meta-tags par page (react-helmet)
- P2: upload d'images dans le back-office (au lieu d'URL)
- P2: galerie multi-images par produit (4-5 photos par produit)

## Test credentials
Voir `/app/memory/test_credentials.md`
