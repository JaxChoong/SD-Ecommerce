# EZShop - Administrative Portal & E-Commerce Ecosystem

EZShop is a modern clothing e-commerce web application featuring a guest checkout model for customers and a secure, authentication-bound Administrative Portal. This project is composed of a **Ruby on Rails** backend API and a **Vite + React + TypeScript** frontend.

---

## Technology Stack & Dependencies

### Backend (Ruby on Rails)

- **Ruby Version**: `3.4.7` (managed via `rbenv` or `rvm`)
- **Rails Version**: `~> 8.1.2`
- **Database**: PostgreSQL (requires local Postgres server running)
- **Gems of Note**:
  - `pg`: PostgreSQL adapter
  - `bcrypt`: Password hashing and authentication
  - `rack-cors`: Handling Cross-Origin Resource Sharing (CORS)
  - `puma`: High-performance HTTP server

### Frontend (Vite + React + TypeScript)

- **Node.js**: `v24.12.0` (or compatible `v18+` LTS)
- **Framework**: React `19.2`
- **Router**: React Router `7.6`
- **Styling**: Tailwind CSS `4.1` (with dynamic HSL dark mode support)
- **Icons**: Lucide React
- **Mock Service Worker (MSW)**: `v2.14` (used to mock customer-end checkout and orders database)

---

## Architectural Patterns Implemented

1. **Singleton Pattern**: Implemented in Ruby (`AdminSessionManager`) to govern active tokens. It guarantees that **only one** administrator session is active at any time. Logins automatically invalidate any prior tokens.
2. **Proxy Pattern**: A protective proxy class (`Admin::ServiceProxy`) wraps all core admin services (Inventory, Promotions). It intercepts API requests to validate active session credentials from the `AdminSessionManager` before hitting core operations.
3. **Autoloading (Zeitwerk)**: Follows strict Rails conventions where classes, models, and exceptions are organized in their own files for automatic resolution.

---

## Getting Started & Local Setup

### Prerequisite: Database Server

Make sure you have a local instance of PostgreSQL database server running on default port `5432` before starting the backend setup.

### 1. Backend API Server Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

1. **Install Dependencies**:

   ```bash
   bundle install
   ```

2. **Setup Database**:
   Create and migrate the PostgreSQL database:

   ```bash
   bundle exec rails db:create
   ```

   ```bash
   bundle exec rails db:migrate
   ```

3. **Start Rails Server**:
   Start the API server (will run on `http://localhost:3000`):
   ```bash
   bundle exec rails server
   ```

---

### 2. Frontend Vite Client Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

1. **Install Node Packages**:

   ```bash
   npm install
   ```

2. **Start Development Server**:
   Start the Vite dev server (will run on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

The Vite dev server is pre-configured to automatically proxy:

- `/api/admin/*` ➡️ `http://localhost:3000/admin/*`
- `/api/products/*` ➡️ `http://localhost:3000/products/*`
- `/uploads/*` ➡️ `http://localhost:3000/uploads/*`

---

## Default Administrator Credentials

The backend automatically seeds a default administrator account when you perform the first login attempt:

- **Username**: `admin`
- **Password**: `adminpassword`

Once logged in, the administrator has full CRUD permissions to manage the store catalog and campaign promotions. Normal visitors are automatically prevented from viewing administrative pages, and administrators are redirected away from customer-only pages.
