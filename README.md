# ImmoCalc — Plateforme de simulation immobilière

## Stack technique
- **Next.js 14** (App Router + TypeScript)
- **Clerk** — authentification (email, Google, GitHub, MFA)
- **Stripe** — paiements et abonnements (avec période d'essai 14 jours)
- **Tailwind CSS** — styles
- **Vercel** — déploiement recommandé

---

## Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.local.example .env.local
```
Remplir les clés dans `.env.local` (voir section Configuration ci-dessous).

### 3. Lancer en développement
```bash
npm run dev
# → http://localhost:3000
```

---

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx                        # Layout racine (Clerk + fonts)
│   ├── globals.css                       # Styles globaux Tailwind
│   ├── page.tsx                          # Landing page publique
│   ├── auth-login/page.tsx               # Connexion via Clerk
│   │                                       ⚠️  Renommer en (auth)/login/
│   ├── dashboard/page.tsx                # Dashboard (protégé)
│   ├── tarifs/page.tsx                   # Page tarifs
│   ├── outils/
│   │   ├── calculateur-mensualite/       # Outil gratuit
│   │   ├── tableau-amortissement/        # Outil gratuit
│   │   └── rentabilite/page.tsx         # Outil Premium
│   └── api/
│       └── stripe/
│           ├── checkout/route.ts         # Création session paiement
│           └── webhook/route.ts          # Événements Stripe
├── components/
│   ├── calculateurs/                     # Composants React des outils
│   │   ├── CalculateurMensualite.tsx     # TODO: à créer
│   │   ├── TableauAmortissement.tsx      # TODO: à créer
│   │   └── CalculateurRentabilite.tsx    # TODO: à créer (Premium)
│   ├── ui/                               # Boutons, cards, badges...
│   └── layout/                           # Header, Footer, Nav
├── lib/
│   └── utils.ts                          # Calculs financiers + formatage
├── hooks/                                # Custom React hooks
└── middleware.ts                         # Protection des routes (Clerk)
```

---

## Configuration

### Clerk (authentification)
1. Créer un compte sur [clerk.com](https://clerk.com)
2. Créer une application
3. Copier les clés dans `.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Stripe (paiement)
1. Créer un compte sur [stripe.com](https://stripe.com)
2. Créer un produit "ImmoCalc Premium" avec un prix récurrent (9 €/mois)
3. Copier l'ID du prix (`price_...`) dans `.env.local`
4. Configurer le webhook (voir ci-dessous)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID_MONTHLY=price_...
```

**Webhook Stripe (en local) :**
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Écouter les événements et les forwarder en local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret affiché dans .env.local
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Webhook Stripe (en production) :**
Dashboard Stripe → Developers → Webhooks → Add endpoint
- URL : `https://tondomaine.com/api/stripe/webhook`
- Événements : `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

---

## Déploiement sur Vercel

```bash
# Option A — Via CLI
npm i -g vercel
vercel

# Option B — Via GitHub (recommandé)
# 1. Pusher le projet sur GitHub
# 2. Importer le repo sur vercel.com
# 3. Ajouter les variables d'environnement dans
#    Dashboard Vercel > Settings > Environment Variables
```

---

## Prochaines étapes (TODO)

### Court terme
- [ ] Renommer `auth-login/` → `(auth)/login/` (Route Group Next.js)
- [ ] Convertir les widgets HTML en composants React (`/components/calculateurs/`)
- [ ] Ajouter Supabase pour persister les simulations des utilisateurs
- [ ] Brancher la vérification Premium réelle (Supabase ou Clerk metadata)

### Moyen terme
- [ ] Export PDF des simulations (react-pdf ou Puppeteer)
- [ ] Comparateur de projets (côte à côte)
- [ ] Page "Mes simulations" avec historique
- [ ] Onboarding utilisateur (tour guidé)

### Long terme
- [ ] API publique pour intégrations tierces
- [ ] Mode collaboratif (partage de simulation par lien)
- [ ] Application mobile (React Native / Expo)

---

## Scripts disponibles

```bash
npm run dev      # Démarrage en développement (hot reload)
npm run build    # Build de production
npm run start    # Démarrage en production
npm run lint     # Vérification ESLint
```
