# ShaadiVibe — Royal Indian Wedding Design System

## 1. Aesthetic Philosophy

ShaadiVibe's visual language is inspired by royal Indian palaces (Jaipur, Udaipur, Jodhpur), Mughal and Rajputana architectural grandeur, auspicious marigold & lotus floral decorations, and intricate gold-leaf manuscripts.

The platform creates an immediate sense of royal celebration, romance, warmth, and cultural reverence.

---

## 2. Color Palette & Semantic Tokens

```css
:root {
  /* Royal Maroons & Burgundies (Primary Brand) */
  --color-maroon-dark: #3B0410;    /* Dark velvet background, deep borders */
  --color-maroon-primary: #5C061D; /* Primary brand color, headers, CTAs */
  --color-maroon-rich: #721227;    /* Rich burgundy hover and gradients */
  --color-maroon-soft: #8B1E38;    /* Softer accent maroon */
  
  /* Antique Royal Gold (Ornaments & Accents) */
  --color-gold-dark: #9A7413;      /* Deep antique gold borders */
  --color-gold-primary: #D4AF37;   /* Regal gold foil, badges, seals */
  --color-gold-light: #F3E5AB;    /* Soft gold shimmer, subtle borders */
  --color-gold-cream: #FAF2D8;    /* Warm gold-tinted paper background */

  /* Auspicious Ivories & Creams (Backgrounds & Paper) */
  --color-ivory-base: #FAF7F2;     /* Core background (warm ivory) */
  --color-ivory-card: #FFFDF9;     /* Elevated invitation card surface */
  --color-ivory-warm: #F4EFE6;     /* Section contrast backgrounds */

  /* Indian Wedding Cultural Accents */
  --color-marigold: #E67A15;       /* Haldi / Marigold auspicious orange */
  --color-emerald-deep: #164E3A;   /* Royal emerald green jewelry accent */
  --color-rose-blush: #F7D6D8;     /* Soft romance blush */
  
  /* Readable Typographic Hierarchy */
  --color-text-primary: #2A1810;   /* Deep charcoal brown for high legibility */
  --color-text-secondary: #5A473E; /* Warm muted brown for descriptions */
  --color-text-muted: #8C786E;     /* Captions, timestamps, disabled states */
}
```

---

## 3. Typography Rules

### Serif Headings: Royal, Ceremonial & Timeless
- **Primary Serif**: `Cinzel`, `Playfair Display`, or `Cormorant Garamond`
- Used for:
  - Brand Logo ("ShaadiVibe")
  - Hero Titles
  - Bride & Groom personalized typography
  - Ceremony headers ("The Sacred Vows", "Auspicious Celebrations")

### Sans Body: Clean, Contemporary & Accessible
- **Primary Sans**: `Plus Jakarta Sans`, `Inter`, or `Outfit`
- Used for:
  - Navigation menus
  - Form labels and input fields
  - Event venue details, addresses, and timestamps
  - Buttons and interactive controls

---

## 4. Ornaments, Borders & Motifs

1. **Mandap Arch Border**:
   - Subtle curved double borders inspired by traditional Indian temple and palace archways.
   - Accented with golden corner florets (`❖` / custom SVG motifs).

2. **Royal Wax Seal**:
   - Circular antique gold / crimson medallion with embossed monogram and subtle drop shadow.
   - Interactive hover pulse to invite the guest to click and open.

3. **Subtle Falling Petals**:
   - Rose and marigold flower petal shapes rendered via lightweight CSS animations.
   - Gently floating down with subtle 3D rotational wobble.
   - Low particle count (12-18 particles) to keep mobile CPU/GPU at 60 FPS.
   - `pointer-events: none` and `user-select: none` so they never block user interaction.
   - Automatically disabled when `(prefers-reduced-motion: reduce)` is set.

---

## 5. Interactive Envelope Animation Sequence

```
[Initial Closed State]
  │
  ├─> 1. User hovers/taps the Gold Wax Seal
  │      └─ Seal displays gentle golden glow / scale up
  │
  ├─> 2. On Click / Tap:
  │      ├─ Wax seal fades out and unlocks
  │      ├─ Envelope flap rotates upwards in 3D: rotateX(0deg -> 180deg)
  │      └─ Envelope z-index flips to allow card to exit
  │
  ├─> 3. Invitation Card Slides Up:
  │      ├─ Smooth spring motion sliding from inside envelope
  │      └─ Card expands to prominent reading view
  │
  └─> 4. Content Reveal:
         ├─ Auspicious Invocation: "|| Shree Ganeshay Namah ||"
         ├─ Bride & Groom names staggered letter-by-letter reveal
         ├─ Auspicious wedding date and countdown timer activate
         ├─ 3 Interactive decorative cards reveal
         └─ Wedding ceremony timeline cascades into view on scroll
```

---

*ShaadiVibe Design System — Document Version 1.0*
