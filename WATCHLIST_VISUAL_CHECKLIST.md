# Watchlist Icon Visual Testing Checklist

**Quick visual verification guide for QA testers**

Print this page or keep it open while testing. Check off each item as you verify it.

---

## 🎯 Quick Test (5 minutes)

**Goal:** Verify icon appears correctly on main pages

### Home Page (`http://localhost:3000/`)
- [ ] Navigate to home page
- [ ] Scroll to "Featured NFTs" section
- [ ] Verify eye icon visible in top-right corner of each card
- [ ] Click one icon → Should turn cyan and fill
- [ ] Click again → Should turn gray and outline

### Collections Page (`http://localhost:3000/collections`)
- [ ] Navigate to collections page
- [ ] Select any collection from the list
- [ ] Verify eye icons on all NFT cards
- [ ] Icons should be clickable (not hidden behind card)

### Profile Page (if logged in)
- [ ] Navigate to your profile
- [ ] Click "Watchlist" tab
- [ ] Verify NFTs you added are shown
- [ ] Click eye icon on any item → Should remove it

**✅ If all checks pass:** Proceed to comprehensive testing below

---

## 📱 Device Sizing Test

Test the same page on multiple screen sizes:

### Desktop (1920x1080)
- [ ] Icon size: Small (32px button, 16px icon inside)
- [ ] Hover effect: Icon scales up with cyan glow
- [ ] Cursor: Changes to pointer on hover

### Tablet (768x1024)
- [ ] Icon size: Medium (40px button, 16px icon inside)
- [ ] Touch target: Easy to tap with finger
- [ ] No hover effect (touch device)

### Mobile (375x667)
- [ ] Icon size: Large (48px button, 20px icon inside)
- [ ] Touch target: Very easy to tap
- [ ] Icon doesn't overlap text or other elements

**How to Test:**
- Use browser DevTools → Toggle device toolbar
- Or test on real devices

---

## 🎨 Visual States Test

Test each state on any page with watchlist icons:

### Not in Watchlist (Default State)
**What you should see:**
- [ ] Outline eye icon (not filled)
- [ ] Gray color
- [ ] Semi-transparent black background

**Hover (desktop only):**
- [ ] Icon turns cyan
- [ ] Subtle cyan glow appears
- [ ] Icon scales slightly larger (105%)

### In Watchlist (Active State)
**What you should see:**
- [ ] Filled eye icon (solid)
- [ ] Cyan color
- [ ] Cyan glow around icon

**Hover (desktop only):**
- [ ] Brighter cyan glow
- [ ] Icon scales larger (110%)

### Loading State
**What you should see:**
- [ ] Spinning loader replaces eye icon
- [ ] Button slightly faded (50% opacity)
- [ ] Cannot click button

---

## 🖼️ Background Contrast Test

Test icon visibility on different NFT images:

### Light Background NFT
Find an NFT with white/pastel background:
- [ ] Icon clearly visible
- [ ] Semi-transparent black background provides contrast
- [ ] Cyan color stands out

### Dark Background NFT
Find an NFT with black/dark background:
- [ ] Icon clearly visible
- [ ] Semi-transparent black background doesn't hide icon
- [ ] Cyan glow enhances visibility

### Colorful Background NFT
Find an NFT with vibrant colors:
- [ ] Icon doesn't clash with background
- [ ] Icon remains distinguishable
- [ ] Background overlay provides consistent backdrop

### Bundle Card (Purple Gradient)
Navigate to `/bundles` or find a bundle NFT:
- [ ] Icon visible on gradient background
- [ ] Icon doesn't interfere with FS logo
- [ ] Icon maintains position over thumbnails

---

## 🖱️ Interaction Test

### Click Test
- [ ] Click icon on any NFT card
- [ ] Toast notification appears (bottom-right usually)
- [ ] Toast says "Added to Watchlist" with NFT name
- [ ] Icon changes to filled cyan immediately
- [ ] Card behind icon does NOT open (no modal/navigation)

### Double Click Test
- [ ] Click icon twice rapidly
- [ ] Only first click processes
- [ ] No duplicate toasts
- [ ] State settles correctly

### Click Active Icon
- [ ] Click cyan (active) icon
- [ ] Toast says "Removed from Watchlist"
- [ ] Icon changes to outline gray
- [ ] NFT removed from Watchlist tab (if viewing profile)

---

## ⌨️ Keyboard Navigation Test

### Tab to Icon
- [ ] Press Tab until icon has focus
- [ ] Blue focus ring appears around icon
- [ ] Focus ring clearly visible

### Activate with Enter
- [ ] Press Enter while icon focused
- [ ] Icon toggles state (same as click)
- [ ] Toast appears

### Activate with Space
- [ ] Press Space while icon focused
- [ ] Icon toggles state (same as click)
- [ ] Toast appears

---

## 🔄 State Persistence Test

### Across Pages
- [ ] Add NFT to watchlist on home page
- [ ] Navigate to collections page
- [ ] Find same NFT → Icon should be cyan/filled
- [ ] Navigate to profile → Watchlist tab
- [ ] NFT should appear in watchlist

### After Refresh
- [ ] Add NFT to watchlist
- [ ] Refresh page (F5 or Ctrl+R)
- [ ] Icon should still be cyan/filled
- [ ] State loaded from database

