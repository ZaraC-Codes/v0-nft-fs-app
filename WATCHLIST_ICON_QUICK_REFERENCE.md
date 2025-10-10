# WatchlistToggle Component - Quick Reference Guide

**Component:** `components/profile/add-to-watchlist.tsx`
**Last Updated:** 2025-10-10

---

## Quick Start

### Import

```tsx
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
```

### Basic Usage

```tsx
<WatchlistToggle
  contractAddress={nft.contractAddress}
  tokenId={nft.tokenId}
  name={nft.name}
  collection={nft.collection}
  image={nft.image}
  chainId={nft.chainId}
/>
```

### With Custom Styling

```tsx
<WatchlistToggle
  contractAddress={nft.contractAddress}
  tokenId={nft.tokenId}
  name={nft.name}
  collection={nft.collection}
  image={nft.image}
  chainId={nft.chainId}
  className="bg-black/50 hover:bg-black/70 text-white"
/>
```

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contractAddress` | `string` | ✅ Yes | NFT contract address |
| `tokenId` | `string` | ✅ Yes | NFT token ID |
| `name` | `string` | ✅ Yes | NFT name (for toast/aria-label) |
| `collection` | `string` | ✅ Yes | Collection name |
| `image` | `string` | ❌ No | NFT image URL (optional) |
| `chainId` | `number` | ✅ Yes | Chain ID (e.g., 1 for Ethereum) |
| `className` | `string` | ❌ No | Additional CSS classes |

---

## Icon States

### Not in Watchlist (Default)
- **Icon:** Outline eye (not filled)
- **Color:** Gray (`text-muted-foreground`)
- **Hover:** Cyan with subtle glow, scale 105%
- **Background:** Semi-transparent black (`bg-black/10`)

### In Watchlist (Active)
- **Icon:** Filled eye (`fill-current`)
- **Color:** Cyan (`text-primary`)
- **Hover:** Brighter cyan glow, scale 110%
- **Glow:** `drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]`

### Loading
- **Icon:** Spinning loader (replaces eye)
- **Button:** Disabled (`opacity-50`, `pointer-events-none`)

---

## Responsive Sizing

| Breakpoint | Button Size | Icon Size |
|------------|-------------|-----------|
| Mobile (<768px) | `h-12 w-12` (48px) | `h-5 w-5` (20px) |
| Tablet (768-1023px) | `h-10 w-10` (40px) | `h-4 w-4` (16px) |
| Desktop (≥1024px) | `h-8 w-8` (32px) | `h-4 w-4` (16px) |

---

## Common Usage Patterns

### In NFT Card (Absolute Positioning)

```tsx
<div className="relative">
  {/* NFT Image */}
  <img src={nft.image} alt={nft.name} />

  {/* Watchlist Toggle - Top Right */}
  <div className="absolute top-1.5 right-1.5 z-50">
    <WatchlistToggle
      contractAddress={nft.contractAddress}
      tokenId={nft.tokenId}
      name={nft.name}
      collection={nft.collection}
      image={nft.image}
      chainId={nft.chainId}
      className="bg-black/50 hover:bg-black/70 text-white"
    />
  </div>
</div>
```

### In Modal Header

```tsx
<DialogHeader>
  <DialogTitle className="flex items-center justify-between">
    <span>{nft.name}</span>
    <WatchlistToggle
      contractAddress={nft.contractAddress}
      tokenId={nft.tokenId}
      name={nft.name}
      collection={nft.collection}
      image={nft.image}
      chainId={nft.chainId}
    />
  </DialogTitle>
</DialogHeader>
```

### In Bundle Card

```tsx
<div className="relative aspect-square bg-gradient-to-br from-purple-900 via-black to-blue-900">
  {/* Bundle Content */}

  {/* Watchlist Toggle */}
  <div className="absolute top-4 right-4 z-50">
    <WatchlistToggle
      contractAddress={bundle.contractAddress}
      tokenId={bundle.tokenId}
      name={bundle.name}
      collection="Fortuna Square Bundle NFTs"
      image={bundle.image}
      chainId={bundle.chainId}
      className="bg-black/50 hover:bg-black/70 text-white"
    />
  </div>
</div>
```

---

## Styling Guidelines

### Safe className Overrides

✅ **Recommended:**
```tsx
className="bg-black/50 hover:bg-black/70 text-white"
className="bg-gray-900/60 hover:bg-gray-900/80"
className="text-blue-400 hover:text-blue-300"
```

❌ **Avoid:**
```tsx
className="h-4 w-4"           // Breaks responsive sizing
className="hidden"            // Hides icon
className="opacity-0"         // Makes invisible
className="pointer-events-none" // Disables interaction
```

### Background Recommendations

| Card Background | Recommended className |
|-----------------|----------------------|
| Light images | `bg-black/50 hover:bg-black/70 text-white` |
| Dark images | `bg-white/20 hover:bg-white/30 text-white` |
| Gradient | `bg-black/50 hover:bg-black/70 text-white` |
| No background | Leave default (auto-adjusts) |

---

## Accessibility

### Automatically Included

- ✅ `aria-label`: "Add/Remove [NFT name] from watchlist"
- ✅ `aria-pressed`: `true` when in watchlist, `false` otherwise
- ✅ `title`: Tooltip on hover
- ✅ Keyboard navigation: Tab, Enter, Space all supported
- ✅ Focus ring: Visible on keyboard focus
- ✅ Disabled state: Properly communicated to screen readers

### What You Don't Need to Add

- ❌ `role="button"` (already a `<button>`)
- ❌ `tabIndex` (automatically focusable)
- ❌ `onClick` with keyboard handlers (already handled)

---

## Event Handling

### Click Behavior

The component automatically:
- ✅ Stops event propagation (`e.stopPropagation()`)
- ✅ Prevents default (`e.preventDefault()`)
- ✅ Shows loading state during API call
- ✅ Displays success/error toast
- ✅ Updates local state optimistically
- ✅ Checks authentication before action

### Parent Card onClick

```tsx
<div onClick={() => openModal(nft)}>
  {/* ... card content ... */}

  {/* This won't trigger card onClick */}
  <WatchlistToggle {...props} />
