# Watchlist Icon Test Plan
**Component Updated:** `WatchlistToggle` in `components/profile/add-to-watchlist.tsx`

**Last Updated:** 2025-10-10

---

## Executive Summary

This test plan verifies that the `WatchlistToggle` component consistently displays the Eye icon across all usage locations after recent updates. The component now uses a centralized icon implementation with proper responsive sizing, hover states, and accessibility features.

---

## 1. Automated Verification

### 1.1 Component Usage Search

**Status:** ✅ VERIFIED

**WatchlistToggle Import Locations (8 files):**
```
✅ components/profile/add-to-watchlist.tsx (component definition)
✅ components/nft/cards/BundleNFTCard.tsx
✅ components/nft/cards/IndividualNFTCard.tsx
✅ components/nft/cards/RentalWrapperNFTCard.tsx
✅ app/collections/page.tsx
✅ components/nft/nft-details-modal.tsx
✅ components/profile/profile-tabs.tsx
✅ app/bundles/page.tsx
✅ components/featured-nfts.tsx
```

### 1.2 Inline Eye Icon Detection

**Status:** ✅ VERIFIED

**Non-Watchlist Eye Icon Usage (legitimate uses):**
```
✅ app/treasury/page.tsx:665 - Verified member badge (unrelated)
✅ app/portfolio/page.tsx:166 - View count display (unrelated)
✅ app/collections/page.tsx:938 - Activity icon for "offer" type (unrelated)
✅ app/bundles/page.tsx:551, 556, 805 - View/preview buttons (unrelated)
✅ components/watchlist/watchlist-page.tsx:169 - Empty state icon (unrelated)
✅ components/transaction-summary.tsx:65 - Transaction type icon (unrelated)
✅ app/admin/page.tsx:309, 311 - Show/hide toggle (password field, unrelated)
✅ components/auth/login-form.tsx:121, 123 - Show/hide toggle (password field, unrelated)
✅ components/profile/profile-tabs.tsx:333 - Empty watchlist state (unrelated)
✅ components/nft/related-nfts.tsx:174 - View count (unrelated)
✅ components/featured-nfts.tsx:174 - View count (unrelated)
✅ components/nft/nft-detail.tsx:151 - Empty state (unrelated)
```

**Finding:** ✅ No inline Eye icons used for watchlist functionality outside `WatchlistToggle`

### 1.3 className Override Detection

**className Usage on WatchlistToggle (all files):**
```
✅ IndividualNFTCard.tsx:98 - "bg-black/50 hover:bg-black/70 text-white"
✅ BundleNFTCard.tsx:108 - "bg-black/50 hover:bg-black/70 text-white"
✅ RentalWrapperNFTCard.tsx:102 - "bg-black/50 hover:bg-black/70 text-white"
✅ featured-nfts.tsx:137 - "bg-black/50 hover:bg-black/70 text-white"
✅ profile-tabs.tsx:387 - "bg-black/50 hover:bg-black/70 text-white"
✅ nft-details-modal.tsx:472 - No custom className (uses defaults)
```

**Analysis:** ✅ All className overrides only affect background/text colors, NOT icon sizing or structure

---

## 2. Manual Testing Checklist

### 2.1 Pages with WatchlistToggle

**Primary Test Pages:**

#### A. Home Page (`/`)
- **Component:** `featured-nfts.tsx`
- **Location:** Top-right of each featured NFT card
- **Card Size:** Standard
- **Background:** Variable (depends on NFT image)

**Test Cases:**
- [ ] Icon displays at correct size (h-5 w-5 on mobile, h-4 w-4 on desktop)
- [ ] Icon has semi-transparent black background
- [ ] Icon is cyan when NFT is in watchlist (filled eye)
- [ ] Icon is muted gray when NFT not in watchlist (outline eye)
- [ ] Hover: Icon scales to 110% (in watchlist) or 105% (not in watchlist)
- [ ] Hover: Cyan glow effect appears
- [ ] Click: Adds/removes NFT from watchlist
- [ ] Click: Toast notification appears with correct message

#### B. Collections Page (`/collections`)
- **Component:** `NFTCardGrid` → `IndividualNFTCard`
- **Location:** Top-right of each NFT card in grid
- **Card Size:** Varies (micro, compact, standard based on grid settings)

