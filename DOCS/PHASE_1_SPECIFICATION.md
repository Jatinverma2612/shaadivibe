# ShaadiVibe — Phase 1 Technical Specification & Implementation Plan

## 1. Executive Summary & Objectives

Phase 1 establishes the production foundation of **ShaadiVibe**: a luxury, component-driven Indian digital wedding invitation web platform. 

The primary objective of Phase 1 is to provide:
1. An exquisite, royal-themed visual identity celebrating Indian weddings (Burgundy, Warm Ivory, Antique Gold, Deep Brown).
2. A responsive, dynamic public website (`/`, `/themes`, `/themes/:slug`).
3. An interactive, 3D animated invitation renderer (`/invite/:slug`) featuring:
   - Interactive closed royal envelope with gold wax seal.
   - Smooth unwrap animation revealing the personalized invitation letter.
   - Staggered typography reveals for the Bride & Groom names.
   - 3 interactive decorative cards with reveal modals/drawers (Sacred Vows, Royal Dress Code, Venue & Accommodations).
   - Real-time countdown timer to the auspicious wedding hour.
   - "You Are Invited" personalized message card.
   - Scroll-triggered animated wedding itinerary timeline (Haldi, Mehendi, Sangeet, Baraat, Pheras, Reception).
   - Non-blocking falling flower petals with `prefers-reduced-motion` support.
4. A 3-step customer customization wizard (`/customize/:themeId`) for details, events, and photos (with preview, and strictly NO music step).
5. A modular Express.js backend with MongoDB/Mongoose (User, Theme, Invitation, SiteContent models) and photo upload abstraction.
6. A secure administrative portal (`/admin`) to manage themes and homepage content.

---

## 2. Phase 1 Boundaries & Explicit Exclusions

To maintain laser focus on quality, aesthetics, and reliability, the following features are **strictly out of scope for Phase 1**:
- ❌ Audio players, background music, Shehnai audio, sound effects, or music upload.
- ❌ Music step in the customization wizard (Wizard has only 3 steps: Details, Photos, Preview).
- ❌ Payment gateway integration (Razorpay, Stripe, live payment forms).
- ❌ Discount coupon management.
- ❌ Automated video invitation generation or MP4 rendering.
- ❌ Paid subscription management.
- ❌ Production email delivery or SMS dispatch.
- ❌ Complex visitor analytics.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS + Custom Royal Indian CSS Theme Tokens
- **Routing**: React Router DOM (v6+)
- **Animation**: Motion for React (`motion` / `framer-motion`)
- **Smooth Scroll**: Lenis (scoped and safely cleaned up)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **Server State**: TanStack Query (v5)
- **Date Handling**: date-fns
- **Client State**: Zustand (for wizard and preview state)

### Backend
- **Runtime**: Node.js (v20+)
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Middlewares**: Helmet, CORS, express-rate-limit, express-validator / Zod
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **File Upload**: Multer with disk storage abstraction and mime-type verification

---

## 4. Design System Tokens & Aesthetics

| Token Name | Hex Code | Purpose |
|---|---|---|
| `royal-maroon-dark` | `#420412` | Dark background accents, deep borders, envelope interior |
| `royal-maroon` | `#5C061D` | Primary brand color, headers, primary buttons, envelope exterior |
| `royal-maroon-light`| `#7E162D` | Hover states, card highlights |
| `antique-gold` | `#D4AF37` | Ornate borders, gold foil accents, badges, wax seal |
| `antique-gold-light`| `#F3E5AB` | Subtle gold gradients, shimmer effects |
| `antique-gold-dark` | `#997A15` | Dark gold borders, contrast text on light gold |
| `ivory-cream` | `#FAF7F2` | Primary page background, invitation paper texture |
| `ivory-light` | `#FFFDF9` | Card surfaces, modal surfaces |
| `deep-brown` | `#2A1810` | Primary readable typography, headings |
| `warm-stone` | `#63534B` | Subheadings, secondary body text, meta details |

