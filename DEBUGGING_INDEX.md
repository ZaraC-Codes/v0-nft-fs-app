# Rental Listing Debugging - Complete Index

This index provides an overview of all testing resources created to diagnose the rental listing `isActive: false` issue.

---

## 📁 File Structure

```
v0-nft-fs-app/
│
├── scripts/                          # Testing Scripts
│   ├── quick-rental-check.ts         # 30-second status check
│   ├── verify-rental-contract.ts     # Contract deployment verification
│   ├── debug-rental-listing.ts       # Comprehensive 5-test suite
│   └── test-create-listing-direct.ts # Live listing creation test
│
├── README_TESTING.md                 # 🚀 START HERE - Quick start guide
├── TESTING_PLAN.md                   # Complete step-by-step testing plan
├── RENTAL_LISTING_DEBUG_GUIDE.md     # Detailed debugging guide
├── RENTAL_TESTING_SUMMARY.md         # Quick reference summary
└── DEBUGGING_INDEX.md                # This file
```

---

## 🚀 Quick Start

**New to this issue?** Start here:

1. Read: **README_TESTING.md** (3-minute overview)
2. Run: `npx tsx scripts/quick-rental-check.ts`
3. Follow decision tree in README_TESTING.md

---

## 📚 Documentation

### README_TESTING.md
**Purpose**: Quick start guide
**Read time**: 3 minutes
**Use when**: You need to diagnose the issue fast

**Contents**:
- 3-minute quick test
- Common issues & fixes
- Quick decision tree
- Success checklist

---

### TESTING_PLAN.md
**Purpose**: Complete step-by-step testing plan
**Read time**: 10 minutes
**Use when**: You need comprehensive testing strategy

**Contents**:
- Phase 1: Initial assessment (2 min)
- Phase 2: Contract verification (3 min)
- Phase 3: Full diagnostics (5 min)
- Phase 4: Live testing (5 min)
- Diagnosis decision tree
- Interpreting test results
- All result patterns A-D
- Fallback procedures

---

### RENTAL_LISTING_DEBUG_GUIDE.md
**Purpose**: Detailed debugging reference
**Read time**: 15 minutes
**Use when**: You need deep understanding of all scenarios

**Contents**:
- Problem summary
- Diagnostic scripts overview
- Testing priority order
- Possible root causes (5 scenarios)
- Expected test results
- Manual verification steps
- Fallback testing procedures
- Success criteria

---

### RENTAL_TESTING_SUMMARY.md
**Purpose**: Quick reference cheat sheet
**Read time**: 5 minutes
**Use when**: You need a quick reminder while testing

**Contents**:
- Quick start (10 minutes)
- Decision tree diagram
- Common scenarios
- Expected outputs (working vs. broken)
- Manual verification steps
- Support commands

---

## 🛠️ Testing Scripts

### quick-rental-check.ts
**Run**: `npx tsx scripts/quick-rental-check.ts`
**Time**: ~30 seconds
**Purpose**: Fast status check

**What it does**:
- Checks wrappers 0, 1, 2
- Reads allListingIds array
- Shows summary of current state

**Output**:
- ✅ `isActive: true` → Working
- ❌ `isActive: false` → Broken
- ⚠️ `Empty listing` → Never created
- 📋 `allListingIds: []` → No transactions executed

**Use when**: First check to understand current state

---

### verify-rental-contract.ts
**Run**: `npx tsx scripts/verify-rental-contract.ts`
**Time**: ~1 minute
**Purpose**: Verify contract deployment

**What it does**:
- Checks contracts have bytecode
- Tests all critical functions
- Verifies configuration
- Reads storage slots

**Output**:
- ✅ Deployed (bytes of bytecode)
- ❌ NO CODE (not deployed)
- ✅ Functions work
- Shows platform fee, owner, wrapper address

**Use when**: quick-rental-check shows empty listings

---

### debug-rental-listing.ts
**Run**: `npx tsx scripts/debug-rental-listing.ts`
**Time**: ~3 minutes
**Purpose**: Comprehensive 5-test analysis

**What it does**:
- TEST 1: Direct contract storage reads
- TEST 2: Check allListingIds array
- TEST 3: Transaction analysis (manual steps)
- TEST 4: Fetch RentalListingCreated events
- TEST 5: Create new listing and verify immediately