**Test Cases:**
- [ ] Icon displays at correct size for each card size:
  - Micro: h-12 w-12 (mobile), h-10 w-10 (tablet), h-8 w-8 (desktop)
  - Compact: h-12 w-12 (mobile), h-10 w-10 (tablet), h-8 w-8 (desktop)
  - Standard: h-12 w-12 (mobile), h-10 w-10 (tablet), h-8 w-8 (desktop)
- [ ] Icon is clickable on all card sizes
- [ ] Icon doesn't overlap with chain badge or rarity badge
- [ ] Icon maintains proper z-index (z-50) over card content
- [ ] Multiple icons on same page work independently

#### C. Collection Detail Page (`/collections/[slug]`)
- **Component:** `NFTCardGrid` → `IndividualNFTCard` / `BundleNFTCard` / `RentalWrapperNFTCard`
- **Location:** Top-right of each NFT/bundle/rental card
- **Card Size:** Varies based on view mode

**Test Cases:**
- [ ] **Individual NFTs:** Icon displays on regular NFT cards
- [ ] **Bundle NFTs:** Icon displays on bundle cards (purple gradient background)
- [ ] **Rental Wrapper NFTs:** Icon displays on rental cards
- [ ] Icon maintains consistent position across different card types
- [ ] Icon visible on dark gradient backgrounds (bundle cards)
- [ ] Icon visible on light NFT images

#### D. Profile Page (`/profile/[username]`)
- **Component:** `profile-tabs.tsx` → `NFTCardGrid`
- **Tabs:** Portfolio, On Sale, Watchlist
- **Location:** Top-right of each NFT card

**Test Cases:**
- [ ] **Portfolio Tab:** Icon displays on owned NFTs
- [ ] **On Sale Tab:** Icon displays on listed NFTs
- [ ] **Watchlist Tab:** Icon displays (always filled) on watchlisted items
- [ ] Empty watchlist state shows correct Eye icon (h-12 w-12, non-interactive)
- [ ] Icon state persists across tab switches
- [ ] Removing item from watchlist updates Watchlist tab count

#### E. Bundles Page (`/bundles`)
- **Component:** Direct WatchlistToggle usage (not via cards)
- **Location:** In bundle detail cards
- **Note:** May have additional Eye icons for view counts (separate from watchlist)

**Test Cases:**
- [ ] WatchlistToggle icon distinct from view count icons
- [ ] Icon displays on bundle preview cards
- [ ] Icon clickable without interfering with card click
- [ ] Background overlay doesn't obscure icon

#### F. NFT Details Modal
- **Component:** `nft-details-modal.tsx`
- **Location:** Dialog header, next to NFT title
- **Size:** Standard button size (no custom className)

**Test Cases:**
- [ ] Icon displays in modal header
- [ ] Icon uses default styling (no custom background)
- [ ] Icon state reflects current watchlist status
- [ ] Modal can be opened from any page, icon works consistently
- [ ] Icon updates when toggled in modal

### 2.2 Icon State Verification

**For EACH page above, verify these states:**

#### Default State (Not in Watchlist)
- [ ] Eye icon: Outline only (not filled)
- [ ] Color: text-muted-foreground (gray)
- [ ] Background: bg-black/10 with custom overrides where applicable
- [ ] Hover: Transitions to cyan with glow
- [ ] Aria-label: "Add [NFT name] to watchlist"
- [ ] Title attribute: "Add to watchlist"

#### Active State (In Watchlist)
- [ ] Eye icon: Filled (fill-current applied)
- [ ] Color: text-primary (cyan)
- [ ] Drop shadow: cyan glow (0_0_8px_rgba(0,255,255,0.6))
- [ ] Hover: Brighter glow + 110% scale
- [ ] Aria-label: "Remove [NFT name] from watchlist"
- [ ] Title attribute: "Remove from watchlist"
- [ ] Aria-pressed: true

#### Loading State
- [ ] Loader2 icon replaces Eye icon
- [ ] Spinner animates continuously
- [ ] Button disabled (pointer-events-none, opacity-50)
- [ ] Cannot be clicked while loading

#### Interaction States
- [ ] **Click:** Active scale animation (scale-95)
- [ ] **Focus:** Ring appears (ring-2 ring-primary)
- [ ] **Disabled:** Reduced opacity, no hover effects

