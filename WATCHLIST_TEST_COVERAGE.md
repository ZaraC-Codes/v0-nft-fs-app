# Watchlist Icon Test Coverage Map

Visual representation of test coverage across the application.

---

## 📊 Test Coverage Overview

```
Total Files with WatchlistToggle: 13
├── Core Component: 1
├── Card Components: 3
├── Page Components: 5
└── Other Components: 4

Automated Tests: 32 checks ✅ PASSED
Manual Tests Required: ~150 checks ⏳ PENDING
```

---

## 🗺️ Application Pages & Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
         📄 PAGES (7)                    🧩 COMPONENTS (6)
                │                               │
    ┌───────────┼───────────┐          ┌───────┴───────┐
    │           │           │          │               │
  Home      Collections   Profile   NFTCard         Modal
    │           │           │        Components
    │           │           │            │
    ↓           ↓           ↓            ↓
[WatchlistToggle Used in All]
```

---

## 🎯 Test Coverage by Page

### Home Page (`/`)
```
┌────────────────────────────────────────────────┐
│  HOME PAGE                                     │
│  ├── Header                                    │
│  ├── Hero Section                              │
│  └── Featured NFTs Section                     │
│      └── NFT Cards (4-6 cards)                 │
│          └── WatchlistToggle ✓ TEST HERE      │
│              ├── Visual: Icon display          │
│              ├── States: Default/Active        │
│              ├── Interaction: Click toggle     │
│              └── Responsive: Mobile/Desktop    │
└────────────────────────────────────────────────┘

Test Priority: 🔴 HIGH (first impression)
Test Time: ~5 minutes
```

### Collections Page (`/collections`)
```
┌────────────────────────────────────────────────┐
│  COLLECTIONS LIST PAGE                         │
│  ├── Header                                    │
│  ├── Filters & Search                          │
│  └── Collections Grid                          │
│      └── Collection Cards (10-20 cards)        │
│          ├── Collection preview                │
│          └── Stats                             │
└────────────────────────────────────────────────┘

Test Priority: 🟡 MEDIUM
Test Time: ~3 minutes
Note: No direct WatchlistToggle here, but links to detail pages
```

### Collection Detail Page (`/collections/[slug]`)
```
┌────────────────────────────────────────────────┐
│  COLLECTION DETAIL PAGE                        │
│  ├── Collection Header                         │
│  │   └── Stats & Info                          │
│  └── NFTs Tab                                  │
│      └── NFTCardGrid                           │
│          ├── IndividualNFTCard (10-50 cards)   │
│          │   └── WatchlistToggle ✓ TEST HERE   │
│          ├── BundleNFTCard (if any)            │
│          │   └── WatchlistToggle ✓ TEST HERE   │
│          └── RentalWrapperNFTCard (if any)     │
│              └── WatchlistToggle ✓ TEST HERE   │
└────────────────────────────────────────────────┘

Test Priority: 🔴 HIGH (primary browsing)
Test Time: ~10 minutes
Test Focus:
  ✓ Multiple icons on page (20+ icons)
  ✓ Different card types (individual, bundle, rental)
  ✓ Various backgrounds (light/dark NFT images)
  ✓ Scrolling performance
```

### Profile Page (`/profile/[username]`)
```
┌────────────────────────────────────────────────┐
│  PROFILE PAGE                                  │
│  ├── Profile Header                            │
│  │   ├── Avatar & Stats                        │
│  │   └── Edit Profile Button                   │
│  └── Tabs                                      │
│      ├── Portfolio Tab                         │
│      │   └── NFTCardGrid                       │
│      │       └── WatchlistToggle ✓ TEST HERE   │
│      ├── On Sale Tab                           │
│      │   └── NFTCardGrid                       │
│      │       └── WatchlistToggle ✓ TEST HERE   │
│      └── Watchlist Tab ✓ CRITICAL TEST         │
│          ├── Empty State (Eye icon, read-only) │
│          └── NFTCardGrid                       │
│              └── WatchlistToggle ✓ TEST HERE   │
│                  (All icons should be filled)  │
└────────────────────────────────────────────────┘

