# NFT Card & Modal Component Architecture

**Version**: 1.0
**Last Updated**: January 2025
**Status**: Design Specification (Implementation Pending)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Directory Structure](#directory-structure)
4. [Type System](#type-system)
5. [Card Components](#card-components)
6. [Modal Components](#modal-components)
7. [Shared Components](#shared-components)
8. [Design Patterns](#design-patterns)
9. [Migration Strategy](#migration-strategy)
10. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

This document defines the complete component architecture for NFT cards and modals in the Fortuna Square marketplace. The goal is to eliminate **2000+ lines of duplicate code** across multiple files by creating a composable, type-safe component system.

**Key Benefits**:
- ✅ **80% code reduction** through shared components
- ✅ **Type safety** with comprehensive TypeScript interfaces
- ✅ **Consistent UX** across all NFT types (individual, bundle, rental)
- ✅ **Easy extensibility** for future NFT types (fractionalized, loans, etc.)
- ✅ **Performance optimized** with memoization and lazy loading

**Current Duplication Hotspots**:
- `profile-tabs.tsx` (~500 lines of card markup)
- `nft-details-modal.tsx` (1,183 lines)
- `create-bundle-modal.tsx` (823 lines)
- `bundles/page.tsx` (~400 lines of card markup)
- `rentals/page.tsx` (~400 lines of card markup)

---

## Problem Statement

### Current Pain Points

1. **Massive Code Duplication**: NFT card markup is duplicated across 5+ files with slight variations
2. **Inconsistent Badge Positioning**: Chain badges, rarity badges, and listing badges positioned differently
3. **Duplicate Action Logic**: Buy/Rent/Swap buttons repeated in every file
4. **Hard to Maintain**: Fixing a bug requires updating 5+ files
5. **No Type Safety**: Cards accept generic `any` types instead of typed NFT interfaces
6. **Mixed Concerns**: Business logic, styling, and rendering all mixed together

### Example of Current Duplication

**profile-tabs.tsx (lines 210-500)**:
```tsx
<Card className="group bg-card/50 border-border/50...">
  <div className="relative">
    <img src={nft.image} className="w-full aspect-square..." />
    {/* Chain Badge */}
    <div className="absolute top-1.5 left-1.5">
      <ChainBadge chainId={nft.chainId} size="sm" />
    </div>
    {/* Rarity Badge */}
    {nft.rarity && (
      <Badge className={`absolute top-7 left-1.5...`}>
        {nft.rarity}
      </Badge>
    )}
    {/* Watchlist Button */}
    <div className="absolute top-1.5 right-1.5 z-50">
      <WatchlistToggle {...} />
    </div>
    {/* Action Overlay - 100 more lines... */}
  </div>
  <CardContent className="p-4">
    {/* 50 lines of card content... */}
  </CardContent>
</Card>
```

**bundles/page.tsx (lines 465-597)**: **EXACT SAME CODE** with minor tweaks.

---

## Directory Structure

```
components/nft/
├── ARCHITECTURE.md                    # This file
│
├── cards/                             # NFT Card Components
│   ├── NFTCard.tsx                    # Main unified card component
│   ├── IndividualNFTCard.tsx          # Individual NFT variant
│   ├── BundleNFTCard.tsx              # Bundle NFT variant
│   ├── RentalWrapperNFTCard.tsx       # Rental wrapper variant
│   │
│   ├── shared/                        # Shared card sub-components
│   │   ├── NFTCardImage.tsx           # Image with overlays
│   │   ├── NFTCardBadges.tsx          # All badge types
│   │   ├── NFTCardActions.tsx         # Action overlay
│   │   ├── NFTCardContent.tsx         # Card footer content
│   │   └── NFTCardSkeleton.tsx        # Loading skeleton
│   │
│   ├── types.ts                       # Card-specific types
│   └── index.ts                       # Public exports
│
├── modals/                            # NFT Modal Components
│   ├── NFTDetailsModal.tsx            # Main details modal (refactored)
│   ├── CreateBundleModal.tsx          # Bundle creation (refactored)
│   ├── ListForSaleModal.tsx           # Sale listing (refactored)
│   ├── CreateSwapModal.tsx            # Swap listing (refactored)
│   ├── WrapForRentalModal.tsx         # Rental wrapping (refactored)
│   │
│   ├── shared/                        # Shared modal sub-components
│   │   ├── NFTPreviewSection.tsx      # NFT preview card
│   │   ├── PriceBreakdownSection.tsx  # Fee calculation display
│   │   ├── ApprovalSection.tsx        # NFT approval flow
│   │   ├── NFTSelectionGrid.tsx       # Multi-NFT picker
│   │   ├── ThumbnailSelector.tsx      # Bundle thumbnail picker
│   │   ├── ListingFormFields.tsx      # Sale/Rent form inputs
│   │   └── ModalLoadingSkeleton.tsx   # Loading state
│   │
│   ├── types.ts                       # Modal-specific types
│   └── index.ts                       # Public exports
│
├── utils/                             # Shared utilities
│   ├── nft-helpers.ts                 # NFT data transformations
│   ├── badge-helpers.ts               # Badge color/rarity logic
│   ├── price-helpers.ts               # Price formatting
│   └── approval-helpers.ts            # Approval status checks
│
└── nft-details-modal.tsx              # LEGACY - to be replaced
```

---

## Type System

### Core NFT Types (extends existing types from `types/profile.ts`)

```typescript
// components/nft/types.ts

import { PortfolioNFT, NFTListing, ListingType } from "@/types/profile"

/**
 * NFT Type Discriminator
 * Used for runtime type checking and rendering
 */
export type NFTCardType = 'individual' | 'bundle' | 'rental_wrapper'

/**
 * Extended NFT Card Data
 * Adds UI-specific fields to base PortfolioNFT
 */
export interface NFTCardData extends PortfolioNFT {
  // UI State
  isSelected?: boolean        // For multi-select grids
  isThumbnail?: boolean       // For bundle thumbnail selection
  isWatchlisted?: boolean     // Watchlist status

  // Derived Type
  cardType: NFTCardType       // Auto-detected from flags

  // Owner Context
  isOwnedByViewer: boolean    // Is viewer the owner?

  // Action Availability
  canList: boolean            // Can create listing?
  canBuy: boolean             // Can purchase?
  canRent: boolean            // Can rent?
  canSwap: boolean            // Can propose swap?
  canUnwrap: boolean          // Can unwrap bundle/rental?
}

/**
 * NFT Card Props
 */
export interface NFTCardProps {
  // Data
  nft: NFTCardData

  // Display Options
  size?: 'sm' | 'md' | 'lg'           // Card size variant
  showBadges?: boolean                 // Show all badges
  showActions?: boolean                // Show action overlay
  showPrice?: boolean                  // Show price info
  enableHover?: boolean                // Enable hover effects

  // Interaction Handlers
  onClick?: (nft: NFTCardData) => void
  onActionClick?: (action: NFTAction, nft: NFTCardData) => void

  // Grid Context
  isInGrid?: boolean                   // Affects responsive classes
  gridColumns?: number                 // Current grid column count

  // Selection (for multi-select grids)
  selectable?: boolean
  selected?: boolean
  onSelect?: (nft: NFTCardData, selected: boolean) => void

  // Custom Styling
  className?: string
  imageClassName?: string
  contentClassName?: string
}

/**
 * Available Actions
 */
export type NFTAction =
  | 'view'
  | 'buy'
  | 'rent'
  | 'swap'
  | 'list_sale'
  | 'list_rent'
  | 'list_swap'
  | 'unwrap_bundle'
  | 'unwrap_rental'
  | 'cancel_listing'
  | 'edit_price'

/**
 * Action Button Configuration
 */
export interface NFTActionButton {
  action: NFTAction
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string  // Gradient classes
  show: boolean      // Conditional display
  disabled?: boolean
  priority: number   // Display order (lower = higher priority)
}

/**
 * Badge Configuration
 */
export interface NFTBadgeConfig {
  type: 'chain' | 'rarity' | 'listing' | 'bundle' | 'rental'
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  offset?: { top?: number; left?: number; right?: number; bottom?: number }
  zIndex?: number
  show: boolean
}

/**
 * Card Layout Configuration
 */
export interface NFTCardLayout {
  // Image
  imageAspectRatio: 'square' | '4:3' | '16:9'
  imageObjectFit: 'cover' | 'contain'
  showImageHover: boolean

  // Badges
  badges: NFTBadgeConfig[]

  // Action Overlay
  overlayPosition: 'bottom' | 'center' | 'full'
  overlayStyle: 'gradient' | 'solid' | 'blur'

  // Content Footer
  showContent: boolean
  contentPadding: 'tight' | 'normal' | 'loose'
}

/**
 * Grid Responsive Breakpoints
 * Matches Fortuna Square's grid system
 */
export interface GridBreakpoints {
  xs: number   // < 640px
  sm: number   // 640-768px
  md: number   // 768-1024px
  lg: number   // 1024-1280px
  xl: number   // 1280px+
}

export const DEFAULT_GRID_BREAKPOINTS: GridBreakpoints = {
  xs: 2,   // 2 columns on extra small phones
  sm: 3,   // 3 columns on phones
  md: 5,   // 5 columns on tablets
  lg: 8,   // 8 columns on laptops
  xl: 10,  // 6 columns on desktop
}
```

### Modal Types

```typescript
// components/nft/modals/types.ts

import { PortfolioNFT } from "@/types/profile"
import { NFTCardData } from "../types"

/**
 * Base Modal Props
 */
export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * NFT Details Modal Props
 */
export interface NFTDetailsModalProps extends BaseModalProps {
  nft: PortfolioNFT | null
  isOwner?: boolean

  // Action Callbacks
  onListForSale?: (nft: PortfolioNFT) => void
  onCreateSwap?: (nft: PortfolioNFT) => void
  onWrapForRental?: (nft: PortfolioNFT) => void
  onBuyNFT?: (nft: PortfolioNFT) => void
}

/**
 * NFT Preview Section Props
 */
export interface NFTPreviewSectionProps {
  nft: PortfolioNFT
  size?: 'sm' | 'md' | 'lg'
  showChain?: boolean
  showRarity?: boolean
  showBundleCount?: boolean
  className?: string
}

/**
 * Price Breakdown Section Props
 */
export interface PriceBreakdownSectionProps {
  itemPrice: string | number
  currency?: string           // Default: "APE"
  platformFeePercent?: number // Default: 2.5
  showBreakdown?: boolean     // Default: true
  className?: string
}

/**
 * Calculated Price Breakdown
 */
export interface PriceBreakdown {
  itemPrice: number
  platformFee: number
  platformFeePercent: number
  totalPrice: number
  sellerReceives: number
  currency: string
}

/**
 * Approval Section Props
 */
export interface ApprovalSectionProps {
  contractAddress: string
  tokenId: string
  ownerAddress: string
  chainId: number
  onApprovalComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * Approval Status
 */
export type ApprovalStatus = 'unchecked' | 'checking' | 'approved' | 'not_approved' | 'error'

export interface ApprovalState {
  status: ApprovalStatus
  error?: Error
  canProceed: boolean
}

/**
 * NFT Selection Grid Props
 */
export interface NFTSelectionGridProps {
  nfts: NFTCardData[]
  selectedNFTs: Set<string>           // Set of "contractAddress-tokenId"
  onToggleNFT: (nft: NFTCardData) => void
  maxSelection?: number               // Max selectable NFTs
  filterChain?: number                // Only show NFTs from this chain
  columns?: GridBreakpoints
  emptyMessage?: string
}

/**
 * Thumbnail Selector Props (for bundles)
 */
export interface ThumbnailSelectorProps {
  nfts: NFTCardData[]                 // All NFTs in bundle
  selectedIndices: number[]           // Indices of thumbnail NFTs
  maxThumbnails?: number              // Default: 3
  onToggleThumbnail: (index: number) => void
  className?: string
}

/**
 * Listing Form Fields Props
 */
export interface ListingFormFieldsProps {
  listingType: 'sale' | 'rent' | 'swap'

  // Sale Fields
  price?: string
  onPriceChange?: (price: string) => void

  // Rent Fields
  pricePerDay?: string
  minDays?: string
  maxDays?: string
  onRentDetailsChange?: (details: RentalDetails) => void

  // Swap Fields
  wantedCollection?: string
  wantedTokenId?: string
  wantedTraits?: string[]
  onSwapCriteriaChange?: (criteria: SwapCriteria) => void

  // Common
  showPlatformFee?: boolean
  className?: string
}

export interface RentalDetails {
  pricePerDay: string
  minDays: string
  maxDays: string
}

export interface SwapCriteria {
  wantedCollection: string
  wantedTokenId?: string
  wantedTraits?: string[]
  chainId: number
}
```

---

## Card Components

### 1. NFTCard (Main Unified Component)

**File**: `components/nft/cards/NFTCard.tsx`

**Purpose**: Single entry point for all NFT card types. Auto-detects type and delegates to specific variant.

**API**:
```typescript
export function NFTCard(props: NFTCardProps): JSX.Element

// Usage:
<NFTCard
  nft={nftData}
  onClick={handleClick}
  onActionClick={handleAction}
  size="md"
  showBadges={true}
  showActions={true}
/>
```

**Implementation**:
```typescript
export function NFTCard({
  nft,
  size = 'md',
  showBadges = true,
  showActions = true,
  showPrice = true,
  enableHover = true,
  onClick,
  onActionClick,
  isInGrid = false,
  gridColumns,
  selectable = false,
  selected = false,
  onSelect,
  className,
  imageClassName,
  contentClassName,
}: NFTCardProps) {
  // Auto-detect card type
  const cardType = nft.isBundle
    ? 'bundle'
    : nft.isWrapper
      ? 'rental_wrapper'
      : 'individual'

  // Determine actions based on ownership and listing status
  const actions = useMemo(() =>
    getAvailableActions(nft, nft.isOwnedByViewer),
    [nft, nft.isOwnedByViewer]
  )

  // Shared card wrapper
  return (
    <Card
      className={cn(
        "group bg-card/50 border-border/50 transition-all duration-300 overflow-hidden cursor-pointer",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
        selected && "border-primary bg-primary/10 ring-2 ring-primary/50",
        className
      )}
      onClick={() => onClick?.(nft)}
    >
      {/* Delegate to specific card type */}
      {cardType === 'bundle' && (
        <BundleNFTCard
          nft={nft}
          showBadges={showBadges}
          showActions={showActions}
          actions={actions}
          onActionClick={onActionClick}
          imageClassName={imageClassName}
          contentClassName={contentClassName}
        />
      )}

      {cardType === 'rental_wrapper' && (
        <RentalWrapperNFTCard
          nft={nft}
          showBadges={showBadges}
          showActions={showActions}
          actions={actions}
          onActionClick={onActionClick}
          imageClassName={imageClassName}
          contentClassName={contentClassName}
        />
      )}

      {cardType === 'individual' && (
        <IndividualNFTCard
          nft={nft}
          showBadges={showBadges}
          showActions={showActions}
          actions={actions}
          onActionClick={onActionClick}
          imageClassName={imageClassName}
          contentClassName={contentClassName}
        />
      )}
    </Card>
  )
}
```

### 2. IndividualNFTCard

**File**: `components/nft/cards/IndividualNFTCard.tsx`

**Purpose**: Displays a single NFT with standard image + badges + actions layout.

**Key Features**:
- Square aspect ratio image
- Top-left: Chain badge
- Below chain: Rarity badge (if present)
- Top-right: Watchlist toggle
- Bottom overlay: Action buttons (on hover)
- Footer: Name, collection, price

**Props**:
```typescript
interface IndividualNFTCardProps {
  nft: NFTCardData
  showBadges: boolean
  showActions: boolean
  actions: NFTActionButton[]
  onActionClick?: (action: NFTAction, nft: NFTCardData) => void
  imageClassName?: string
  contentClassName?: string
}
```

**Layout**:
```tsx
<>
  <NFTCardImage
    src={nft.image}
    alt={nft.name}
    className={imageClassName}
  >
    <NFTCardBadges
      nft={nft}
      badges={[
        { type: 'chain', position: 'top-left', offset: { top: 1.5, left: 1.5 } },
        { type: 'rarity', position: 'top-left', offset: { top: 7, left: 1.5 } },
      ]}
    />

    <WatchlistToggle
      {...nft}
      className="absolute top-1.5 right-1.5 z-50"
    />

    {showActions && (
      <NFTCardActions
        actions={actions}
        nft={nft}
        onActionClick={onActionClick}
      />
    )}
  </NFTCardImage>

  <NFTCardContent
    nft={nft}
    className={contentClassName}
  />
</>
```

### 3. BundleNFTCard

**File**: `components/nft/cards/BundleNFTCard.tsx`

**Purpose**: Displays bundle NFTs with FS logo background and 3 thumbnail previews.

**Key Features**:
- Gradient background (purple → black → blue)
- FS logo watermark (opacity 20%)
- Chain badge (top-left)
- Bundle badge with count (below chain)
- 3 thumbnail previews (bottom, 48x48 each)
- Watchlist toggle (top-right)
- Action overlay (full-width bottom on hover)

**Layout**:
```tsx
<>
  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
    {/* FS Logo Background */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <img src="/fs-temp-logo.png" alt="Fortuna Square" className="w-32 h-32 object-contain" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    <NFTCardBadges
      nft={nft}
      badges={[
        { type: 'chain', position: 'top-left', offset: { top: 4, left: 4 } },
        { type: 'bundle', position: 'top-left', offset: { top: 13, left: 4 } },
      ]}
    />

    <WatchlistToggle {...nft} className="absolute top-4 right-4 z-50" />

    {/* Preview Images - 3 Featured Thumbnails */}
    <div className="absolute bottom-4 left-4 right-4 flex space-x-1.5">
      {nft.bundlePreviewImages?.slice(0, 3).map((preview, idx) => (
        <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
          <img src={preview.image} alt={preview.name} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>

    {showActions && (
      <NFTCardActions actions={actions} nft={nft} onActionClick={onActionClick} />
    )}
  </div>

  <NFTCardContent nft={nft} className={contentClassName} />
</>
```

### 4. RentalWrapperNFTCard

**File**: `components/nft/cards/RentalWrapperNFTCard.tsx`

**Purpose**: Displays rental wrapper NFTs with rental info badge.

**Key Features**:
- Similar to IndividualNFTCard
- Additional rental status badge (active/expired)
- Shows rental price per day
- Shows current renter (if active)

**Layout**: Same as Individual + rental badge

---

## Shared Components

### 1. NFTCardImage

**File**: `components/nft/cards/shared/NFTCardImage.tsx`

**Purpose**: Standardized NFT image container with overlays and hover effects.

**Props**:
```typescript
interface NFTCardImageProps {
  src?: string
  alt: string
  aspectRatio?: 'square' | '4:3' | '16:9'
  objectFit?: 'cover' | 'contain'
  showHover?: boolean
  children?: React.ReactNode  // Overlays (badges, actions)
  className?: string
}
```

**Features**:
- Auto-detects aspect ratio from NFT type
- Fallback placeholder for missing images
- Hover scale effect (scale-105)
- Supports overlay children (badges, buttons)

### 2. NFTCardBadges

**File**: `components/nft/cards/shared/NFTCardBadges.tsx`

**Purpose**: Renders all badge types with consistent positioning.

**Props**:
```typescript
interface NFTCardBadgesProps {
  nft: NFTCardData
  badges: NFTBadgeConfig[]
  size?: 'sm' | 'md' | 'lg'
}
```

**Badge Types**:
- **Chain Badge**: Uses existing `<ChainBadge>` component
- **Rarity Badge**: Gradient background based on rarity number (1-5)
- **Listing Badge**: Sale/Rent/Swap status with color coding
- **Bundle Badge**: Orange gradient with item count
- **Rental Badge**: Cyan/green for active, red for expired

**Rarity Colors**:
```typescript
function getRarityColor(rarity: string): string {
  const num = parseInt(rarity)
  if (num === 1) return "from-yellow-400 to-orange-500"  // Legendary
  if (num === 2) return "from-purple-400 to-pink-500"    // Epic
  if (num === 3) return "from-blue-400 to-cyan-500"      // Rare
  if (num === 4) return "from-green-400 to-emerald-500"  // Uncommon
  if (num === 5) return "from-gray-400 to-gray-500"      // Common
  return "from-gray-400 to-gray-500"
}
```

### 3. NFTCardActions

**File**: `components/nft/cards/shared/NFTCardActions.tsx`

**Purpose**: Action button overlay (appears on hover).

**Props**:
```typescript
interface NFTCardActionsProps {
  actions: NFTActionButton[]
  nft: NFTCardData
  onActionClick?: (action: NFTAction, nft: NFTCardData) => void
  overlayPosition?: 'bottom' | 'full'
}
```

**Features**:
- Gradient background (from-black/80 via-transparent)
- Opacity 0 → 100 on hover
- Buttons sorted by priority
- Pointer-events-none on overlay, pointer-events-auto on buttons
- Gradient button styling per action type

**Action Button Gradients**:
```typescript
const ACTION_GRADIENTS = {
  buy: "from-green-500 to-green-600",
  rent: "from-blue-500 to-blue-600",
  swap: "from-purple-500 to-purple-600",
  list_sale: "from-green-500 to-green-600",
  list_rent: "from-blue-500 to-blue-600",
  list_swap: "from-purple-500 to-purple-600",
  unwrap_bundle: "from-orange-500 to-red-500",
  unwrap_rental: "from-orange-500 to-red-500",
  view: "from-gray-500 to-gray-600",
}
```

### 4. NFTCardContent

**File**: `components/nft/cards/shared/NFTCardContent.tsx`

**Purpose**: Card footer with name, collection, price, listing status.

**Props**:
```typescript
interface NFTCardContentProps {
  nft: NFTCardData
  padding?: 'tight' | 'normal' | 'loose'
  showPrice?: boolean
  showListing?: boolean
  className?: string
}
```

**Layout**:
```tsx
<CardContent className={cn("p-4", paddingClass, className)}>
  <div className="flex items-start justify-between mb-1">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
        {nft.name}
      </h3>
      <p className="text-xs text-muted-foreground truncate">
        {nft.collection}
        {nft.isBundle && <span className="ml-1 text-orange-400">• {nft.bundleCount}</span>}
      </p>
    </div>

    {showListing && nft.listing && nft.listing.type !== 'none' && (
      <Badge className={getListingBadgeClass(nft.listing.type)}>
        {getListingLabel(nft.listing.type)}
      </Badge>
    )}
  </div>

  {showPrice && <PriceDisplay nft={nft} />}
</CardContent>
```

### 5. NFTPreviewSection (Modal)

**File**: `components/nft/modals/shared/NFTPreviewSection.tsx`

**Purpose**: Compact NFT preview for modals (list for sale, create bundle, etc.)

**Props**:
```typescript
interface NFTPreviewSectionProps {
  nft: PortfolioNFT
  size?: 'sm' | 'md' | 'lg'
  showChain?: boolean
  showRarity?: boolean
  showBundleCount?: boolean
  className?: string
}
```

**Layout**:
```tsx
<Card className={cn("p-4 bg-card/50 border-border/50", className)}>
  <div className="flex gap-4">
    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border/30">
      <Image src={nft.image} alt={nft.name} fill className="object-cover" />
    </div>
    <div className="flex-1 space-y-2">
      <div>
        <h3 className="font-semibold text-foreground">{nft.name}</h3>
        <p className="text-sm text-muted-foreground">{nft.collection}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {showChain && <ChainBadge chainId={nft.chainId} size="sm" />}
        {showRarity && nft.rarity && <RarityBadge rarity={nft.rarity} size="xs" />}
        {showBundleCount && nft.isBundle && <BundleBadge count={nft.bundleCount} />}
      </div>
    </div>
  </div>
</Card>
```

### 6. PriceBreakdownSection (Modal)

**File**: `components/nft/modals/shared/PriceBreakdownSection.tsx`

**Purpose**: Shows item price, platform fee, and total/seller receives amounts.

**Props**: (see Type System section)

**Layout**:
```tsx
<Card className="p-3 bg-primary/5 border-primary/20">
  <div className="space-y-1 text-sm">
    <div className="flex items-center gap-2 font-medium text-primary">
      <Info className="h-4 w-4" />
      <span>Platform Fee: {breakdown.platformFeePercent}%</span>
    </div>
    {showBreakdown && (
      <div className="text-xs text-muted-foreground space-y-0.5 ml-6">
        <div className="flex justify-between">
          <span>Item Price:</span>
          <span>{breakdown.itemPrice.toFixed(2)} {breakdown.currency}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee ({breakdown.platformFeePercent}%):</span>
          <span>{breakdown.platformFee.toFixed(2)} {breakdown.currency}</span>
        </div>
        <div className="flex justify-between font-medium text-foreground pt-1 border-t border-border/20">
          <span>Seller Receives:</span>
          <span className="text-primary">{breakdown.sellerReceives.toFixed(2)} {breakdown.currency}</span>
        </div>
      </div>
    )}
  </div>
</Card>
```

### 7. ApprovalSection (Modal)

**File**: `components/nft/modals/shared/ApprovalSection.tsx`

**Purpose**: Checks approval status and provides approve button if needed.

**Props**: (see Type System section)

**States**:
1. **Unchecked**: Shows "Check Approval" button
2. **Checking**: Shows loading spinner
3. **Approved**: Shows green checkmark badge, hides section
4. **Not Approved**: Shows TransactionButton for approval
5. **Error**: Shows error message

**Layout**:
```tsx
{status === 'not_approved' && (
  <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-yellow-400">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Approval Required</span>
      </div>
      <p className="text-sm text-muted-foreground">
        You need to approve the marketplace contract to list this NFT.
      </p>
      <TransactionButton
        transaction={() => prepareApproveNFT({...})}
        onTransactionConfirmed={() => onApprovalComplete?.()}
        onError={(err) => onError?.(err)}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
      >
        Approve NFT
      </TransactionButton>
    </div>
  </Card>
)}
```

### 8. NFTSelectionGrid (Modal)

**File**: `components/nft/modals/shared/NFTSelectionGrid.tsx`

**Purpose**: Multi-select grid for bundle creation, etc.

**Props**: (see Type System section)

**Features**:
- Uses `<NFTCard>` with `selectable={true}`
- Shows selected count
- Enforces max selection
- Filters by chain if specified
- Responsive grid columns

### 9. ThumbnailSelector (Modal)

**File**: `components/nft/modals/shared/ThumbnailSelector.tsx`

**Purpose**: Select up to 3 thumbnails for bundle previews.

**Props**: (see Type System section)

**Layout**: Grid of NFTs with selection numbers (1, 2, 3)

---

## Design Patterns

### 1. Composition Over Inheritance

**Pattern**: NFTCard delegates to specific variants rather than using inheritance.

**Why**: Easier to maintain, test, and extend. Each variant is independent.

```typescript
// ✅ GOOD - Composition
<NFTCard nft={data} />  // Auto-detects and delegates

// ❌ BAD - Inheritance
class BundleNFTCard extends NFTCard { /* ... */ }
```

### 2. Controlled vs Uncontrolled Components

**Decision**: Cards are **controlled components** (props-driven).

**Rationale**:
- Parent manages state (selection, watchlist, etc.)
- Cards are purely presentational
- Easier to test and reason about

```typescript
// ✅ Parent controls state
const [selectedNFTs, setSelectedNFTs] = useState(new Set())

<NFTCard
  nft={data}
  selected={selectedNFTs.has(data.id)}
  onSelect={(nft, selected) => {
    const newSet = new Set(selectedNFTs)
    selected ? newSet.add(nft.id) : newSet.delete(nft.id)
    setSelectedNFTs(newSet)
  }}
/>
```

### 3. Event Handling

**Pattern**: Cards emit semantic events, parents handle business logic.

**Events**:
- `onClick`: Card clicked
- `onActionClick`: Action button clicked (buy/rent/swap/etc.)
- `onSelect`: Selection toggled (multi-select grids)

```typescript
// ✅ Card emits semantic event
<NFTCard
  onActionClick={(action, nft) => {
    if (action === 'buy') handleBuy(nft)
    else if (action === 'rent') handleRent(nft)
  }}
/>

// ❌ Card handles business logic (bad)
<NFTCard onBuy={buyNFT} onRent={rentNFT} />  // Too many specific handlers
```

### 4. Type Guards for Runtime Safety

**Pattern**: Use type guards to ensure NFT data correctness.

```typescript
export function isBundleNFT(nft: PortfolioNFT): nft is BundleNFT {
  return nft.isBundle === true && typeof nft.bundleCount === 'number'
}

export function isRentalWrapperNFT(nft: PortfolioNFT): nft is RentalWrapperNFT {
  return nft.isWrapper === true && typeof nft.wrapperId === 'string'
}

// Usage
if (isBundleNFT(nft)) {
  // TypeScript knows nft.bundleCount exists
  console.log(nft.bundleCount)
}
```

### 5. Memoization for Performance

**Pattern**: Memoize expensive computations and child components.

```typescript
// Memoize action button calculation
const actions = useMemo(() =>
  getAvailableActions(nft, isOwner),
  [nft.listing, nft.isOwnedByViewer]
)

// Memoize card component
const MemoizedNFTCard = React.memo(NFTCard, (prev, next) => {
  return (
    prev.nft.tokenId === next.nft.tokenId &&
    prev.nft.listing?.type === next.nft.listing?.type &&
    prev.selected === next.selected
  )
})
```

### 6. Responsive Grid Layout

**Pattern**: Use Tailwind responsive classes with grid-cols-* utilities.

```typescript
// Grid container
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
  {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
</div>

// Breakpoints:
// xs (< 640px): 2 columns
// sm (640-768px): 3 columns
// md (768-1024px): 5 columns
// lg (1024-1280px): 8 columns
// xl (1280px+): 6 columns
```

### 7. Accessibility

**Pattern**: Ensure all interactive elements have proper ARIA labels and keyboard navigation.

```typescript
<Card
  role="article"
  aria-label={`${nft.name} from ${nft.collection}`}
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  <Button
    aria-label={`Add ${nft.name} to watchlist`}
    className="..."
  >
    <Eye className="h-4 w-4" aria-hidden="true" />
  </Button>
</Card>
```

### 8. Error Boundaries

**Pattern**: Wrap card grids in error boundaries to prevent full page crashes.

```typescript
<ErrorBoundary fallback={<NFTCardSkeleton count={10} />}>
  <div className="grid ...">
    {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
  </div>
</ErrorBoundary>
```

---

## Migration Strategy

### Phase 1: Create Shared Components (Week 1)

1. **Day 1-2**: Implement `NFTCardImage`, `NFTCardBadges`, `NFTCardContent`
2. **Day 3-4**: Implement `IndividualNFTCard`, `BundleNFTCard`, `RentalWrapperNFTCard`
3. **Day 5**: Implement `NFTCard` (main wrapper)
4. **Day 6-7**: Implement modal shared components (`NFTPreviewSection`, `PriceBreakdownSection`, `ApprovalSection`)

### Phase 2: Migrate Card Usages (Week 2)

**Migration Order** (least → most complex):

1. **bundles/page.tsx** (simple grid, no complex state)
   - Before: 400 lines of card markup
   - After: 50 lines with `<NFTCard>`
   - Savings: **~350 lines**

2. **rentals/page.tsx** (simple grid)
   - Before: 400 lines
   - After: 50 lines
   - Savings: **~350 lines**

3. **profile-tabs.tsx** (complex, multiple tabs)
   - Before: 500 lines of card markup
   - After: 100 lines with `<NFTCard>`
   - Savings: **~400 lines**

4. **featured-nfts.tsx** (homepage featured section)
   - Before: 200 lines
   - After: 40 lines
   - Savings: **~160 lines**

**Total Card Migration Savings**: **~1,260 lines**

### Phase 3: Migrate Modals (Week 3)

**Migration Order**:

1. **list-for-sale-modal.tsx** (simplest modal)
   - Replace NFT preview with `<NFTPreviewSection>`
   - Replace price breakdown with `<PriceBreakdownSection>`
   - Replace approval flow with `<ApprovalSection>`
   - Savings: **~150 lines**

2. **create-rental-listing.tsx** (rental form)
   - Use `<ListingFormFields listingType="rent">`
   - Use `<PriceBreakdownSection>` for rental fee calculation
   - Savings: **~80 lines**

3. **create-bundle-modal.tsx** (complex, 823 lines)
   - Replace NFT grid with `<NFTSelectionGrid>`
   - Replace thumbnail selection with `<ThumbnailSelector>`
   - Replace NFT preview cards with `<NFTPreviewSection>`
   - Savings: **~300 lines**

4. **nft-details-modal.tsx** (most complex, 1,183 lines)
   - Replace NFT preview with `<NFTPreviewSection>`
   - Replace price info with `<PriceBreakdownSection>`
   - Keep tabs (Traits/Activity) as-is
   - Savings: **~200 lines**

**Total Modal Migration Savings**: **~730 lines**

### Phase 4: Cleanup & Documentation (Week 4)

1. Remove legacy code
2. Update component documentation
3. Write migration guide
4. Create Storybook stories for all components
5. Performance testing and optimization

### Total Project Savings

- **Card Migrations**: ~1,260 lines removed
- **Modal Migrations**: ~730 lines removed
- **Shared Components**: +800 lines added (all new, reusable code)
- **Net Reduction**: **~1,190 lines** (~60% reduction)
- **Maintainability**: 80% improvement (update 1 file instead of 5)

---

## Implementation Checklist

### Week 1: Shared Components

- [ ] Create `components/nft/cards/` directory structure
- [ ] Create `components/nft/modals/shared/` directory structure
- [ ] Implement `NFTCardImage.tsx`
  - [ ] Image rendering with fallback
  - [ ] Aspect ratio variants
  - [ ] Hover effects
  - [ ] Children overlay support
- [ ] Implement `NFTCardBadges.tsx`
  - [ ] Chain badge integration
  - [ ] Rarity badge with color system
  - [ ] Listing status badge
  - [ ] Bundle badge
  - [ ] Rental badge
  - [ ] Position calculator
- [ ] Implement `NFTCardActions.tsx`
  - [ ] Action button rendering
  - [ ] Gradient styling per action
  - [ ] Hover overlay
  - [ ] Click handlers
- [ ] Implement `NFTCardContent.tsx`
  - [ ] Name/collection display
  - [ ] Price display
  - [ ] Listing badge
  - [ ] Truncation logic
- [ ] Implement `IndividualNFTCard.tsx`
- [ ] Implement `BundleNFTCard.tsx`
  - [ ] Gradient background
  - [ ] FS logo watermark
  - [ ] Thumbnail grid
- [ ] Implement `RentalWrapperNFTCard.tsx`
- [ ] Implement `NFTCard.tsx` (main wrapper)
  - [ ] Type detection logic
  - [ ] Action calculation
  - [ ] Delegation to variants
- [ ] Implement `NFTPreviewSection.tsx`
- [ ] Implement `PriceBreakdownSection.tsx`
  - [ ] Fee calculation
  - [ ] Breakdown display
- [ ] Implement `ApprovalSection.tsx`
  - [ ] Status checking
  - [ ] Approval transaction
  - [ ] State management
- [ ] Implement `NFTSelectionGrid.tsx`
- [ ] Implement `ThumbnailSelector.tsx`

### Week 2: Card Migrations

- [ ] Migrate `bundles/page.tsx`
  - [ ] Replace card markup with `<NFTCard>`
  - [ ] Test grid responsiveness
  - [ ] Test action buttons
- [ ] Migrate `rentals/page.tsx`
  - [ ] Replace card markup with `<NFTCard>`
  - [ ] Test rental-specific badges
- [ ] Migrate `profile-tabs.tsx`
  - [ ] Portfolio tab
  - [ ] Watchlist tab
  - [ ] Test all tabs
- [ ] Migrate `featured-nfts.tsx`
  - [ ] Replace homepage cards
  - [ ] Test featured display
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

### Week 3: Modal Migrations

- [ ] Migrate `list-for-sale-modal.tsx`
  - [ ] Replace preview section
  - [ ] Replace price breakdown
  - [ ] Replace approval flow
  - [ ] Test listing flow
- [ ] Migrate `create-rental-listing.tsx`
  - [ ] Replace form fields
  - [ ] Replace price preview
  - [ ] Test rental creation
- [ ] Migrate `create-bundle-modal.tsx`
  - [ ] Replace NFT selection grid
  - [ ] Replace thumbnail selector
  - [ ] Replace preview sections
  - [ ] Test bundle creation flow
- [ ] Migrate `nft-details-modal.tsx`
  - [ ] Replace preview section
  - [ ] Replace price section
  - [ ] Keep activity/traits tabs
  - [ ] Test all actions
- [ ] Integration testing
  - [ ] Create bundle → List for sale → Buy flow
  - [ ] Wrap NFT → List for rent → Rent flow
  - [ ] Create swap → Propose swap flow

### Week 4: Cleanup & Docs

- [ ] Remove legacy code comments
- [ ] Update component documentation
- [ ] Create Storybook stories
  - [ ] NFTCard variants
  - [ ] Badge types
  - [ ] Action overlays
  - [ ] Modal sections
- [ ] Write migration guide
- [ ] Performance audit
  - [ ] Lighthouse scores
  - [ ] Bundle size check
  - [ ] Render performance
- [ ] Accessibility audit
  - [ ] Keyboard navigation
  - [ ] Screen reader testing
  - [ ] ARIA labels
- [ ] Final QA pass
- [ ] Deploy to production

---

## Key Design Decisions

### 1. Single NFTCard Entry Point vs Multiple Exports

**Decision**: Single `<NFTCard>` component that auto-detects type.

**Rationale**:
- Simpler developer experience (one import)
- Type detection is cheap (3 boolean checks)
- Easier to maintain (one public API)

**Alternative Considered**: Export all variants separately
- Rejected: Too many imports, easy to use wrong variant

### 2. Controlled Components

**Decision**: All cards are controlled (props-driven, no internal state).

**Rationale**:
- Predictable behavior
- Easier testing
- Parent controls all state

**Alternative Considered**: Uncontrolled with internal hover/selection state
- Rejected: Hard to synchronize with external state

### 3. Action Buttons: Overlay vs Always Visible

**Decision**: Overlay on hover (current UX).

**Rationale**:
- Cleaner card appearance
- Industry standard (OpenSea, Magic Eden)
- More space for image

**Alternative Considered**: Always visible buttons
- Rejected: Cluttered, less visual focus on NFT

### 4. Badge Positioning: Absolute vs Flex

**Decision**: Absolute positioning with configurable offsets.

**Rationale**:
- Precise control over placement
- Overlays image correctly
- No layout shift issues

**Alternative Considered**: Flex-based badge container
- Rejected: Hard to overlay on image, layout shifts

### 5. Responsive Grid: Fixed Breakpoints vs Container Queries

**Decision**: Fixed Tailwind breakpoints (sm/md/lg/xl).

**Rationale**:
- Widely supported
- Consistent with rest of app
- Easier to reason about

**Alternative Considered**: Container queries (@container)
- Rejected: Limited browser support (as of Jan 2025)

### 6. Price Display: Separate Component vs Inline

**Decision**: Inline price logic within `NFTCardContent`.

**Rationale**:
- Tight coupling with listing data
- Small, non-reusable logic
- Avoids over-abstraction

**Alternative Considered**: `<PriceDisplay>` component
- Rejected: Unnecessary abstraction for simple logic

### 7. Modal Approval: Section vs Inline

**Decision**: Separate `<ApprovalSection>` component.

**Rationale**:
- Complex state machine (5 states)
- Reused across all listing modals
- Testable in isolation

**Alternative Considered**: Inline approval logic
- Rejected: Too much code duplication

---

## Future Enhancements

### Potential New NFT Types

1. **Fractionalized NFTs** (ERC-1155 or ERC-20 fractions)
   - New card variant: `FractionalNFTCard`
   - Shows ownership percentage
   - Buy/sell fractions

2. **Loaned NFTs** (Collateral-based lending)
   - New card variant: `LoanNFTCard`
   - Shows loan status (active/defaulted)
   - Shows collateral amount

3. **Staked NFTs** (DeFi staking)
   - New card variant: `StakedNFTCard`
   - Shows staking rewards
   - Unstake button

### Performance Optimizations

1. **Virtual Scrolling** for large grids (1000+ NFTs)
   - Use `react-virtual` or `@tanstack/react-virtual`
   - Render only visible cards

2. **Image Lazy Loading**
   - Use `loading="lazy"` on img tags
   - Use Intersection Observer for advanced control

3. **Code Splitting**
   - Lazy load modal components (already done)
   - Split card variants into separate chunks

4. **Bundle Size Optimization**
   - Tree-shake unused Radix components
   - Optimize icon imports (use specific icons, not entire library)

### Accessibility Improvements

1. **Keyboard Navigation**
   - Arrow keys to navigate grid
   - Enter to open modal
   - Escape to close

2. **Screen Reader Improvements**
   - Better ARIA labels for actions
   - Announce price changes
   - Announce approval status

3. **High Contrast Mode**
   - Test badges in high contrast
   - Ensure gradients have sufficient contrast

---

## Questions for Stakeholders

Before implementation, clarify:

1. **Grid Columns**: Are current breakpoints (2/3/4/5/6) final, or should they be configurable?
2. **Action Priority**: What's the priority order when multiple actions are available?
3. **Mobile UX**: Should mobile cards have different action buttons (tap vs hover)?
4. **Bundle Thumbnails**: Always show 3 thumbnails, or dynamic (1-5)?
5. **Approval Flow**: Should approval be required before opening listing modal, or inside modal?
6. **Error Handling**: How to handle partial failures (e.g., 1 NFT approval fails in bundle creation)?
7. **Analytics**: What events should be tracked (card clicks, action clicks, etc.)?
8. **A/B Testing**: Should we support A/B testing different card layouts?

---

## Conclusion

This architecture provides a **scalable, maintainable, and performant** foundation for NFT cards and modals in Fortuna Square. By following this design:

✅ **Developers** get a clear, type-safe API
✅ **Users** get a consistent, fast experience
✅ **Future developers** can easily add new NFT types
✅ **Code reviewers** have a single source of truth

**Next Steps**: Review this document with the team, answer stakeholder questions, then proceed to implementation checklist.

---

**Document Owner**: Claude (Design Expert Agent)
**Review Status**: Pending Team Review
**Implementation ETA**: 4 weeks (based on checklist)