**Output**:
- Detailed listing data for each wrapper
- Complete allListingIds contents
- Historical events (if any)
- Live test results (creates listing and reads back)

**Use when**: Need complete diagnosis or tests 1-2 are inconclusive

---

### test-create-listing-direct.ts
**Run**: `npx tsx scripts/test-create-listing-direct.ts <wrapperId>`
**Time**: ~5 minutes (includes transaction)
**Purpose**: Live listing creation test

**What it does**:
1. Verifies wrapper ownership
2. Checks if already rented
3. Reads current listing state (before)
4. Creates new listing
5. Waits for confirmation
6. Re-reads listing state (after)
7. Compares before/after
8. Checks allListingIds array

**Output**:
- Before/after state comparison
- Transaction confirmation
- Success/failure analysis
- Array update verification

**Use when**: Need to test if contract logic works (bypasses UI)

**Example**: `npx tsx scripts/test-create-listing-direct.ts 0`

---

## 🎯 Testing Workflow

### Recommended Order

```
1. Read: README_TESTING.md
   ↓
2. Run: quick-rental-check.ts
   ↓
3. Decision Point:
   ├─→ allListingIds empty? → Run verify-rental-contract.ts
   ├─→ Empty listings? → Check block explorer
   ├─→ Has owner but inactive? → Run debug-rental-listing.ts
   └─→ Active listings? → Check why UI doesn't show them
   ↓
4. If still unclear: Run debug-rental-listing.ts
   ↓
5. If need live test: Run test-create-listing-direct.ts
   ↓
6. Review: TESTING_PLAN.md for interpretation
```

---

## 🔍 Common Scenarios

### Scenario: allListingIds is Empty
**Files to reference**:
1. README_TESTING.md → Issue 1
2. TESTING_PLAN.md → Result Pattern B
3. RENTAL_LISTING_DEBUG_GUIDE.md → Scenario B

**Scripts to run**:
1. `verify-rental-contract.ts`
2. `debug-rental-listing.ts` (TEST 4 for events)
3. Check block explorer manually

---

### Scenario: Contract Not Deployed
**Files to reference**:
1. README_TESTING.md → Issue 2
2. TESTING_PLAN.md → Result Pattern A
3. RENTAL_LISTING_DEBUG_GUIDE.md → Scenario A

**Scripts to run**:
1. `verify-rental-contract.ts`

**Fix**: Update `.env.local` with correct address

---

### Scenario: Listing Exists But Inactive
**Files to reference**:
1. README_TESTING.md → Issue 3
2. TESTING_PLAN.md → Result Pattern C
3. RENTAL_LISTING_DEBUG_GUIDE.md → Scenario E

**Scripts to run**:
1. `debug-rental-listing.ts` (TEST 4 for events)
2. `test-create-listing-direct.ts`

**Fix**: Redeploy contract if bug confirmed

---

### Scenario: Script Works, UI Doesn't
**Files to reference**:
1. README_TESTING.md → Issue 4
2. TESTING_PLAN.md → Result Pattern D
3. RENTAL_LISTING_DEBUG_GUIDE.md → Scenario D

**Scripts to run**:
1. `test-create-listing-direct.ts` (confirm script works)

**Fix**: Add console logs to `create-rental-listing.tsx`

---

## 📊 Output Interpretation

### ✅ Working System
```
quick-rental-check.ts:
  isActive: ✅ true
  allListingIds: [0, 1, 2]

verify-rental-contract.ts:
  ✅ Deployed (25678 bytes)
  ✅ All functions work

debug-rental-listing.ts:
  TEST 1: ✅ Active listings
  TEST 2: ✅ Array has entries
  TEST 4: ✅ Events found
  TEST 5: ✅ New listing active
```

---

### ❌ Broken System (Never Created)
```
quick-rental-check.ts:
  isActive: ❌ false
  owner: 0x000...000
  allListingIds: []

verify-rental-contract.ts:
  ✅ Deployed
  ✅ Functions work

debug-rental-listing.ts:
  TEST 1: ⚠️ Empty listings
  TEST 2: ⚠️ Array empty
  TEST 4: ⚠️ No events
```

**Diagnosis**: Transactions not executing createRentalListing

---

