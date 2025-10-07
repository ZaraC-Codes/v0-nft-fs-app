# Rental Listing Debugging - Quick Start Guide

## 🎯 Problem

User creates rental listing → Transaction confirms → Listing shows `isActive: false`

---

## ⚡ 3-Minute Quick Test

Run these commands in order:

```bash
# 1. Check current state (30 seconds)
npx tsx scripts/quick-rental-check.ts

# 2. Verify contracts deployed (30 seconds)
npx tsx scripts/verify-rental-contract.ts

# 3. Check transaction in browser (2 minutes)
# Open: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896
# Look for: Events tab → RentalListingCreated event
```

**What to look for**:
- ✅ `isActive: true` → Working
- ❌ `allListingIds: []` → Transactions not executing
- ⚠️ `Empty listing` → Never created
- 🔍 No events in explorer → Wrong function called

---

## 📋 Testing Scripts

### Quick Check (recommended first)
```bash
npx tsx scripts/quick-rental-check.ts
```
Shows: Wrapper status, allListingIds array, summary

---

### Contract Verification
```bash
npx tsx scripts/verify-rental-contract.ts
```
Shows: Deployment status, function tests, configuration

---

### Full Diagnostics
```bash
npx tsx scripts/debug-rental-listing.ts
```
Shows: 5 comprehensive tests including event history and live test

---

### Direct Creation Test
```bash
npx tsx scripts/test-create-listing-direct.ts <wrapperId>
```
Shows: Real-time listing creation with before/after comparison

Example: `npx tsx scripts/test-create-listing-direct.ts 0`

---

## 🔍 Common Issues & Fixes

### Issue 1: allListingIds is Empty
**Symptom**: `Total listings: 0`

**Diagnosis**: createRentalListing() not executing

**Fix**:
1. Check transaction in block explorer
2. Look for RentalListingCreated event
3. If no event → Wrong function called or transaction reverted

---

### Issue 2: Empty Listing (owner = 0x000...000)
**Symptom**: `owner: 0x0000000000000000000000000000000000000000`

**Diagnosis**: Listing was never created

**Fix**:
1. Run `verify-rental-contract.ts`
2. If "NO CODE" → Wrong address in `.env.local`
3. Update address and restart dev server

---

### Issue 3: Listing Exists But Inactive
**Symptom**: `owner: 0x1234...` but `isActive: false`

**Diagnosis**: Contract storage bug (rare)

**Fix**:
1. Check contract source code (line 142)
2. Verify `isActive: true` is set
3. Redeploy if necessary

---

### Issue 4: Script Works, UI Doesn't
**Symptom**: `test-create-listing-direct.ts` succeeds, user's transactions fail

**Diagnosis**: Frontend integration issue

**Fix**:
1. Add console logs to `create-rental-listing.tsx`
2. Verify wrapper ID matches
3. Check user owns wrapper (not original NFT)

---

## 📊 Quick Decision Tree

```
Run: quick-rental-check.ts
│
├─→ allListingIds: [] ?
│   └─→ YES → Problem: Transaction not executing
│       └─→ Fix: Check block explorer for events
│
├─→ owner: 0x000...000 ?
│   └─→ YES → Problem: Wrong contract address
│       └─→ Fix: Update .env.local
│
├─→ isActive: false but has owner?
│   └─→ YES → Problem: Contract bug
│       └─→ Fix: Redeploy contract
│
└─→ isActive: true ?
    └─→ YES → Everything works!
        └─→ Check why UI doesn't show it
```

---

## ✅ Success Checklist

Tests pass when:
- [ ] `quick-rental-check.ts` shows `isActive: true`
- [ ] `allListingIds` contains wrapper IDs
- [ ] Block explorer shows `RentalListingCreated` events
- [ ] `test-create-listing-direct.ts` creates listing successfully
- [ ] User can create listing from UI
- [ ] Listing appears on rental browsing page

---

## 📞 Quick Reference

**Transaction**: `0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896`

**Block Explorer**: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896

**Contract (Mainnet)**:
- RentalManager: `0x96b692b2301925e3284001E963B69F8fb2B53c1d`
- RentalWrapper: `0xc06D38353dc437d981C4C0F6E0bEac63196A4A68`

**Network**: ApeChain Mainnet (Chain ID: 33139)

---

## 📚 Detailed Documentation

- **TESTING_PLAN.md** - Complete step-by-step testing plan
- **RENTAL_LISTING_DEBUG_GUIDE.md** - Detailed debugging guide
- **RENTAL_TESTING_SUMMARY.md** - Quick reference summary

---

## 🚀 Next Steps

1. **Run quick check**: `npx tsx scripts/quick-rental-check.ts`
2. **Review output**: Look for red ❌ or yellow ⚠️ indicators
3. **Follow fix**: Use decision tree above
4. **Report findings**: Share console output for further diagnosis

---

*For comprehensive analysis, see TESTING_PLAN.md*