</div>
```

**Why it works:** `stopPropagation()` prevents bubbling to parent

---

## Common Pitfalls

### ❌ Don't Do This

```tsx
// 1. Using inline Eye icon
<button onClick={handleWatchlist}>
  <Eye className="h-4 w-4" />
</button>

// 2. Wrapping in extra div with pointer-events
<div className="pointer-events-none">
  <WatchlistToggle {...props} />
</div>

// 3. Overriding z-index
<WatchlistToggle className="z-0" {...props} />

// 4. Missing required props
<WatchlistToggle
  contractAddress={nft.contractAddress}
  // Missing: tokenId, name, collection, chainId
/>
```

### ✅ Do This

```tsx
// 1. Use WatchlistToggle component
<WatchlistToggle {...allRequiredProps} />

// 2. Ensure clickable with proper z-index
<div className="absolute top-2 right-2 z-50">
  <WatchlistToggle {...props} />
</div>

// 3. Pass all required props
<WatchlistToggle
  contractAddress={nft.contractAddress}
  tokenId={nft.tokenId}
  name={nft.name}
  collection={nft.collection}
  chainId={nft.chainId}
  // image is optional
/>
```

---

## Testing Checklist

Before deploying changes:

- [ ] Icon displays at correct size (check all breakpoints)
- [ ] Icon clickable (doesn't trigger parent card click)
- [ ] State persists across navigation
- [ ] Toast notifications appear
- [ ] Loading state shows spinner
- [ ] Hover effects work on desktop
- [ ] Touch target adequate on mobile (48x48px)
- [ ] Keyboard navigation works (Tab → Enter/Space)
- [ ] Screen reader announces state correctly
- [ ] Works on light and dark NFT images

---

## Troubleshooting

### Issue: Icon not clickable

**Cause:** Parent element has `pointer-events-none` or z-index conflict

**Solution:**
```tsx
<div className="absolute top-2 right-2 z-50">
  <WatchlistToggle {...props} />
</div>
```

### Issue: Icon hidden/cut off

**Cause:** Parent container has `overflow-hidden` or incorrect positioning

**Solution:**
```tsx
<div className="relative"> {/* Must have 'relative' */}
  <div className="absolute top-2 right-2 z-50">
    <WatchlistToggle {...props} />
  </div>
</div>
```

### Issue: Icon too small on mobile

**Cause:** Custom className overriding responsive sizing

**Solution:** Remove any `h-*` or `w-*` classes from `className` prop

### Issue: State not persisting

**Cause:** Profile provider not wrapping component tree

**Solution:** Ensure `<ProfileProvider>` in layout or page component

---

## Related Components

### Full Button Version

Use `AddToWatchlist` (not `WatchlistToggle`) for larger UI:

```tsx
import { AddToWatchlist } from "@/components/profile/add-to-watchlist"

<AddToWatchlist
  contractAddress={nft.contractAddress}
  tokenId={nft.tokenId}
  name={nft.name}
  collection={nft.collection}
  image={nft.image}
  chainId={nft.chainId}
/>
```

**Renders:** `[Eye Icon] Add to Watchlist` button

---

## API Integration

### Backend Endpoints

**Add to Watchlist:**
- Endpoint: `POST /api/profile/watchlist/add`
- Body: `{ contractAddress, tokenId, name, collection, image, chainId }`

**Remove from Watchlist:**
- Endpoint: `POST /api/profile/watchlist/remove`
- Body: `{ id: "${contractAddress}-${tokenId}" }`

### Profile Provider Methods

```tsx
const {
  addToWatchlist,      // (item) => Promise<void>
  removeFromWatchlist, // (id) => Promise<void>
  isInWatchlist,       // (contractAddress, tokenId) => boolean
  loading,             // boolean
  userProfile          // UserProfile | null
} = useProfile()
```

---

## Version History

**v2.0 (2025-10-10):**
- Replaced Radix UI Button with native `<button>`
- Added responsive sizing (mobile/tablet/desktop)
- Enhanced hover states with glow effects
- Improved accessibility (aria-label, aria-pressed)
- Fixed z-index and pointer-events issues

**v1.0 (Initial):**
- Basic watchlist toggle functionality
- Radix UI Button component
- Basic styling

---

## Support

**Documentation:**
- Full Test Plan: `WATCHLIST_ICON_TEST_PLAN.md`
- Verification Script: `scripts/verify-watchlist-icons.ts`

**Run Verification:**
```bash
npx tsx scripts/verify-watchlist-icons.ts
```

**Report Issues:**
- Check console for errors
- Verify all required props passed
- Ensure ProfileProvider wraps component
- Test in incognito (rule out cache issues)

---

**Quick Links:**
- [Component Source](c:\Users\zarac\v0-nft-fs-app\components\profile\add-to-watchlist.tsx)
- [Profile Provider](c:\Users\zarac\v0-nft-fs-app\components\profile\profile-provider.tsx)
- [Test Plan](c:\Users\zarac\v0-nft-fs-app\WATCHLIST_ICON_TEST_PLAN.md)
