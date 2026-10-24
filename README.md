# ShaadiVibe — Premium Digital Indian Wedding Invitation Platform (Phase 1)

**ShaadiVibe** is a luxury, multi-page Indian digital wedding invitation web platform built with React, Vite, Tailwind CSS, Framer Motion, Express.js, and MongoDB.

---

## 🌟 Phase 1 Key Features

1. **Visual Identity & Royal Design System**:
   - Deep Burgundy (`#5C061D`), Warm Ivory (`#FAF7F2`), Antique Gold (`#D4AF37`), Deep Brown Typography (`#2A1810`).
   - Authentic Indian wedding motifs: Ganesh invocations, mandap arches, royal wax seals, kalash pots, and diya lamps.
   - Refined royal serif typography (`Cinzel`, `Playfair Display`, `Cormorant Garamond`) paired with modern readable body fonts (`Plus Jakarta Sans`, `Inter`).

2. **Public Homepage (`/`)**:
   - Responsive header with navigation links, admin portal link, and "Create Invite" CTA.
   - Hero section with headline, calls to action, trust indicators, and interactive invitation teaser mockup.
   - Feature highlights (3D envelope, multi-day itinerary, interactive cards, live countdown, 100% mobile ready, zero waste).
   - Trending theme collection with category filter tabs.
   - 3-step "How It Works" guide.
   - "Why Choose ShaadiVibe" cultural value proposition.
   - Clearly marked demo customer testimonials.
   - Royal CTA announcement banner.
   - Interactive FAQ accordion.
   - Heritage footer with policy and contact links.

3. **Theme Gallery (`/themes`) & Theme Preview (`/themes/:slug`)**:
   - Filterable theme grid by category (Royal, Traditional, Floral, Minimal, Modern, Destination).
   - Search bar, format filters, and sorting.
   - Favorite heart toggle.
   - Preview and direct customize actions.
   - Comprehensive detail page with cover showcase, included features checklist, and live sample launcher.

4. **Interactive Wedding Invitation Experience (`/invite/:slug`)**:
   - **Opening Sequence**: Velvet-finish closed envelope with gold foil border and antique gold monogram wax seal (`P & R`).
   - **Smooth 3D Unwrap Animation**: Wax seal dissolves, flap opens smoothly in 3D perspective, and gold-bordered letter card slides up.
   - **Staggered Reveals**: Bride & Groom names revealed letter-by-letter / word-by-word with floral divider.
   - **Live Countdown Timer**: Dynamic ticking countdown (Days, Hours, Minutes, Seconds) with graceful handling of ongoing/past celebrations.
   - **Three Interactive Decorative Cards**:
     1. *The Sacred Vows* (tap to open modal with vows)
     2. *Royal Dress Code & Etiquette* (tap to open modal with color palette guide)
     3. *Accommodations & Travel* (tap to open modal with palace stay details)
   - **Second Interactive Card**: Personalized "You Are Cordially Invited" proclamation letter with parents' note and Google Maps directions.
   - **Scroll-Animated Ceremony Timeline**: Multi-day itinerary (Haldi, Mehendi, Sangeet, Baraat, Pheras, Reception) with custom icons, timings, dates, and venues.
   - **Ambient Falling Petals**: Slow, subtle falling rose and marigold petals (non-blocking pointer-events, automatically disabled on `prefers-reduced-motion`).

5. **Customer Customization Wizard (`/customize/:themeId`)**:
   - Clean 3-step wizard (Details & Events -> Photos -> Final Preview; strictly NO music step).
   - Dynamic wedding ceremony itinerary editor (add, edit, remove ceremonies).
   - Multi-photo upload with format/size validation (max 5MB, up to 6 photos), preview thumbnails, and deletion.
   - Real-time interactive invitation preview with Save Draft and Publish & Share link generation.

6. **Admin Panel Foundation (`/admin`)**:
   - Secure JWT authentication (`admin@shaadivibe.com` / `Admin@123456`).
   - Theme management registry: create new themes, edit existing themes, toggle publish/unpublish.
   - Homepage content CMS: live editing of hero headlines, subheadings, CTAs, FAQs, and testimonials.

7. **Backend & Database Foundation**:
   - Express.js API with MongoDB / Mongoose ODM (`User`, `Theme`, `Invitation`, `SiteContent`).
   - Security middlewares: Helmet, CORS, rate limiting, and input validation.
   - Local disk storage abstraction for wedding photos with path traversal defense (`path.basename()`) and mimetype verification.
   - Automatic seeding of royal themes, admin user, and sample invitation (`priya-and-rohan`).

---

## 📁 Documentation

Detailed documentation is available in the [`DOCS/`](./DOCS) directory:
- [Platform Master Roadmap (`DOCS/ROADMAP.md`)](./DOCS/ROADMAP.md) — 7-phase platform vision from MVP to Automated Video Generation & Cloud Scale.
- [Phase 1 Specification (`DOCS/PHASE_1_SPECIFICATION.md`)](./DOCS/PHASE_1_SPECIFICATION.md) — Full technical specs, data models, API endpoints, and verification checklist.
- [Design System (`DOCS/DESIGN_SYSTEM.md`)](./DOCS/DESIGN_SYSTEM.md) — Color tokens, typography, ornaments, and envelope animation sequence.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/shaadivibe`)

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Run both Backend API and Frontend Vite simultaneously
npm run dev
```

Alternatively, run client and server independently:

```bash
# Run backend server (port 5000)
npm run dev:server

# Run frontend client (port 5173)
npm run dev:client
```

### Build & Test

```bash
# Production frontend bundle
npm run build

# Run unit and schema test suite
npm run test
```

### Default Credentials
- **Admin Email**: `admin@shaadivibe.com`
- **Admin Password**: `Admin@123456`
- **Sample Invitation URL**: `http://localhost:5173/invite/priya-and-rohan`
