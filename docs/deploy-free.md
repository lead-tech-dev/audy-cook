# Deploy gratuit temporaire

## Cible retenue

- Frontend: Cloudflare Pages
- Backend API: Render Free Web Service
- Base PostgreSQL: Supabase Free
- CI/CD: GitHub Actions

Ce choix évite d'utiliser la base Postgres gratuite de Render pour ce projet. Elle expire après 30 jours, donc elle n'est pas adaptée même pour une pré-prod un peu stable.

## Ce qui est déjà prêt dans le repo

- Workflow GitHub Actions: `.github/workflows/ci-cd.yml`
- Blueprint Render backend: `render.yaml`
- Healthcheck backend: `GET /api/health`
- Frontend SPA compatible Pages: `frontend/public/_redirects`

## Secrets GitHub à créer

### Déploiement backend

- `RENDER_DEPLOY_HOOK_URL`: URL du deploy hook Render

### Déploiement frontend

- `CLOUDFLARE_API_TOKEN`: token Pages avec permission `Account / Cloudflare Pages / Edit`
- `CLOUDFLARE_ACCOUNT_ID`: identifiant de compte Cloudflare
- `CLOUDFLARE_PAGES_PROJECT_NAME`: nom du projet Pages
- `PUBLIC_BACKEND_URL`: URL publique du backend Render, par exemple `https://audy-cook-backend.onrender.com`

## Variables Render à définir

Le fichier `render.yaml` crée le service, mais les secrets restent manuels:

- `DATABASE_URL`: URL PostgreSQL Supabase
- `DATABASE_SSL=true`
- `CORS_ORIGINS`: URL Cloudflare Pages de prod, par exemple `https://audy-cook.pages.dev`
- `FRONTEND_URL`: même URL frontend
- `BACKEND_PUBLIC_URL`: URL publique Render
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `STRIPE_API_KEY`
- `RESEND_API_KEY`

## Mise en place

### 1. Base de données Supabase

Crée un projet Postgres gratuit, puis récupère la chaîne de connexion.

Conseil:

- utilise l'URI `postgresql://...`
- garde `DATABASE_SSL=true` côté Render

### 2. Backend Render

Dans Render:

1. Crée un nouveau Blueprint depuis ce repo.
2. Vérifie que `render.yaml` pointe bien vers `backend/Dockerfile`.
3. Renseigne toutes les variables ci-dessus.
4. Lance le premier déploiement.
5. Récupère ensuite:
   - l'URL publique du service
   - le `Deploy Hook`

Ensuite:

- ajoute l'URL du service dans `PUBLIC_BACKEND_URL`
- ajoute le hook dans `RENDER_DEPLOY_HOOK_URL`

### 3. Frontend Cloudflare Pages

Dans Cloudflare Pages:

1. Crée un projet Pages en mode Direct Upload.
2. Garde le nom exact du projet.
3. Génère un token API Pages.
4. Ajoute les secrets GitHub Cloudflare.

Le workflow buildera le frontend avec `PUBLIC_BACKEND_URL`, puis publiera le dossier `frontend/build`.

## Fonctionnement du pipeline

### Pull request

- build frontend
- build backend via Docker Compose
- démarre Postgres + backend
- attend `GET /api/health`
- exécute `pytest backend/tests -q`

### Push sur `main`

- exécute la même CI
- si la CI passe:
  - déclenche le deploy backend sur Render
  - rebuild le frontend avec l'URL backend publique
  - publie sur Cloudflare Pages

## Limites connues du mode gratuit

- Render Free met le backend en veille après 15 minutes d'inactivité.
- Le redémarrage Render prend environ une minute.
- Le filesystem local Render est éphémère: `uploads/` n'est pas persistant.
- Supabase Free peut mettre en pause un projet inactif.
- TypeORM est encore en `synchronize: true`; c'est tolérable pour cette phase, pas pour une prod sérieuse.

## Étape suivante recommandée

Quand tu voudras fiabiliser:

1. migrer les uploads vers un stockage objet
2. passer de `synchronize: true` à des migrations
3. sortir du backend free tier pour éviter les cold starts