### ⚠️ Broken System (Contract Bug)
```
quick-rental-check.ts:
  isActive: ❌ false
  owner: 0x1234... (NOT zero)
  allListingIds: [0, 1, 2]

debug-rental-listing.ts:
  TEST 1: ❌ Inactive but has data
  TEST 2: ✅ Array has entries
  TEST 4: ✅ Events found
```

**Diagnosis**: Contract storage bug (rare)

---

## 🎓 Learning Resources

### Understanding the Issue
1. Read: RENTAL_LISTING_DEBUG_GUIDE.md → "Understanding the Issue" section
2. Review: RentalManagerDelegated.sol → createRentalListing function (lines 124-149)
3. Check: CLAUDE.md → Rental System section

### Understanding the Tests
1. Read: TESTING_PLAN.md → Phase 3 (test descriptions)
2. Review: Individual script files (well-commented)
3. Read: RENTAL_TESTING_SUMMARY.md → Expected outputs

### Understanding the Fix
1. Read: TESTING_PLAN.md → Result Patterns A-D
2. Review: README_TESTING.md → Common Issues & Fixes
3. Read: RENTAL_LISTING_DEBUG_GUIDE.md → Scenarios A-E

---

## 🚨 Troubleshooting the Tests

### Script Errors

**Error**: `Cannot find module 'thirdweb'`
**Fix**: `pnpm install`

**Error**: `Cannot find module 'dotenv/config'`
**Fix**: `pnpm install dotenv`

**Error**: `TSError: Cannot compile TypeScript`
**Fix**: Use `npx tsx` instead of `npx ts-node`

**Error**: `PRIVATE_KEY not found`
**Fix**: Add `PRIVATE_KEY=...` to `.env.local`

---

### Test Failures

**All tests fail with "Cannot connect"**
**Fix**: Check internet connection, verify RPC endpoint

**verify-rental-contract.ts shows NO CODE**
**Fix**: Check `.env.local` for correct addresses

**debug-rental-listing.ts hangs on TEST 4**
**Fix**: Event fetching can be slow, wait 60 seconds

**test-create-listing-direct.ts: "You don't own this wrapper"**
**Fix**: Use a wrapper ID you own, or skip this test

---

## 📞 Quick Reference

### Contract Addresses (Mainnet)
```
RentalManager: 0x96b692b2301925e3284001E963B69F8fb2B53c1d
RentalWrapper: 0xc06D38353dc437d981C4C0F6E0bEac63196A4A68
RentalAccount:  0x718D032B42ff34a63A5100B9dFc897EC04c139be
```

### Network
```
Chain ID: 33139 (ApeChain Mainnet)
RPC: https://apechain.calderachain.xyz/http
Explorer: https://apechain.calderaexplorer.xyz
```

### Known Transaction
```
Hash: 0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896
Link: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896
```

### Test Commands
```bash
# Quick check (30s)
npx tsx scripts/quick-rental-check.ts

# Verify contracts (1m)
npx tsx scripts/verify-rental-contract.ts

# Full diagnostics (3m)
npx tsx scripts/debug-rental-listing.ts

# Direct test (5m)
npx tsx scripts/test-create-listing-direct.ts 0
```

---

## ✅ Next Steps

1. **New to debugging?**
   - Start with README_TESTING.md
   - Run quick-rental-check.ts
   - Follow decision tree

2. **Need comprehensive plan?**
   - Read TESTING_PLAN.md
   - Run tests in order (Phases 1-4)
   - Interpret results using Pattern A-D

3. **Need detailed reference?**
   - Read RENTAL_LISTING_DEBUG_GUIDE.md
   - Review Scenarios A-E
   - Check manual verification steps

4. **Ready to test?**
   - Run scripts in recommended order
   - Share console output for analysis
   - Follow fixes based on results

---

## 📝 Notes

- All scripts use mainnet by default (Chain ID: 33139)
- Scripts require `.env.local` with PRIVATE_KEY and contract addresses
- Transaction hashes are for reference (user's actual transactions may differ)
- Scripts are safe (read-only except test-create-listing-direct.ts)
- test-create-listing-direct.ts creates a real listing (costs gas)

---

*Last updated: October 7, 2025*
*Issue: Rental listings show isActive: false after successful transaction*
*Status: Debugging in progress*