### 2.3 Responsive Behavior

**Desktop (≥1024px):**
- [ ] Icon: h-8 w-8 (32px)
- [ ] Eye icon within: h-4 w-4 (16px)
- [ ] Hover: Smooth scale transition
- [ ] Cursor: pointer

**Tablet (768px - 1023px):**
- [ ] Icon: h-10 w-10 (40px)
- [ ] Eye icon within: h-4 w-4 (16px)
- [ ] Hover: Smooth scale transition
- [ ] Touch target: Adequate (40px minimum)

**Mobile (<768px):**
- [ ] Icon: h-12 w-12 (48px)
- [ ] Eye icon within: h-5 w-5 (20px)
- [ ] Touch target: Large enough for finger taps
- [ ] No hover effects (touch device)
- [ ] Active state visible on tap

---

## 3. Edge Cases

### 3.1 Visual Contrast Testing

**Light NFT Images (white/pastel backgrounds):**
- [ ] Icon visible with bg-black/50 semi-transparent background
- [ ] Cyan color contrasts sufficiently
- [ ] Glow effect visible

**Dark NFT Images (black/dark backgrounds):**
- [ ] Icon visible with bg-black/50 semi-transparent background
- [ ] Cyan color stands out
- [ ] Glow effect enhances visibility

**Colorful NFT Images (vibrant backgrounds):**
- [ ] Icon doesn't clash with background colors
- [ ] Semi-transparent black provides consistent backdrop
- [ ] Hover state clearly indicates interactivity

**Bundle Cards (gradient backgrounds):**
- [ ] Icon visible on purple-black-blue gradient
- [ ] Doesn't interfere with FS logo watermark
- [ ] Maintains position over thumbnails

### 3.2 Multiple Icons on Same Page

**Collections Grid (20+ NFTs):**
- [ ] All icons render correctly
- [ ] No performance issues with many icons
- [ ] Each icon tracks independent state
- [ ] Clicking one icon doesn't affect others
- [ ] Watchlist state updates correctly for each

**Mixed Card Types:**
- [ ] Individual + Bundle + Rental cards on same page
- [ ] Icons consistent across card types
- [ ] No z-index conflicts between different card layouts

### 3.3 State Persistence

**Cross-Page Navigation:**
- [ ] Add NFT to watchlist on home page → navigate to collections → icon shows active state
- [ ] Remove NFT from watchlist on profile → navigate to collection detail → icon shows inactive state

**Page Refresh:**
- [ ] Add NFT to watchlist → refresh page → icon still shows active state
- [ ] Watchlist state loaded from database on mount

**Multi-Tab Sync (Advanced):**
- [ ] Add NFT to watchlist in Tab A
- [ ] Switch to Tab B
- [ ] Icon state may not sync immediately (expected, requires polling)
- [ ] After manual refresh in Tab B, state syncs correctly

**Authentication State:**
- [ ] Logged out: Icon displays correctly (click shows "Login Required" toast)
- [ ] Logged in: Icon functional, adds/removes from watchlist
- [ ] Login → Logout → Login: Watchlist state persists for user

### 3.4 Interaction Edge Cases

**Rapid Clicking:**
- [ ] Click icon rapidly 3+ times
- [ ] Only first click processes (button disabled during loading)
- [ ] No duplicate API calls
- [ ] State settles to correct final value

**Click During Card Navigation:**
- [ ] Click icon on NFT card
- [ ] Card's onClick handler doesn't trigger
- [ ] stopPropagation works correctly
- [ ] Modal doesn't open when clicking icon

**Touch Device Precision:**
- [ ] Icon tappable without accidentally clicking card
- [ ] Touch target size adequate (48x48px minimum on mobile)
- [ ] No double-tap issues
- [ ] Active state visible on tap (scale-95 animation)

---

## 4. Regression Testing

### 4.1 Core Watchlist Functionality

**Backend Integration:**
- [ ] API call succeeds when adding to watchlist
  - POST `/api/profile/watchlist/add` returns 200
  - NFT data correctly sent (contractAddress, tokenId, name, collection, image, chainId)
- [ ] API call succeeds when removing from watchlist
  - POST `/api/profile/watchlist/remove` returns 200
  - Correct watchlist item ID sent
- [ ] Error handling: API failure shows error toast
- [ ] Rate limiting: Excessive requests handled gracefully

