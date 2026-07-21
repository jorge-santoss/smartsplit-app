# SmartSplit

Application complète de partage de dépenses ménagères. Suivez les dépenses partagées, répartissez les factures équitablement et réglez les dettes au sein de votre foyer.

## Stack Technique

**Frontend :** React 19, Vite, Tailwind CSS, React Router, TanStack Query, Axios

**Backend :** Node.js, Express 5, MySQL2, JWT (jsonwebtoken), PDFKit

**Base de données :** MySQL (InnoDB)

## Fonctionnalités

- **Authentification** — Inscription/connexion avec authentification JWT et hachage des mots de passe via bcrypt
- **Foyers** — Créer et gérer des foyers, inviter des membres avec des rôles propriétaire/membre
- **Dépenses** — Enregistrer des dépenses avec plusieurs modes de répartition : égal, montants exacts ou pourcentages
- **Catégories** — Organiser les dépenses par catégories personnalisées
- **Règlements** — Enregistrer et suivre les règlements de dettes entre membres
- **Soldes** — Calcul des soldes en temps réel entre les membres du foyer
- **Journal d'activité** — Suivre l'activité récente de vos foyers
- **Export PDF** — Exporter les rapports de dépenses du foyer en PDF
- **Paramètres** — Gestion du profil utilisateur

## Structure du Projet

```
smartsplit-app/
├── frontend/          # SPA React + Vite
│   └── src/
│       ├── api/           # Client API Axios
│       ├── components/    # Composants UI réutilisables
│       ├── context/       # Fournisseur de contexte d'authentification
│       ├── hooks/         # Hooks React personnalisés
│       ├── layouts/       # Mises en page
│       └── pages/         # Pages de routes
├── backend/           # API REST Express
│   └── src/
│       ├── config/        # Configuration BDD & environnement
│       ├── controllers/   # Gestionnaires de requêtes
│       ├── middleware/     # Middleware d'authentification et d'erreurs
│       ├── repositories/  # Requêtes de base de données
│       ├── routes/        # Définitions des routes API
│       ├── services/      # Logique métier
│       ├── utils/         # Utilitaires
│       └── validators/    # Validation des entrées
└── database/
    └── smartsplit.sql  # Fichier de schéma et de données initiales
```

## Pour Commencer

### Prérequis

- Node.js (v18+)
- MySQL (v8+)

### 1. Configuration de la Base de Données

```sql
CREATE DATABASE smartsplit_db;
```

Puis importez le schéma :

```bash
mysql -u root -p smartsplit_db < database/smartsplit.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Modifiez avec vos identifiants MySQL et votre secret JWT
npm install
npm run dev
```

L'API fonctionne sur `http://localhost:4000` par défaut.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application fonctionne sur `http://localhost:5173` par défaut.

### Variables d'Environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `4000` | Port du serveur backend |
| `DB_HOST` | `localhost` | Hôte MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_USER` | `root` | Utilisateur MySQL |
| `DB_PASSWORD` | -- | Mot de passe MySQL |
| `DB_NAME` | `smartsplit_db` | Nom de la base de données |
| `DB_POOL_LIMIT` | `10` | Taille du pool de connexions |
| `JWT_SECRET` | -- | Secret pour la signature JWT |
| `JWT_EXPIRES_IN` | `7d` | Durée d'expiration du token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origine(s) CORS autorisée(s) |

## Points de Terminaison API

| Méthode | Point de terminaison | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscrire un nouvel utilisateur |
| POST | `/api/auth/login` | Connexion |
| GET/POST | `/api/households` | Lister / créer des foyers |
| GET/PUT/DELETE | `/api/households/:id` | Obtenir / modifier / supprimer un foyer |
| POST | `/api/households/:id/members` | Ajouter un membre au foyer |
| DELETE | `/api/households/:id/members/:userId` | Retirer un membre |
| GET/POST | `/api/households/:id/expenses` | Lister / créer des dépenses |
| GET/PUT/DELETE | `/api/households/:id/expenses/:expenseId` | CRUD des dépenses |
| GET/POST | `/api/households/:id/settlements` | Lister / créer des règlements |
| GET | `/api/households/:id/balances` | Obtenir le résumé des soldes |
| GET/POST | `/api/households/:id/categories` | Lister / créer des catégories |
| GET | `/api/households/:id/export` | Exporter le rapport PDF |
| GET | `/api/activity` | Fil d'activité récente |
| GET | `/health` | Vérification de santé |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer avec rechargement à chaud (frontend & backend) |
| `npm run build` | Build de production (frontend) |
| `npm run lint` | Exécuter ESLint (frontend) |
| `npm start` | Démarrer le serveur de production (backend) |

## Licence

MIT