### Typography
- **Headings**: `Cinzel`, `Cormorant Garamond`, `Playfair Display` (Classic Indian royal serif aesthetic).
- **Body**: `Plus Jakarta Sans`, `Inter` (High legibility on mobile and desktop).

---

## 5. Architectural Directory Structure

```
shaadivibe/
├── DOCS/
│   ├── ROADMAP.md
│   ├── PHASE_1_SPECIFICATION.md
│   └── DESIGN_SYSTEM.md
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contentController.js
│   │   ├── invitationController.js
│   │   ├── themeController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Invitation.js
│   │   ├── SiteContent.js
│   │   ├── Theme.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contentRoutes.js
│   │   ├── invitationRoutes.js
│   │   ├── themeRoutes.js
│   │   └── uploadRoutes.js
│   ├── seed/
│   │   └── seedData.js
│   └── index.js
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── main.jsx
│   ├── assets/
│   │   └── motifs/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── Tabs.jsx
│   │   └── layout/
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       └── PageLayout.jsx
│   ├── features/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── ContentManager.jsx
│   │   │   └── ThemeManager.jsx
│   │   ├── customization/
│   │   │   ├── CustomizationWizard.jsx
│   │   │   ├── Step1Details.jsx
│   │   │   ├── Step2Photos.jsx
│   │   │   └── Step3Preview.jsx
│   │   ├── home/
│   │   │   ├── CtaBanner.jsx
│   │   │   ├── FaqSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   ├── TrendingThemes.jsx
│   │   │   └── WhyChooseUs.jsx
│   │   ├── invitation/
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── EnvelopeOpening.jsx
│   │   │   ├── EventTimeline.jsx
│   │   │   ├── FallingPetals.jsx
│   │   │   ├── InteractiveCards.jsx
│   │   │   ├── InvitationRenderer.jsx
│   │   │   └── YouAreInvitedCard.jsx
│   │   └── themes/
│   │       ├── ThemeCard.jsx
│   │       ├── ThemeGallery.jsx
│   │       └── ThemePreview.jsx
│   ├── hooks/
│   │   ├── useCountdown.js
│   │   └── useLenis.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── customizationStore.js
│   ├── styles/
│   │   ├── index.css
│   │   └── ornaments.css
│   └── utils/
│       ├── dateUtils.js
│       └── validationSchemas.js
├── public/
│   ├── demo/
│   └── uploads/
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 6. Detailed Feature Specifications

### 6.1 Public Website Pages

#### 1. Homepage (`/`)
- **Header**: Responsive navigation with logo ("ShaadiVibe"), navigation links (Themes, How It Works, Features, FAQs), Login action, and "Create Invitation" Gold CTA button.
- **Hero Section**: Headline ("Craft Unforgettable Indian Wedding Invitations"), subheadline, CTAs ("Browse Royal Themes", "Watch Interactive Demo"), live invitation teaser card mockup.
- **Trust Indicators**: Count of celebrations served, 100% customizable, mobile friendly, authentic Indian traditions.
- **Feature Highlights**: 3D Envelope unwrapping, live countdown, multi-ceremony itinerary, high-res photo gallery, interactive cards.
- **Trending Themes**: Filterable tabs (Royal Palace, Traditional Marigold, Pastel Floral, Modern Minimal, Destination) with preview cards.
- **How It Works**: 3 steps: 1. Choose Theme -> 2. Personalize Details & Photos -> 3. Share Royal Invite with Loved Ones.
- **Why Choose ShaadiVibe**: Eco-friendly digital luxury, instant updates, cultural elegance, zero postage lag.
- **Testimonials**: Clearly marked real-world style demo reviews with couple names and cities (e.g., Delhi, Mumbai, Udaipur).
- **CTA Banner**: "Ready to announce your auspicious union?" with instant button.
- **FAQ Section**: Accordion with answers regarding customization, mobile compatibility, languages, and photo limits.
- **Footer**: Brand statement, quick links, copyright, policy links.

#### 2. Theme Gallery (`/themes`)
- Responsive grid of themes.
- Categories: Royal, Traditional, Floral, Minimal, Modern, Destination, Regional.
- Search input by name and tags.
- Filters: Supported format (Interactive Website, Video Invitation format showcase, Both), Language (English, Hindi, Bilingual), Price tag indicator.
- Empty state with reset filters button, skeleton loading state, and error handling with retry.

#### 3. Theme Preview (`/themes/:slug`)
- Hero showcase with cover visual.
- Live sample preview button launching interactive test invitation.
- Feature breakdown tags (3D Envelope, Multi-day Events, Photo Album, Countdown).
- Direct CTA: "Customize This Theme" (navigates to `/customize/:themeId`).
- 404 Not Found fallback if theme does not exist.

#### 4. Customer Customization Wizard (`/customize/:themeId`)
- Multi-step wizard with step indicator:
  - **Step 1: Wedding Details & Itinerary**:
    - Bride name, Groom name, Tagline ("Together with their families").
    - Auspicious wedding date & time, Primary language.
    - Family invitation note ("cordially invite you to celebrate...").
    - Main venue name, address, Google Maps link.
    - **Wedding Event Itinerary Editor**: Dynamic list where users can add, edit, or remove ceremonies (Haldi, Mehendi, Sangeet, Baraat, Pheras, Reception), each with title, date, time, venue, and description.
  - **Step 2: Photos**:
    - Multi-photo upload dropzone with preview grid.
    - Delete and reorder capabilities.
    - Client-side and server-side file type (JPG, PNG, WebP) and size validation (max 5MB per photo, up to 6 photos).
    - Friendly progress and validation feedback.
  - **Step 3: Live Preview & Save**:
    - Full interactive preview embedded with live inputs.
    - "Save Draft" and "Publish Invitation" buttons.
    - Generated personalized link (`/invite/:slug`) ready to copy and open!
    - **Strictly NO payment forms or fake checkout**.

#### 5. Interactive Invitation Renderer (`/invite/:slug`)
- **Stage 1: Closed Royal Envelope**:
  - Deep burgundy velvet-finish envelope with gold foil border and antique gold wax seal stamped with wedding initials.
  - Interactive prompt: *"Tap wax seal to open royal invitation"*.
- **Stage 2: Smooth Unwrap Animation**:
  - Wax seal dissolves, the envelope flap opens smoothly in 3D perspective (`rotateX`), and the gold-bordered invitation letter slides upwards into full view.
- **Stage 3: Staggered Royal Typography Reveal**:
  - Auspicious invocation (e.g. *|| Shree Ganeshay Namah ||*).
  - Staggered animated reveal of Bride & Groom names in elegant serif typography with floral divider.
- **Stage 4: Auspicious Date & Countdown Timer**:
  - Live ticking countdown (Days, Hours, Minutes, Seconds) calculated dynamically from the wedding date.
  - Graceful handling of ongoing/past celebrations.
- **Stage 5: Three Interactive Decorative Cards**:
  1. *Sacred Vows & Blessings*: Tap to open modal with heartfelt quotes and blessings.
  2. *Royal Dress Code & Palette*: Tap to open modal with suggested attire colors (e.g., Royal Ethnic, Pastel Traditional).
  3. *Venue & Accommodations*: Tap to open modal with venue details, map directions, and stay information.
- **Stage 6: "You Are Invited" Card**:
  - Personal heartfelt invitation note from the families.
- **Stage 7: Multi-Day Wedding Itinerary Timeline**:
  - Scroll-triggered timeline featuring Haldi, Mehendi, Sangeet, Baraat, Pheras, and Reception with customized icons, dates, timings, venues, and descriptions.
- **Stage 8: Ambient Falling Petals**:
  - Delicate rose and marigold petals floating gently down the screen.
  - Accessible: `pointer-events: none` and respects `prefers-reduced-motion`.

---

## 7. Backend & Database Specification

### 7.1 Database Models (Mongoose)

#### 1. Theme (`Theme.js`)
- `name`: String, required
- `slug`: String, unique, required, indexed
- `description`: String
- `category`: Enum ['Royal', 'Traditional', 'Floral', 'Minimal', 'Modern', 'Destination', 'Regional']
- `tags`: [String]
- `coverImage`: String
- `previewImages`: [String]
- `supportedFormats`: [Enum ['Interactive Website', 'Video Invitation']]
- `priceDisplay`: Number (default: 0)
- `features`: [String]
- `isPublished`: Boolean (default: true)
- `colorPalette`: { primary: String, secondary: String, accent: String, background: String }
- `timestamps`: true

#### 2. Invitation (`Invitation.js`)
- `slug`: String, unique, required, indexed
- `themeId`: ObjectId (ref: 'Theme')
- `brideName`: String, required
- `groomName`: String, required
- `weddingDate`: Date, required
- `language`: String (default: 'English')
- `tagline`: String
- `familyMessage`: String
- `venue`: { name: String, address: String, mapUrl: String }
- `photos`: [String]
- `interactiveCards`: [{ id: String, title: String, subtitle: String, content: String, icon: String }]
- `events`: [{ id: String, title: String, date: String, time: String, venue: String, description: String, icon: String }]
- `status`: Enum ['draft', 'published']
- `timestamps`: true

#### 3. SiteContent (`SiteContent.js`)
- `section`: String, unique (e.g., 'hero', 'features', 'faqs', 'testimonials', 'settings')
- `data`: Mixed (JSON object containing editable texts, CTAs, list items)
- `timestamps`: true

#### 4. User (`User.js`)
- `name`: String, required
- `email`: String, unique, required, indexed
- `password`: String, required (bcrypt hashed)
- `role`: Enum ['admin', 'user'], default: 'admin'
- `timestamps`: true

### 7.2 API Endpoints

- `GET /api/health` — Healthcheck
- `POST /api/auth/login` — Admin login (returns JWT token)
- `GET /api/auth/me` — Current user profile
- `GET /api/themes` — List published themes (with filter query params: category, search, format)
- `GET /api/themes/:slug` — Get theme detail by slug
- `POST /api/themes` — Create theme (Admin only)
- `PUT /api/themes/:id` — Update theme (Admin only)
- `DELETE /api/themes/:id` — Soft-delete / Unpublish theme (Admin only)
- `GET /api/invitations/:slug` — Get invitation by unique slug (for public rendering)
- `POST /api/invitations` — Create/Save invitation
- `PUT /api/invitations/:id` — Update invitation
- `POST /api/upload` — Upload photo (stores file in safe upload directory, validates mimetype and size)
- `GET /api/content/:section` — Get homepage section content
- `PUT /api/content/:section` — Update homepage section content (Admin only)

---

## 8. Verification & Quality Assurance Strategy

1. **Security**:
   - Helmet protection on all API endpoints.
   - CORS strictly restricted to authorized origin.
   - Rate limiting on API and authentication routes.
   - Sanitize all file upload paths using `path.basename()` to eliminate directory traversal.
   - Zero raw `dangerouslySetInnerHTML` on untrusted user strings.
   - Passwords hashed with bcrypt (cost factor 10+).
   - No hardcoded secrets; fallback gracefully to secure demo defaults in local development.

2. **Performance & Responsiveness**:
   - Mobile-first CSS with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
   - Non-blocking falling petals with optimized CSS transforms and low particle density.
   - Lazy loading for images.
   - Smooth Lenis scrolling with unmount cleanup to avoid memory leaks.

3. **Accessibility**:
   - Full keyboard accessibility on all modal dialogs, buttons, and form inputs.
   - Media queries checking `(prefers-reduced-motion: reduce)` to disable heavy 3D transforms and auto-falling petals.
   - Semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).

---

*ShaadiVibe Engineering Team — Phase 1 Specification Approved*
