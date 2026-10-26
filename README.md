# ShaadiVibe — Premium Digital Indian Wedding Invitation Platform

**ShaadiVibe** is a production-grade, multi-page Indian digital wedding invitation platform structured as a clean client/server monorepo using **npm workspaces**.

---

## 🏛️ Monorepo Architecture

```
shaadivibe/
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── app/                # App entry, router, providers
│   │   ├── components/         # Shared UI & layout components (Button, Card, Modal, Motifs)
│   │   ├── features/           # Modular domain features
│   │   │   ├── admin/          # Admin portal, theme management & CMS
│   │   │   ├── customization/  # 3-Step wedding customization wizard
│   │   │   ├── home/           # Homepage hero, features, testimonials, FAQs
│   │   │   ├── invitation/     # 3D Envelope, countdown, interactive cards, timeline
│   │   │   └── themes/         # Theme gallery & theme preview
│   │   ├── hooks/              # Custom hooks (useCountdown, useLenis)
│   │   ├── services/           # API client with configurable base URL
│   │   ├── store/              # Zustand customization store
│   │   ├── styles/             # Royal Indian CSS design tokens & ornaments
│   │   └── utils/              # Date formatting & schema validators
│   ├── index.html              # Frontend HTML entry
│   ├── package.json            # Frontend package manifest (@shaadivibe/client)
│   ├── vite.config.js          # Vite config with /api & /uploads proxy
│   ├── tailwind.config.js      # Royal Indian luxury color palette & typography
│   └── postcss.config.js
│
├── server/                     # Backend Service (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/             # Database connection & options
│   │   ├── controllers/        # Auth, themes, invitations, content, uploads
│   │   ├── middleware/         # Auth guard, rate limit, upload handler, error handling
│   │   ├── models/             # Mongoose models (User, Theme, Invitation, SiteContent)
│   │   ├── routes/             # REST API routes
│   │   ├── utils/              # Authoritative server-side validators & utilities
│   │   ├── constants/          # Backend seed & fallback data
│   │   ├── app.js              # Express app definition & middleware setup
│   │   └── server.js           # Server bootstrap & listen logic
│   ├── tests/                  # Integration and API test suites
│   ├── scripts/                # Database seeders (seedData.js)
│   ├── uploads/                # Dedicated user upload storage directory
│   ├── package.json            # Backend package manifest (@shaadivibe/server)
│   └── .env.example            # Backend environment variables template
│
├── DOCS/                       # Comprehensive Project Documentation
│   ├── ROADMAP.md              # 7-Phase Platform Master Vision
│   ├── PHASE_1_SPECIFICATION.md# Phase 1 Technical Specs & API Contracts
│   └── DESIGN_SYSTEM.md        # Royal Indian Wedding Design Tokens
│
├── package.json                # Root monorepo orchestration (npm workspaces)
├── package-lock.json           # Monorepo lockfile
├── .env.example                # Monorepo environment variables template
├── .gitignore                  # Git ignore rules for monorepo
└── README.md                   # Project documentation
```

---

## 🚀 Development Quickstart

### Prerequisites
- **Node.js**: v20+ recommended
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017/shaadivibe`

### Installation

From the monorepo root, install all dependencies across client and server:

```bash
npm install
```

### Running Locally

Run both frontend and backend concurrently with one command:

```bash
npm run dev
# Or explicitly:
npm run dev:all
```

Or run them individually:

```bash
# Run backend server (port 5000)
npm run dev:server

# Run frontend client (port 5173)
npm run dev:client
```

### Production Build & Test

```bash
# Build frontend bundle into client/dist/
npm run build

# Run both frontend Vitest and backend Node test suites
npm run test

# Run frontend tests only
npm run test:client

# Run backend API & IDOR security tests only
npm run test:server

# Seed development database with royal themes and demo invitation
npm run seed
```

---

## 🔑 Phase 2 Customer & Admin Routes

| Route | Role / Guard | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Homepage with hero, features, testimonials, FAQ |
| `/themes` | Public | Wedding theme gallery with filters & search |
| `/themes/:slug` | Public | Live theme preview experience |
| `/invite/:slug` | Public / Authorized | Live 3D envelope invitation renderer (published invites public, drafts private) |
| `/customize/:themeId` | Public / Customer | 3-Step customization wizard (Details -> Photos -> Live Preview) |
| `/customize/:themeId?edit=:id` | Customer / Admin | Resume editing an existing saved invitation draft |
| `/login` | Public (Guest) | Customer login with email & password |
| `/register` | Public (Guest) | Customer registration with validation (min 8 char password) |
| `/dashboard` | Customer Guard | Customer dashboard (manage drafts, publish, copy links, delete) |
| `/admin` | Public (Admin) | Admin login portal |
| `/admin/dashboard` | Admin Guard | Admin theme management and homepage CMS editor |

---

## 📡 Backend API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a customer account (hashes password via bcrypt, sets HTTP-only cookie, returns JWT).
- `POST /api/auth/login` — Authenticate customer or admin (sets HTTP-only cookie, returns JWT).
- `POST /api/auth/logout` — Clear session token cookie.
- `GET /api/auth/me` — Retrieve current authenticated session (protected).

### Invitations (`/api/invitations`)
- `GET /api/invitations` — List customer's invitations with draft/published filtering & pagination (protected).
- `GET /api/invitations/id/:id` — Retrieve invitation by internal ID with ownership check (protected).
- `GET /api/invitations/:slug` — Retrieve invitation by unique slug (published invitations are public; unpublished drafts are restricted to owner or admin).
- `POST /api/invitations` — Create or save invitation draft (associates with logged-in customer).
- `PUT /api/invitations/:id` — Update invitation draft (enforces owner/admin authorization).
- `PATCH /api/invitations/:id/publish` — Explicit action to publish invitation and generate public URL.
- `PATCH /api/invitations/:id/unpublish` — Revert published invitation back to private draft.
- `DELETE /api/invitations/:id` — Delete invitation draft (enforces owner/admin authorization).

### Themes & Content (`/api/themes`, `/api/content`)
- `GET /api/themes` — List active wedding themes.
- `GET /api/themes/:slug` — Fetch theme details.
- `POST /api/themes` — Create new theme (admin only).
- `PUT /api/themes/:id` — Update theme (admin only).
- `PATCH /api/themes/:id/publish` — Toggle theme publish status (admin only).
- `GET /api/content/:section` — Get CMS section content.
- `PUT /api/content/:section` — Update CMS section content (admin only).

### File Uploads (`/api/upload`)
- `POST /api/upload` — Upload up to 6 photos with format validation (JPEG, PNG, WebP) and 5MB size limit.

---

## 🔑 Default Credentials & Access

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Sample Live Invitation**: [http://localhost:5173/invite/priya-and-rohan](http://localhost:5173/invite/priya-and-rohan)
- **Customer Sign In**: [http://localhost:5173/login](http://localhost:5173/login)
- **Customer Registration**: [http://localhost:5173/register](http://localhost:5173/register)
- **Customer Dashboard**: [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)
  - **Email**: `admin@gmail.com`
  - **Password**: `@admin123`

#   s h a a d i v i b e  
 