Test Priority: 🔴 HIGH (user's dashboard)
Test Time: ~15 minutes
Test Focus:
  ✓ State persistence across tabs
  ✓ Watchlist tab shows added items
  ✓ Remove from watchlist updates tab
  ✓ Empty state display
```

### Bundles Page (`/bundles`)
```
┌────────────────────────────────────────────────┐
│  BUNDLES PAGE                                  │
│  ├── Header                                    │
│  ├── Filters                                   │
│  └── Bundle Grid                               │
│      └── BundleNFTCards (5-20 cards)           │
│          ├── Gradient Background               │
│          ├── FS Logo Watermark                 │
│          ├── Preview Thumbnails                │
│          └── WatchlistToggle ✓ TEST HERE       │
│              (Test on dark gradient)           │
└────────────────────────────────────────────────┘

Test Priority: 🟡 MEDIUM
Test Time: ~5 minutes
Test Focus:
  ✓ Icon visibility on purple gradient
  ✓ Icon doesn't interfere with logo/thumbnails
```

### NFT Details Modal (Any Page)
```
┌────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════╗ │
│  ║  NFT DETAILS MODAL                       ║ │
│  ╠══════════════════════════════════════════╣ │
│  ║ Header                                   ║ │
│  ║  ├── NFT Name                            ║ │
│  ║  └── WatchlistToggle ✓ TEST HERE        ║ │
│  ║                                          ║ │
│  ║ NFT Image                                ║ │
│  ║                                          ║ │
│  ║ Details & Properties                     ║ │
│  ║                                          ║ │
│  ║ [Close Button]                           ║ │
│  ╚══════════════════════════════════════════╝ │
└────────────────────────────────────────────────┘

Test Priority: 🟡 MEDIUM
Test Time: ~5 minutes
Test Focus:
  ✓ Icon in modal header
  ✓ Click doesn't close modal
  ✓ State syncs with card behind modal
  ✓ Works from any trigger page
```

### Other Pages (Lower Priority)
```
┌────────────────────────────────────────────────┐
│  RENTALS PAGE                                  │
│  └── Rental listings (no direct watchlist)    │
│                                                │
│  TREASURY PAGE                                 │
│  └── Treasury holdings (no watchlist)         │
│                                                │
│  CHAT PAGE                                     │
│  └── NFT gate messages (no watchlist)         │
└────────────────────────────────────────────────┘

Test Priority: 🟢 LOW (no WatchlistToggle)
```

---

## 🧩 Component Test Coverage

### Core Component
```
components/profile/add-to-watchlist.tsx
├── AddToWatchlist (full button version)
│   └── [Eye Icon] Add to Watchlist
└── WatchlistToggle (icon-only version) ✓ PRIMARY TEST TARGET
    ├── Props: 7 parameters (6 required, 1 optional)
    ├── States: 3 (default, active, loading)
    ├── Sizes: 3 (mobile: 48px, tablet: 40px, desktop: 32px)
    └── Interactions: Click, Keyboard, Touch
```

### Card Components (Use WatchlistToggle)
```
components/nft/cards/
├── IndividualNFTCard.tsx
│   └── WatchlistToggle (line 91)
│       └── Position: absolute top-1.5 right-1.5
├── BundleNFTCard.tsx
│   └── WatchlistToggle (line 101)
│       └── Position: absolute top-4 right-4
└── RentalWrapperNFTCard.tsx
    └── WatchlistToggle (line 95)
        └── Position: absolute top-1.5 right-1.5
```

### Other Components (Use WatchlistToggle)
```
components/
├── featured-nfts.tsx (line 130)
│   └── In featured NFT cards
├── nft/nft-details-modal.tsx (line 465)
│   └── In modal header
└── profile/profile-tabs.tsx (line 380)
    └── In portfolio/watchlist grids
```

---

## 📋 Test Matrix

```
┌────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Page/Component │ Vis  │ Int  │ Resp │ A11y │ Perf │ Regr │
├────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ Home           │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
│ Collections    │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
│ Coll. Detail   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
│ Profile        │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
│ Bundles        │  ✓   │  ✓   │  ✓   │  ✓   │  -   │  ✓   │
│ NFT Modal      │  ✓   │  ✓   │  ✓   │  ✓   │  -   │  ✓   │
└────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘

Legend:
  Vis  = Visual (icon display, states, colors)
  Int  = Interaction (click, keyboard, touch)
  Resp = Responsive (mobile, tablet, desktop)
  A11y = Accessibility (ARIA, keyboard, screen reader)
  Perf = Performance (many icons, scrolling)
  Regr = Regression (backend, database, toasts)
  ✓    = Must test
  -    = Optional/not applicable
```

---

## 🔍 Automated vs Manual Testing

```
┌─────────────────────────────────────────────────┐
│  AUTOMATED TESTING (32 checks)                  │
│  ✅ PASSED                                       │
├─────────────────────────────────────────────────┤
│  ✓ Component structure (8 checks)               │
│  ✓ Import verification (8 checks)               │
│  ✓ Inline icon detection (0 issues)             │
│  ✓ className safety (6 checks)                  │
│  ✓ Usage patterns (9 checks)                    │
│  ✓ Required props (1 check)                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  MANUAL TESTING (~150 checks)                   │
│  ⏳ PENDING                                      │
├─────────────────────────────────────────────────┤
│  Visual Testing                                 │
│    ├── Icon display (7 pages × 3 states)        │
│    ├── Responsive sizing (3 breakpoints)        │
│    └── Background contrast (4 types)            │
│                                                  │
│  Interaction Testing                            │
│    ├── Click behavior (3 states)                │
│    ├── Keyboard navigation (3 keys)             │
│    └── Touch interaction (mobile)               │
│                                                  │
│  State Testing                                  │
│    ├── Persistence (4 scenarios)                │
│    ├── Cross-page sync (3 paths)                │
│    └── Multi-tab behavior (advanced)            │
│                                                  │
│  Regression Testing                             │
│    ├── Backend API (2 endpoints)                │
│    ├── Database sync (Supabase)                 │
│    ├── Toast notifications (4 types)            │
│    └── Profile provider (4 methods)             │
│                                                  │
│  Browser Testing                                │
│    ├── Chrome Desktop                           │
│    ├── Firefox Desktop                          │
│    ├── Safari Desktop                           │
│    ├── Chrome Mobile                            │
│    └── Safari Mobile                            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Critical Test Paths

### Path 1: Add to Watchlist Flow
```
Home Page
   ↓ (see featured NFT card)
Hover icon (desktop) → Cyan glow appears
   ↓
Click icon → Loading spinner
   ↓ (API call: POST /api/profile/watchlist/add)
Database → Insert into watchlist_items
   ↓
Icon turns cyan + filled
   ↓
Toast: "Added to Watchlist"
   ↓
Navigate to Profile → Watchlist Tab
   ↓
NFT appears in list ✓
```

### Path 2: Remove from Watchlist Flow
```
Profile → Watchlist Tab
   ↓ (see watchlisted NFT card)
Icon is cyan + filled
   ↓
Click icon → Loading spinner
   ↓ (API call: POST /api/profile/watchlist/remove)
Database → Delete from watchlist_items
   ↓
Icon turns gray + outline
   ↓
Toast: "Removed from Watchlist"
   ↓
NFT disappears from tab ✓
```

### Path 3: Cross-Page Persistence
```
Collections → Collection Detail
   ↓
Click icon on NFT #123 → Active (cyan)
   ↓
Navigate to Profile → Portfolio Tab
   ↓
Find same NFT #123 → Icon still cyan ✓
   ↓
Navigate to Home Page
   ↓
If NFT #123 in featured → Icon still cyan ✓
   ↓
Refresh page (F5)
   ↓
Icon still cyan (loaded from DB) ✓
```

---

## 📊 Test Coverage Statistics

```
┌──────────────────────────────────────────────┐
│  COVERAGE METRICS                            │
├──────────────────────────────────────────────┤
│  Files with WatchlistToggle:      13        │
│  Pages to test:                    7        │
│  Card components:                  3        │
│  Visual states:                    3        │
│  Responsive breakpoints:           3        │
│  Browser matrix:                   5        │
│  Automated checks:                32 ✅     │
│  Manual checks (estimated):      150 ⏳     │
│  Total test points:              182        │
├──────────────────────────────────────────────┤
│  Estimated testing time:                     │
│    Quick test (3 pages):          5 min     │
│    Standard test (all pages):    45 min     │
│    Comprehensive (+ browsers):   2-3 hrs    │
└──────────────────────────────────────────────┘
```

---

## 🎨 Visual Test Scenarios

```
Scenario 1: Light NFT Image
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  Light background
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  (white/pastel)
│ ░░░░░░░░░░░░░░░░░░░░░░░[👁️]        │  Icon top-right
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  bg-black/50
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ✓ Must be visible
└─────────────────────────────────────┘

Scenario 2: Dark NFT Image
┌─────────────────────────────────────┐
│ ████████████████████████████████████ │  Dark background
│ ████████████████████████████████████ │  (black/deep color)
│ ████████████████████████[👁️]        │  Icon top-right
│ ████████████████████████████████████ │  bg-black/50
│ ████████████████████████████████████ │  ✓ Must be visible
└─────────────────────────────────────┘  (cyan glow helps)

Scenario 3: Bundle Gradient
┌─────────────────────────────────────┐
│ 🟣🟣🟣🟣🟣🟣⬛⬛⬛⬛🔵🔵🔵🔵🔵🔵🔵🔵 │  Purple → Black
│ 🟣🟣🟣🟣⬛⬛⬛⬛⬛🔵🔵🔵🔵🔵🔵🔵🔵🔵 │  → Blue gradient
│ 🟣🟣⬛⬛⬛⬛⬛⬛🔵🔵🔵🔵🔵[👁️]       │  Icon top-right
│ ⬛⬛⬛⬛⬛⬛⬛🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵 │  ✓ Must stand out
│ ⬛⬛⬛⬛⬛🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵 │  from gradient
└─────────────────────────────────────┘
```

---

## ✅ Definition of Done

**Component is APPROVED when:**

```
✅ Automated Verification
   └── All 32 checks passed

✅ Visual Testing
   ├── Icons display correctly on all 7 pages
   ├── All 3 states render properly (default, active, loading)
   ├── Responsive sizing works (mobile, tablet, desktop)
   └── Visible on all background types (light, dark, gradient)

✅ Interaction Testing
   ├── Click adds/removes from watchlist
   ├── Keyboard navigation works (Tab, Enter, Space)
   ├── Touch targets adequate on mobile (48x48px)
   └── Loading state prevents duplicate actions

✅ State Persistence
   ├── State persists across page navigation
   ├── State persists after page refresh
   ├── Watchlist tab shows correct items
   └── Database sync verified in Supabase

✅ Regression Testing
   ├── Backend API endpoints work (add, remove)
   ├── Toast notifications appear correctly
   ├── Profile provider methods function
   └── No console errors or warnings

✅ Accessibility
   ├── Keyboard navigation fully functional
   ├── Screen readers announce state correctly
   ├── ARIA attributes correct (aria-label, aria-pressed)
   └── Focus ring visible and styled

✅ Browser Compatibility
   ├── Chrome Desktop tested
   ├── Firefox Desktop tested
   ├── Safari Desktop tested
   ├── Chrome Mobile tested
   └── Safari Mobile tested

✅ Performance
   ├── No lag with 20+ icons on page
   ├── State updates instantaneous
   └── No memory leaks observed

✅ Documentation
   ├── Test execution log completed
   ├── Issues documented (if any)
   └── Sign-off from developer, QA, product owner
```

---

## 📝 Quick Reference

**Test Documents:**
1. `WATCHLIST_ICON_TEST_PLAN.md` - Full test procedures (600 lines)
2. `WATCHLIST_VISUAL_CHECKLIST.md` - Quick checklist (400 lines)
3. `WATCHLIST_TESTING_SUMMARY.md` - Overview & status (450 lines)
4. `WATCHLIST_ICON_QUICK_REFERENCE.md` - Developer guide (300 lines)
5. `WATCHLIST_TEST_COVERAGE.md` - This document (350 lines)

**Scripts:**
- `npx tsx scripts/verify-watchlist-icons.ts` - Automated verification

**Component:**
- `components/profile/add-to-watchlist.tsx` - Source code

---

**Happy Testing!** 🚀