**Database Sync:**
- [ ] Added NFT appears in Supabase `watchlist_items` table
- [ ] Removed NFT deleted from `watchlist_items` table
- [ ] User ID correctly associated with watchlist items
- [ ] No duplicate entries for same NFT

**Profile Provider Integration:**
- [ ] `addToWatchlist()` updates local state immediately
- [ ] `removeFromWatchlist()` updates local state immediately
- [ ] `isInWatchlist()` returns correct boolean
- [ ] Watchlist count updates in header/profile

### 4.2 Toast Notifications

**Success Messages:**
- [ ] Add: "Added to Watchlist" title + "[NFT name] has been added to your watchlist."
- [ ] Remove: "Removed from Watchlist" title + "[NFT name] has been removed from your watchlist."
- [ ] Toast appears in correct position (typically bottom-right)
- [ ] Toast auto-dismisses after ~3 seconds

**Error Messages:**
- [ ] API failure: "Error" title + "Failed to update watchlist. Please try again." (destructive variant)
- [ ] Not logged in: "Login Required" title + "Please log in to add items to your watchlist." (destructive variant)
- [ ] Toast remains visible long enough to read

### 4.3 Accessibility

**Keyboard Navigation:**
- [ ] Tab key focuses watchlist icon button
- [ ] Enter key toggles watchlist (same as click)
- [ ] Space key toggles watchlist (same as click)
- [ ] Focus ring visible (ring-2 ring-primary)
- [ ] Focus order logical (after card, before next card)

**Screen Reader Support:**
- [ ] aria-label announces correct state ("Add to watchlist" / "Remove from watchlist")
- [ ] aria-pressed indicates active state (true when in watchlist)
- [ ] Button role correctly interpreted
- [ ] State changes announced after toggle
- [ ] NFT name included in announcement

**Semantic HTML:**
- [ ] Uses `<button>` element (not div with onClick)
- [ ] `disabled` attribute set during loading
- [ ] `title` attribute provides tooltip
- [ ] Icon has `aria-hidden="true"` (decorative, text in aria-label)

---

## 5. Acceptance Criteria

**Component passes if ALL of the following are true:**

### Visual Consistency
- ✅ Eye icon displays at correct sizes across all pages
- ✅ Icon responsive sizing works (mobile: 48px, tablet: 40px, desktop: 32px)
- ✅ Filled eye when in watchlist, outline eye when not in watchlist
- ✅ Cyan glow effect visible on hover and active states
- ✅ Icon visible on all background types (light, dark, gradient)

### Functional Correctness
- ✅ Clicking icon adds/removes NFT from watchlist
- ✅ State persists across page navigation
- ✅ State syncs with database (verified in Supabase)
- ✅ Toast notifications appear with correct messages
- ✅ Loading state prevents duplicate requests

### User Experience
- ✅ Icon clickable without triggering card navigation
- ✅ Touch targets adequate on mobile (48x48px minimum)
- ✅ Hover effects smooth and responsive on desktop
- ✅ No z-index conflicts with other card elements
- ✅ Multiple icons on same page work independently

### Accessibility
- ✅ Keyboard navigation fully functional
- ✅ Screen readers announce state correctly
- ✅ Focus ring visible and properly styled
- ✅ ARIA attributes correct (aria-label, aria-pressed)

### Performance
- ✅ No performance issues with 20+ icons on page
- ✅ State updates instantaneous (optimistic UI)
- ✅ No memory leaks or unnecessary re-renders

---

## 6. Test Execution Log

**Test Date:** _____________________
**Tester:** _____________________
**Browser/Device:** _____________________

### Quick Test Summary

| Page/Component | Icon Display | Hover State | Click Action | Responsiveness | Accessibility | Pass/Fail |
|----------------|--------------|-------------|--------------|----------------|---------------|-----------|
| Home (Featured NFTs) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Collections Grid | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Collection Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Profile Portfolio | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Profile Watchlist | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Bundles Page | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| NFT Details Modal | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

### Issues Found

**Issue 1:**
- **Location:** _____________________
- **Description:** _____________________
- **Severity:** Critical / Major / Minor
- **Screenshot:** _____________________

**Issue 2:**
- **Location:** _____________________
- **Description:** _____________________
- **Severity:** Critical / Major / Minor
- **Screenshot:** _____________________

