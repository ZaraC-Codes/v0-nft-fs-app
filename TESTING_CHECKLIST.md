# Visual Verification Checklist - View Counter Icon

**Last Updated:** 2025-10-10
**Tester:** [Your Name]
**Device:** [Desktop/Mobile/Tablet]
**Browser:** [Chrome/Safari/Firefox]

---

## 🎯 Expected Visual Design

### Screenshot 1 Reference: Non-Clicked State
- ✅ Eye icon **ONLY** (no background box visible)
- ✅ Icon appears to "float" directly on NFT card
- ✅ Icon color: Muted gray/dark (low contrast)
- ✅ Icon style: **Outline only** (not filled)
- ✅ **NO** background square/rounded box
- ✅ **NO** glow effect
- ✅ Clean, minimal appearance

### Screenshot 2 Reference: Clicked State
- ✅ Eye icon **ONLY** (no background box visible)
- ✅ Icon appears to "float" directly on NFT card
- ✅ Icon color: **Bright cyan** (#00ffff or similar)
- ✅ Icon style: **Filled solid** (not outline)
- ✅ **Bright glow** radiating from icon itself
- ✅ Glow color: Cyan/blue matching icon
- ✅ Glow appears around icon edges, NOT around a box
- ✅ **NO** dark background square/rounded box

---

## ❌ CURRENT BUG (WRONG Implementation)

```
┌─────────────┐
│   👁️       │  ← Dark rounded box/square background
└─────────────┘
```

This dark box should **NOT** exist in either state.

---

## ✅ CORRECT Implementation

```
    👁️         ← Icon floats directly on card, no box
```

Non-clicked: `👁️` (outline, gray)
Clicked: `✨👁️✨` (filled cyan, glowing)

---

## 📋 Visual Test Checklist

### Test 1: Non-Clicked State (Default)
Go to any NFT collection page with view counter icons.

- [ ] **Icon Visibility**: Can you see the eye icon?
- [ ] **No Background Box**: Is there any dark square/rounded box around the icon?
  - **Expected**: NO box visible
  - **Actual**: ________________
- [ ] **Icon Style**: Is the eye icon an outline (not filled)?
  - **Expected**: YES (outline only)
  - **Actual**: ________________
- [ ] **Icon Color**: Is the icon muted/gray/dark?
  - **Expected**: YES (low contrast)
  - **Actual**: ________________
- [ ] **No Glow**: Is there any glow/shadow effect?
  - **Expected**: NO glow
  - **Actual**: ________________
- [ ] **Floating Appearance**: Does the icon appear to float on the NFT card?
  - **Expected**: YES (seamlessly blends)
  - **Actual**: ________________

**Screenshot Compare:**
- [ ] Matches Screenshot 1 exactly
- [ ] Notes: ____________________________________

---

### Test 2: Clicked State (Active)
Click/tap on the view counter icon.

- [ ] **Icon Visibility**: Icon still visible after click?
- [ ] **No Background Box**: Is there any dark square/rounded box around the icon?
  - **Expected**: NO box visible (icon floats)
  - **Actual**: ________________
- [ ] **Icon Style**: Is the eye icon filled solid (not outline)?
  - **Expected**: YES (filled)
  - **Actual**: ________________
- [ ] **Icon Color**: Is the icon bright cyan/blue?
  - **Expected**: YES (vibrant cyan like #00ffff)
  - **Actual**: ________________
- [ ] **Glow Present**: Is there a bright glow around the icon?
  - **Expected**: YES (bright cyan glow)
  - **Actual**: ________________
- [ ] **Glow Origin**: Does the glow radiate FROM THE ICON itself?
  - **Expected**: YES (glow emanates from icon edges, not from a box)
  - **Actual**: ________________
- [ ] **No Box Glow**: The glow does NOT outline a square/rounded box shape?
  - **Expected**: Correct - glow follows icon shape
  - **Actual**: ________________

**Screenshot Compare:**
- [ ] Matches Screenshot 2 exactly
- [ ] Notes: ____________________________________

---

### Test 3: Click/Unclick Toggle
Click the icon multiple times to toggle states.

- [ ] **Smooth Transition**: Does the icon smoothly transition between states?
  - **Expected**: YES (fade or instant transition)
  - **Actual**: ________________
- [ ] **Consistent Appearance**: Icon always floats (no box appears/disappears)?
  - **Expected**: YES (always no box)
  - **Actual**: ________________
- [ ] **State Persistence**: Clicked state persists until unclicked?
  - **Expected**: YES
  - **Actual**: ________________

---

### Test 4: Touch Target (Invisible Click Area)
The icon should be easy to click even without a visible box.

- [ ] **Easy to Click**: Can you easily click/tap the icon?
  - **Expected**: YES (comfortable hit area ~40x40px minimum)
  - **Actual**: ________________
- [ ] **Cursor/Hover**: Does cursor change to pointer on hover (desktop)?
  - **Expected**: YES (cursor: pointer)
  - **Actual**: ________________
- [ ] **Touch Feedback**: Any visual feedback on touch (mobile)?
  - **Expected**: Glow appears on tap
  - **Actual**: ________________
- [ ] **No Accidental Clicks**: Can you click near icon without triggering?
  - **Expected**: Touch target reasonable, not oversized
  - **Actual**: ________________

---

### Test 5: Different NFT Cards
Test on multiple NFT cards with varying background colors/images.

**Card 1 Background:** [Describe: dark/light/colorful]
- [ ] Icon visible and readable?
- [ ] No box visible?
- [ ] Notes: ____________________________________

**Card 2 Background:** [Describe: dark/light/colorful]
- [ ] Icon visible and readable?
- [ ] No box visible?
- [ ] Notes: ____________________________________

**Card 3 Background:** [Describe: dark/light/colorful]
- [ ] Icon visible and readable?
- [ ] No box visible?
- [ ] Notes: ____________________________________

---

### Test 6: Responsive/Mobile Testing

**Mobile Device:** [iPhone/Android/iPad]
- [ ] Icon size appropriate (not too small)?
- [ ] No box visible on mobile?
- [ ] Glow effect works on mobile?
- [ ] Easy to tap with finger?
- [ ] Notes: ____________________________________

**Tablet Device:** [iPad/Android Tablet]
- [ ] Icon size appropriate?
- [ ] No box visible on tablet?
- [ ] Glow effect works on tablet?
- [ ] Notes: ____________________________________

---

## 🔍 Code Verification Points

### CSS Classes to Check
File: `c:\Users\zarac\v0-nft-fs-app\components\nft\nft-card.tsx`

**Verify these are REMOVED or set to transparent:**
```tsx
// ❌ WRONG - These should NOT exist:
className="bg-background/80"
className="bg-card"
className="backdrop-blur-sm"
className="border border-border"
className="rounded-lg"
className="p-2"

// ✅ CORRECT - Only these should exist:
className="cursor-pointer transition-all" // Base styles only
```

**Verify icon states:**
```tsx
// Non-clicked state
<Eye className="w-5 h-5 text-muted-foreground" />

// Clicked state
<Eye className="w-5 h-5 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
```

---

## 📸 Screenshot Evidence

### Before Fix
- [ ] Screenshot captured showing dark box bug
- [ ] File saved as: `screenshots/view-icon-bug-before.png`

### After Fix - Non-Clicked
- [ ] Screenshot captured matching Screenshot 1
- [ ] File saved as: `screenshots/view-icon-fixed-nonclicked.png`

### After Fix - Clicked
- [ ] Screenshot captured matching Screenshot 2
- [ ] File saved as: `screenshots/view-icon-fixed-clicked.png`

---

## ✅ Final Approval

### All Tests Pass?
- [ ] All visual tests pass
- [ ] Matches Screenshot 1 (non-clicked)
- [ ] Matches Screenshot 2 (clicked)
- [ ] No dark background box visible in any state
- [ ] Icon floats cleanly on NFT cards
- [ ] Touch target works correctly
- [ ] Mobile/tablet responsive

**Tester Signature:** ________________
**Date:** ________________
**Status:** ⬜ PASS / ⬜ FAIL

---

## 🚨 Known Issues (If Any)

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Example: Box still visible on Safari | High | Open | Need to test -webkit prefix |
|  |  |  |  |
|  |  |  |  |

---

## 📝 Notes

Additional observations or comments:

```
[Write any additional notes here]
```