### After Hard Refresh
- [ ] Add NFT to watchlist
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear browser cache
- [ ] Icon should still be cyan/filled

---

## 📍 Position Test

### On Different Card Types

#### Individual NFT Card
- [ ] Icon in top-right corner
- [ ] Doesn't overlap chain badge (top-left)
- [ ] Doesn't overlap rarity badge (top-left, below chain)
- [ ] Maintains position on hover

#### Bundle NFT Card
- [ ] Icon in top-right corner
- [ ] Visible over purple gradient background
- [ ] Doesn't interfere with bundle badge
- [ ] Above thumbnail previews (bottom)

#### Rental Wrapper NFT Card
- [ ] Icon in top-right corner
- [ ] Doesn't overlap rental status badge
- [ ] Maintains position with card overlay

---

## 🎭 Edge Cases

### Many Icons on Page
- [ ] Navigate to collections with 20+ NFTs
- [ ] All icons render correctly
- [ ] No performance lag when scrolling
- [ ] Each icon works independently

### Modal Testing
- [ ] Click any NFT card to open modal
- [ ] Icon should appear in modal header
- [ ] Click icon in modal
- [ ] Modal stays open (doesn't close)
- [ ] Icon state updates in both modal and card behind it

### Not Logged In
- [ ] Log out (if logged in)
- [ ] Click watchlist icon
- [ ] Toast appears: "Login Required"
- [ ] Icon doesn't change state
- [ ] Login prompt appears or redirects to login

---

## 🌐 Browser Compatibility

Test on each browser:

### Chrome (Desktop)
- [ ] All visual states correct
- [ ] Hover effects smooth
- [ ] Click interactions work
- [ ] Keyboard navigation works

### Firefox (Desktop)
- [ ] All visual states correct
- [ ] Hover effects smooth
- [ ] Click interactions work
- [ ] Keyboard navigation works

### Safari (Desktop)
- [ ] All visual states correct
- [ ] Hover effects smooth
- [ ] Click interactions work
- [ ] Keyboard navigation works

### Chrome Mobile (Android)
- [ ] Touch target adequate (48px)
- [ ] Tap activates correctly
- [ ] No hover effects (expected)
- [ ] Icons large enough

### Safari Mobile (iOS)
- [ ] Touch target adequate (48px)
- [ ] Tap activates correctly
- [ ] No hover effects (expected)
- [ ] Icons large enough

---

## ✅ Final Verification

Before approving:

- [ ] Tested on all priority pages (home, collections, profile)
- [ ] Verified all visual states (default, active, loading)
- [ ] Tested on all device sizes (desktop, tablet, mobile)
- [ ] Verified background contrast on various NFT images
- [ ] Tested click and keyboard interactions
- [ ] Verified state persistence across navigation
- [ ] Tested position on different card types
- [ ] Verified on minimum browser matrix
- [ ] No console errors or warnings
- [ ] No accessibility issues

---

## 🚨 Issue Reporting Template

If you find an issue, document it with:

**Issue #: ______**

**Page:** _________________ (e.g., Home, Collections, Profile)

**Device:** _________________ (e.g., Desktop Chrome, iPhone Safari)

**Screen Size:** _________________ (e.g., 1920x1080, 375x667)

**Severity:**
- [ ] Critical (blocks functionality)
- [ ] Major (major visual issue)
- [ ] Minor (cosmetic)

**Description:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Steps to Reproduce:**
1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

**Expected Behavior:**
_______________________________________________________________________

**Actual Behavior:**
_______________________________________________________________________

**Screenshot:** (attach file or paste URL)

**Console Errors:** (if any)
```
Paste any console errors here
```

---

## 📊 Testing Progress

**Tester Name:** _______________________
**Date:** _______________________
**Build/Commit:** _______________________

### Pages Tested
- [ ] Home page
- [ ] Collections list page
- [ ] Collection detail page
- [ ] Profile page (Portfolio tab)
- [ ] Profile page (Watchlist tab)
- [ ] Bundles page
- [ ] NFT details modal

### Devices Tested
- [ ] Desktop (Chrome)
- [ ] Desktop (Firefox)
- [ ] Desktop (Safari)
- [ ] Tablet
- [ ] Mobile (Android)
- [ ] Mobile (iOS)

### Test Categories
- [ ] Visual states (default, active, loading)
- [ ] Device sizing (responsive)
- [ ] Background contrast
- [ ] Interactions (click, keyboard)
- [ ] State persistence
- [ ] Position on card types
- [ ] Edge cases
- [ ] Browser compatibility

### Result
- [ ] ✅ All tests passed - Approved for production
- [ ] ⚠️ Minor issues found - Approved with notes
- [ ] ❌ Major issues found - Requires fixes

**Issues Found:** _______ Critical, _______ Major, _______ Minor

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Tester Signature:** _______________________  **Date:** _____________

---

## 🎉 Testing Complete!

Once all boxes are checked and no critical issues remain, the WatchlistToggle component is ready for production deployment.

**Next Steps:**
1. Fill out test execution log in `WATCHLIST_ICON_TEST_PLAN.md`
2. Get sign-off from developer and product owner
3. Merge to main branch
4. Deploy to production
5. Monitor for issues in first 48 hours

**Good luck testing!** 🚀