---

## 7. Browser/Device Compatibility

**Minimum Test Matrix:**

| Browser | Desktop | Tablet | Mobile | Status |
|---------|---------|--------|--------|--------|
| Chrome | ☐ | ☐ | ☐ | ☐ |
| Firefox | ☐ | ☐ | ☐ | ☐ |
| Safari | ☐ | ☐ | ☐ | ☐ |
| Edge | ☐ | ☐ | - | ☐ |

**Notes:**
- Desktop: 1920x1080 or 1440x900
- Tablet: iPad (768x1024) or similar
- Mobile: iPhone (375x667) or Android (360x640)

---

## 8. Related Files

**Component Files:**
- `c:\Users\zarac\v0-nft-fs-app\components\profile\add-to-watchlist.tsx` - Main component
- `c:\Users\zarac\v0-nft-fs-app\components\profile\profile-provider.tsx` - Watchlist state management

**Card Components (use WatchlistToggle):**
- `c:\Users\zarac\v0-nft-fs-app\components\nft\cards\IndividualNFTCard.tsx`
- `c:\Users\zarac\v0-nft-fs-app\components\nft\cards\BundleNFTCard.tsx`
- `c:\Users\zarac\v0-nft-fs-app\components\nft\cards\RentalWrapperNFTCard.tsx`

**Page Files:**
- `c:\Users\zarac\v0-nft-fs-app\app\page.tsx` - Home page
- `c:\Users\zarac\v0-nft-fs-app\app\collections\page.tsx` - Collections list
- `c:\Users\zarac\v0-nft-fs-app\app\collections\[slug]\page.tsx` - Collection detail
- `c:\Users\zarac\v0-nft-fs-app\app\bundles\page.tsx` - Bundles page
- `c:\Users\zarac\v0-nft-fs-app\components\profile\profile-tabs.tsx` - Profile pages
- `c:\Users\zarac\v0-nft-fs-app\components\nft\nft-details-modal.tsx` - NFT modal

**API Routes:**
- `c:\Users\zarac\v0-nft-fs-app\app\api\profile\watchlist\add\route.ts`
- `c:\Users\zarac\v0-nft-fs-app\app\api\profile\watchlist\remove\route.ts`

---

## 9. Sign-Off

**Developer:** _____________________  **Date:** _____________________

**QA Tester:** _____________________  **Date:** _____________________

**Product Owner:** _____________________  **Date:** _____________________

---

## Appendix A: Component Implementation Details

### WatchlistToggle Component Specifications

**Icon Sizing (Responsive):**
```tsx
// Button sizes
h-12 w-12      // Mobile (< 768px)
md:h-10 md:w-10  // Tablet (768px - 1023px)
lg:h-8 lg:w-8    // Desktop (≥ 1024px)

// Eye icon sizes (nested)
h-5 w-5      // Mobile
md:h-4 md:w-4  // Desktop
```

**Color States:**
```tsx
// Not in watchlist
text-muted-foreground                    // Base gray
hover:text-primary                       // Cyan on hover
hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]  // Subtle glow

// In watchlist
text-primary                             // Cyan
drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]     // Strong glow
hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] // Brighter on hover
fill-current                             // Fill eye icon
```

**Animations:**
```tsx
transition-all duration-300              // Smooth transitions
hover:scale-105                          // Not in watchlist
hover:scale-110                          // In watchlist
active:scale-95                          // Click feedback
```

**Accessibility Attributes:**
```tsx
aria-label="Add/Remove [name] from watchlist"
aria-pressed={inWatchlist}               // Boolean
role="button"                            // Implicit from <button>
tabindex="0"                             // Implicit from <button>
```

---

## Appendix B: Testing Tools

**Recommended Tools:**
- **Browser DevTools:** Inspect elements, check computed styles
- **Responsive Design Mode:** Test different screen sizes
- **React DevTools:** Verify component state and props
- **Lighthouse:** Accessibility audit
- **axe DevTools:** Detailed accessibility testing
- **Chrome Screen Reader:** Test with ChromeVox
- **Screenshot Tools:** Document issues

**Manual Testing Commands:**
```bash
# Run development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Build production bundle (test optimized code)
npm run build
npm run start
```

---

**End of Test Plan**
