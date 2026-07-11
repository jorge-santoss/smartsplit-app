# SmartSplit

A full-stack household expense splitting application. Track shared expenses, split bills fairly, and settle debts within your household.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, TanStack Query, Axios

**Backend:** Node.js, Express 5, MySQL2, JWT (jsonwebtoken), PDFKit

**Database:** MySQL (InnoDB)

## Features

- **Authentication** -- Register/login with JWT-based auth, bcrypt password hashing
- **Households** -- Create and manage households, invite members with owner/member roles
- **Expenses** -- Log expenses with multiple split types: equal, exact amounts, or percentages
- **Categories** -- Organize expenses by custom household categories
- **Settlements** -- Record and track debt settlements between members
- **Balances** -- Real-time balance calculations across household members
- **Activity Log** -- Track recent activity across your households
- **PDF Export** -- Export household expense reports as PDF
- **Settings** -- User profile management

## Project Structure

```
smartsplit-app/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── api/           # Axios API client
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth context provider
│       ├── hooks/         # Custom React hooks
│       ├── layouts/       # Page layouts
│       └── pages/         # Route pages
├── backend/           # Express REST API
│   └── src/
│       ├── config/        # DB & env configuration
│       ├── controllers/   # Request handlers
│       ├── middleware/     # Auth & error middleware
│       ├── repositories/  # Database queries
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic
│       ├── utils/         # Helpers
│       └── validators/    # Input validation
└── database/
    └── smartsplit.sql  # Schema & seed file
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)

### 1. Database Setup

```sql
CREATE DATABASE smartsplit_db;
```

Then import the schema:

```bash
mysql -u root -p smartsplit_db < database/smartsplit.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Edit with your MySQL credentials and JWT secret
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Backend server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | -- | MySQL password |
| `DB_NAME` | `smartsplit_db` | Database name |
| `DB_POOL_LIMIT` | `10` | Connection pool size |
| `JWT_SECRET` | -- | Secret for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin(s) |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/POST | `/api/households` | List / create households |
| GET/PUT/DELETE | `/api/households/:id` | Get / update / delete household |
| POST | `/api/households/:id/members` | Add member to household |
| DELETE | `/api/households/:id/members/:userId` | Remove member |
| GET/POST | `/api/households/:id/expenses` | List / create expenses |
| GET/PUT/DELETE | `/api/households/:id/expenses/:expenseId` | Expense CRUD |
| GET/POST | `/api/households/:id/settlements` | List / create settlements |
| GET | `/api/households/:id/balances` | Get balance summary |
| GET/POST | `/api/households/:id/categories` | List / create categories |
| GET | `/api/households/:id/export` | Export PDF report |
| GET | `/api/activity` | Recent activity feed |
| GET | `/health` | Health check |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (both frontend & backend) |
| `npm run build` | Production build (frontend) |
| `npm run lint` | Run ESLint (frontend) |
| `npm start` | Start production server (backend) |

## License

MIT
