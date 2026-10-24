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
│   │   ├── app.js              # Express app definition & middleware setup
│   │   └── server.js           # Server bootstrap & listen logic
│   ├── scripts/                # Database seeders (seedData.js)
│   ├── uploads/                # Dedicated user upload storage directory
│   ├── package.json            # Backend package manifest (@shaadivibe/server)
│   └── .env.example            # Backend environment variables template
│
├── shared/                     # Shared Contracts & Constants
│   ├── constants/              # Shared themes, invitations & CMS mock data
│   └── schemas/                # Shared Zod validation schemas
│
├── DOCS/                       # Comprehensive Project Documentation
│   ├── ROADMAP.md              # 7-Phase Platform Master Vision
│   ├── PHASE_1_SPECIFICATION.md# Phase 1 Technical Specs & API Contracts
│   └── DESIGN_SYSTEM.md        # Royal Indian Wedding Design Tokens
│
├── package.json                # Root monorepo orchestration (npm workspaces)
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

# Run unit and schema test suite
npm run test

# Seed development database with royal themes and demo invitation
npm run seed
```

---

## 🔑 Access & Credentials

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Sample Live Invitation**: [http://localhost:5173/invite/priya-and-rohan](http://localhost:5173/invite/priya-and-rohan)
- **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)
  - **Email**: `admin@shaadivibe.com`
  - **Password**: `Admin@123456`
