# NFT Marketplace - Component Architecture (DRY Principles)

**Last Updated:** 2025-10-10

## Overview

This document defines the **correct** component architecture for the NFT marketplace. Following this architecture ensures DRY (Don't Repeat Yourself) principles and single-source-of-truth for styling.

---

## Core Principle: Single Source of Truth

**ONE change to a component should propagate to ALL instances across the entire app.**

---

## Component Hierarchy

```
WatchlistToggle (components/profile/add-to-watchlist.tsx)
    ↓ Used by (no className prop)
3 NFT Card Types:
    ├─ IndividualNFTCard (components/nft/cards/IndividualNFTCard.tsx)
    ├─ BundleNFTCard (components/nft/cards/BundleNFTCard.tsx)
    └─ RentalWrapperNFTCard (components/nft/cards/RentalWrapperNFTCard.tsx)
        ↓ Rendered by
NFTCardGrid (components/nft/cards/NFTCardGrid.tsx)
    ↓ Used by
Pages:
    ├─ /collections/[slug] (collection detail pages)
    ├─ /collections (collections directory)
    ├─ /profile/[username] (user portfolios)
    └─ Other pages displaying NFT grids
```

---

## The 3 NFT Card Types

### 1. IndividualNFTCard
**Purpose:** Display single NFTs (ERC-721, ERC-1155 individual tokens)

**File:** `components/nft/cards/IndividualNFTCard.tsx`

**Features:**
- Chain badge (top-left)
- Rarity badge (below chain badge)
- Watchlist toggle (top-right)
- Listing badge (if for sale/rent)
- Action buttons overlay (on hover)
- NFT image with aspect ratio lock

**Usage:**
```tsx
<IndividualNFTCard
  nft={nft}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={handleClick}
/>
```

### 2. BundleNFTCard
**Purpose:** Display NFT bundles (multiple NFTs packaged together)

**File:** `components/nft/cards/BundleNFTCard.tsx`

**Features:**
- FS logo watermark (center)
- Bundle badge (top-left)
- Chain badge (top-left)
- Watchlist toggle (top-right)
- Thumbnail preview (bottom, shows up to 4 NFTs)
- Action buttons overlay (on hover)

**Usage:**
```tsx
<BundleNFTCard
  nft={bundleNFT}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={handleClick}
/>
```

### 3. RentalWrapperNFTCard
**Purpose:** Display rental wrapper NFTs (NFTs available for rent)

**File:** `components/nft/cards/RentalWrapperNFTCard.tsx`

**Features:**
- Chain badge (top-left)
- Rarity badge (below chain badge)
- Watchlist toggle (top-right)
- Rental badge (indicates rental status)
- Rental info (rental period, price)
- Action buttons overlay (on hover)

**Usage:**
```tsx
<RentalWrapperNFTCard
  nft={rentalNFT}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={handleClick}
/>
```

---

## NFTCardGrid Component

**Purpose:** Auto-detect NFT type and render appropriate card component

**File:** `components/nft/cards/NFTCardGrid.tsx`

**Features:**
- Auto-detection of card type (Bundle vs Rental vs Individual)
- Responsive grid layout (2-6 columns based on screen size)
- Consistent gap spacing
- Loading states
- Empty states

**Props:**
```tsx
interface NFTCardGridProps {
  nfts: PortfolioNFT[]           // Array of NFTs to display
  size?: CardSize                // 'micro' | 'compact' | 'standard' | 'large'
  showWatchlist?: boolean        // Show watchlist toggle (default: true)
  showActions?: boolean          // Show action buttons (default: false)
  isOwner?: boolean              // Is current user the owner
  onCardClick?: (nft) => void    // Card click handler
  onBuyClick?: (nft) => void     // Buy button click handler
  onRentClick?: (nft) => void    // Rent button click handler
  onSwapClick?: (nft) => void    // Swap button click handler
  loading?: boolean              // Show loading skeleton
  emptyMessage?: string          // Custom empty state message
  className?: string             // Additional CSS classes
}
```

**Auto-Detection Logic:**
```tsx
if (nft.bundleCount > 0) return <BundleNFTCard />
if (nft.rentalStatus) return <RentalWrapperNFTCard />
return <IndividualNFTCard />
```

**Usage:**
```tsx
<NFTCardGrid
  nfts={nfts}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={(nft) => setSelectedNFT(nft)}
/>
```

---

## WatchlistToggle Component

**Purpose:** Add/remove NFTs from user's watchlist

**File:** `components/profile/add-to-watchlist.tsx`

**Exports:**
- `AddToWatchlist` - Full button with text (deprecated, use WatchlistToggle)
- `WatchlistToggle` - Icon-only button (preferred)

**States:**

### Non-Clicked State (Not in Watchlist)
```tsx
bg-gray-600/70           // Gray semi-transparent background
text-white               // White icon color
rounded-lg               // Rounded corners
// NO fill-current      // Outline eye icon
// NO glow effect
```

### Clicked State (In Watchlist)
```tsx
bg-black/70              // Dark semi-transparent background
text-primary             // Cyan icon color
fill-current             // Filled eye icon
drop-shadow-[0_0_12px_rgba(0,255,255,0.8)]  // Cyan glow
rounded-lg               // Rounded corners
```

### Hover States
```tsx
// Non-clicked hover
hover:bg-gray-600/80
hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]
hover:scale-105

// Clicked hover
hover:bg-black/80
hover:drop-shadow-[0_0_16px_rgba(0,255,255,0.9)]
hover:scale-110
```

**Responsive Sizing:**
```tsx
h-12 w-12      // Mobile (48px touch target)
md:h-10 md:w-10  // Tablet (40px)
lg:h-8 lg:w-8    // Desktop (32px)
```

**✅ CORRECT Usage (in card components):**
```tsx
<WatchlistToggle
  contractAddress={nft.contractAddress}
  tokenId={nft.tokenId}
  name={nft.name}
  collection={nft.collection}
  image={nft.image}
  chainId={nft.chainId}
  // NO className prop
/>
```

**❌ WRONG Usage (do NOT do this):**
```tsx
<WatchlistToggle
  {...props}
  className="bg-black/50 hover:bg-black/70"  // ❌ Overrides component styling
/>
```

---

## Card Sizes

The `size` prop controls card dimensions and text sizing:

### micro
- **Grid:** 8 columns max (2xl breakpoint)
- **Card Width:** ~150-180px
- **Use Case:** Collection pages with many NFTs
- **Text:** 10px title, 8px subtitle

### compact
- **Grid:** 6 columns max (xl breakpoint)
- **Card Width:** ~170-210px
- **Use Case:** Portfolio, watchlist, featured NFTs
- **Text:** 12px title, 10px subtitle

### standard
- **Grid:** 4-5 columns max (lg breakpoint)
- **Card Width:** ~190-250px
- **Use Case:** Marketplace listings, search results
- **Text:** 14px title, 12px subtitle

### large
- **Grid:** 2-3 columns max (md breakpoint)
- **Card Width:** 300px+
- **Use Case:** Featured sections, hero grids
- **Text:** 16px title, 14px subtitle

---

## Pages Using NFTCardGrid (✅ CORRECT)

### 1. Collection Detail Pages
**File:** `app/collections/[slug]/page.tsx`

**Items Tab:**
```tsx
<NFTCardGrid
  nfts={nfts}
  size="micro"  // 8 columns max
  showWatchlist={true}
  onCardClick={(nft) => setSelectedNFT(nft)}
/>
```

### 2. Collections Directory
**File:** `app/collections/page.tsx`

**Collection Tab:**
```tsx
<NFTCardGrid
  nfts={mockCollectionNFTs}
  size="compact"
  showWatchlist={true}
  showActions={true}
/>
```

**Bundles Tab:**
```tsx
<NFTCardGrid
  nfts={mockCollectionBundles}
  size="compact"
  showWatchlist={true}
  showActions={true}
/>
```

### 3. User Profile Pages
**File:** `components/profile/profile-tabs.tsx`

**Portfolio Tab:**
```tsx
<NFTCardGrid
  nfts={profileTabData.portfolio}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={handleNFTClick}
/>
```

---

## Architectural Violations (❌ NEEDS FIXING)

The following pages violate DRY principles by implementing inline cards instead of using NFTCardGrid:

### 1. Featured NFTs Component
**File:** `components/featured-nfts.tsx`
**Lines:** 99-179 (80 lines duplicate code)
**Issue:** Manual card rendering with inline WatchlistToggle

**Should be:**
```tsx
<NFTCardGrid
  nfts={featuredNFTs}
  size="compact"
  showWatchlist={true}
  showActions={true}
/>
```

### 2. Bundles Page - Create Tab
**File:** `app/bundles/page.tsx`
**Lines:** 465-600 (135 lines duplicate code)
**Issue:** Manual NFT selection grid

**Should be:**
```tsx
<NFTCardGrid
  nfts={searchedNFTs}
  size="compact"
  showWatchlist={true}
  selectable={true}
  onSelect={handleNFTSelect}
/>
```

### 3. Bundles Page - Manage Tab
**File:** `app/bundles/page.tsx`
**Lines:** 737-843 (106 lines duplicate code)
**Issue:** Manual bundle card rendering

**Should be:**
```tsx
<NFTCardGrid
  nfts={mockExistingBundles}
  size="compact"
  showWatchlist={true}
  showActions={true}
/>
```

### 4. Profile Watchlist Tab
**File:** `components/profile/profile-tabs.tsx`
**Lines:** 337-516 (179 lines duplicate code)
**Issue:** Manual card rendering for watchlist items

**Should be:**
```tsx
<NFTCardGrid
  nfts={profileTabData.watchlist}
  size="compact"
  showWatchlist={true}
  showActions={true}
  onCardClick={handleNFTClick}
/>
```

---

## How to Make Changes

### To Change Watchlist Icon Styling

**❌ WRONG Approach:**
- Update 7+ files across the codebase
- Change className props in multiple places
- Modify inline card implementations

**✅ CORRECT Approach:**
1. Open `components/profile/add-to-watchlist.tsx`
2. Update the `WatchlistToggle` component (lines 162-199)
3. Changes propagate automatically to ALL cards using NFTCardGrid

### To Change NFT Card Layout

**❌ WRONG Approach:**
- Update inline card implementations in pages
- Duplicate changes across multiple files

**✅ CORRECT Approach:**
1. Open the appropriate card file:
   - `components/nft/cards/IndividualNFTCard.tsx`
   - `components/nft/cards/BundleNFTCard.tsx`
   - `components/nft/cards/RentalWrapperNFTCard.tsx`
2. Update the card component
3. Changes propagate to ALL pages using NFTCardGrid

### To Change Grid Layout

**❌ WRONG Approach:**
- Update grid classes in individual pages

**✅ CORRECT Approach:**
1. Open `components/nft/cards/NFTCardGrid.tsx`
2. Update grid classes (line 89)
3. Changes propagate to ALL pages using NFTCardGrid

---

## Development Checklist

When adding a new page that displays NFTs:

- [ ] Import `NFTCardGrid` from `@/components/nft/cards/NFTCardGrid`
- [ ] Pass NFT data in `PortfolioNFT` format
- [ ] Use appropriate `size` prop (micro/compact/standard/large)
- [ ] Do NOT render cards manually
- [ ] Do NOT call `WatchlistToggle` directly (let card components handle it)
- [ ] Do NOT pass `className` to override component styling

---

## Testing Changes

After modifying WatchlistToggle or card components:

1. **Test on Collection Pages:**
   - [ ] `/collections/[slug]` - Items tab
   - [ ] `/collections` - Collections directory

2. **Test on Profile Pages:**
   - [ ] `/profile/[username]` - Portfolio tab
   - [ ] `/profile/[username]` - Watchlist tab (if using NFTCardGrid)

3. **Test All 3 Card Types:**
   - [ ] Individual NFT cards
   - [ ] Bundle NFT cards
   - [ ] Rental wrapper cards

4. **Test All States:**
   - [ ] Non-clicked state (gray background, outline icon)
   - [ ] Clicked state (dark background, filled icon, glow)
   - [ ] Hover states (both clicked and non-clicked)

5. **Test Responsive Sizing:**
   - [ ] Mobile (48px touch target)
   - [ ] Tablet (40px)
   - [ ] Desktop (32px)

---

## Future Improvements

1. **Refactor Architectural Violations:**
   - Convert featured-nfts.tsx to use NFTCardGrid
   - Convert bundles/page.tsx create/manage tabs to use NFTCardGrid
   - Convert profile watchlist tab to use NFTCardGrid

2. **Add Selection Mode to NFTCardGrid:**
   - Support inline checkbox selection (for bundle creation)
   - Remove need for custom card rendering

3. **Add Linting Rules:**
   - Prevent manual card rendering outside card components
   - Prevent className overrides on WatchlistToggle

4. **Documentation:**
   - Component Storybook for card types
   - Interactive examples of NFTCardGrid usage

---

## Summary

**Current State:**
- ✅ Core components (WatchlistToggle, 3 card types, NFTCardGrid) are well-designed
- ✅ Collection pages use architecture correctly
- ❌ 4 pages bypass architecture with inline card rendering (~500 lines duplicate code)

**Impact of Following This Architecture:**
- ONE change to WatchlistToggle = updates everywhere automatically
- Consistent UX across all pages
- Reduced code duplication
- Easier maintenance and debugging
- Better performance (smaller bundle size)

**Goal:** 100% adoption of NFTCardGrid pattern across all pages displaying NFTs.
