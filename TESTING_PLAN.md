# Rental Listing Debugging - Step-by-Step Testing Plan

## 🎯 Objective

Diagnose why rental listings show `isActive: false` after successful transaction confirmation.

---

## ⚡ Quick Start (Choose Your Path)

### Path A: Fast Diagnosis (5 minutes)
For quick answers, run in order:
1. `npx tsx scripts/quick-rental-check.ts`
2. Check block explorer (link provided in output)
3. Report findings

### Path B: Comprehensive Analysis (10 minutes)
For complete diagnosis:
1. `npx tsx scripts/verify-rental-contract.ts`
2. `npx tsx scripts/debug-rental-listing.ts`
3. Review output in detail
4. Follow recommendations

### Path C: Live Testing (15 minutes)
To test contract directly:
1. `npx tsx scripts/test-create-listing-direct.ts <wrapperId>`
2. Watch real-time state changes
3. Compare before/after states

---

## 📋 Detailed Testing Steps

### Phase 1: Initial Assessment (2 minutes)

#### Test 1.1: Quick Status Check
```bash
npx tsx scripts/quick-rental-check.ts
```

**What it does**:
- Reads rental info for wrappers 0, 1, 2
- Checks `allListingIds` array
- Shows summary of current state

**Expected Output** (if working):
```
📦 Wrapper 0:
   isActive: ✅ true
   owner: 0x1234...
   price: 100000000000000000 wei
   ✅ Active listing

📋 Checking allListingIds array:
   Total listings: 3
   Listing IDs: [0, 1, 2]
```

**Expected Output** (if broken):
```
📦 Wrapper 0:
   isActive: ❌ false
   owner: 0x0000000000000000000000000000000000000000
   ⚠️ Empty listing (never created)

📋 Checking allListingIds array:
   Total listings: 0
   Listing IDs: []
   ⚠️ NO LISTINGS
```

**What to conclude**:
- Empty listing + empty array → Transactions didn't execute createRentalListing
- Has owner but inactive → Contract storage bug (rare)
- Active listing → Everything works (but check why UI doesn't show it)

---

#### Test 1.2: Block Explorer Verification

**Transaction**: `0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896`

**Steps**:
1. Open: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896

2. **Check Status**:
   - ✅ Should show "Success" with green checkmark
   - ❌ If "Failed" → Transaction reverted

3. **Check Logs/Events tab**:
   - ✅ Should see `RentalListingCreated` event
   - ❌ No events → Function not called or reverted

4. **Check Input Data**:
   - Click "Show more details" or "Decode"
   - ✅ Should show `createRentalListing` function
   - ✅ Should show parameters: wrapperId, pricePerDay, minDays, maxDays
   - ❌ Wrong function → Frontend calling wrong method

5. **Check State Changes** (if available):
   - ✅ Should show storage slots updated
   - ❌ No state changes → Transaction did nothing

**What to conclude**:
- Success + Events → Listing was created (check why read fails)
- Success + No Events → Wrong function called
- Failed → Transaction reverted (check require conditions)

---

### Phase 2: Contract Verification (3 minutes)

#### Test 2.1: Deployment Verification
```bash
npx tsx scripts/verify-rental-contract.ts
```

**What it does**:
- Checks contracts have bytecode deployed
- Tests all critical functions
- Verifies configuration (fees, ownership)
- Reads storage slots directly

**Expected Output** (if working):
```
1. Verifying contract deployment
--------------------------------------------------

📋 RentalManager: 0x96b692b2301925e3284001E963B69F8fb2B53c1d
   ✅ Deployed (25678 bytes of bytecode)

📦 RentalWrapper: 0xc06D38353dc437d981C4C0F6E0bEac63196A4A68
   ✅ Deployed (18432 bytes of bytecode)

2. Verifying contract functions
--------------------------------------------------

   ✅ getRentalInfo() - works
   ✅ allListingIds() - works
   ✅ platformFeeBps() - works
      Platform fee: 250 bps (2.5%)
   ✅ feeRecipient() - works
   ✅ rentalWrapper() - works
      Wrapper address: 0xc06D38353dc437d981C4C0F6E0bEac63196A4A68
```

**Expected Output** (if broken):
```
📋 RentalManager: 0x96b692b2301925e3284001E963B69F8fb2B53c1d
   ❌ NO CODE - Contract not deployed at this address!
```

**What to conclude**:
- No bytecode → Wrong address in `.env.local`
- Functions fail → Contract not deployed correctly
- Wrapper mismatch → Configuration error

---

### Phase 3: Full Diagnostics (5 minutes)

#### Test 3.1: Comprehensive Analysis
```bash
npx tsx scripts/debug-rental-listing.ts
```

**What it does**:
Runs 5 detailed tests:

**TEST 1: Direct Contract Storage Read**
- Reads `getRentalInfo()` for wrappers 0, 1, 2
- Shows raw contract response
- Identifies empty vs. inactive listings

**TEST 2: Check allListingIds Array**
- Reads array entries
- Checks if wrapper IDs are present
- Confirms array push() executed

**TEST 3: Transaction Analysis**
- Provides manual verification steps
- Links to block explorer
- Shows what to look for in transaction

**TEST 4: Query RentalListingCreated Events**
- Fetches all historical events
- Shows when listings were created
- Confirms event emission

**TEST 5: Create Test Listing**
- Finds wrapper owned by test account
- Creates new listing from script
- Immediately reads back to verify
- Compares before/after state

**Expected Output** (if working):
```
TEST 1: ✅ Wrapper 0 isActive = true
TEST 2: ✅ allListingIds = [0, 1, 2]
TEST 4: ✅ Found 3 RentalListingCreated events
TEST 5: ✅ SUCCESS - Listing is active immediately
```

**Expected Output** (if broken):
```
TEST 1: ❌ All wrappers show empty listings
TEST 2: ⚠️ allListingIds is empty
TEST 4: ⚠️ NO EVENTS FOUND
TEST 5: ❌ FAILURE - Listing shows inactive
```

**What to conclude**:
- No events + empty array → createRentalListing never executed
- Events exist + inactive → Contract storage bug
- Test 5 works but user's don't → Frontend integration issue

---

### Phase 4: Live Testing (5 minutes)

#### Test 4.1: Direct Listing Creation
```bash
npx tsx scripts/test-create-listing-direct.ts 0
```

**What it does**:
1. Verifies wrapper ownership
2. Checks if already rented
3. Reads current listing state
4. Creates new listing
5. Waits for confirmation
6. Re-reads listing state
7. Compares before/after
8. Checks allListingIds array

**Parameters**:
- Replace `0` with any wrapper ID you own
- Script will verify ownership automatically

**Expected Output** (if working):
```
Step 1: ✅ Ownership verified
Step 2: ✅ Not currently rented
Step 4: ✅ Transaction confirmed
Step 5:
  After creating listing:
  isActive: ✅ true
  owner: 0x1234...
  pricePerDay: 100000000000000000
Step 6:
  Changes detected:
  Was active: false
  Now active: true ✅ (newly created)
  Price changed: ✅
  Timestamp changed: ✅

✅ SUCCESS: Listing created/updated successfully!
```

**Expected Output** (if broken - scenario 1: contract issue):
```
Step 4: ✅ Transaction confirmed
Step 5:
  After creating listing:
  isActive: ❌ false
  owner: 0x0000000000000000000000000000000000000000

❌ FAILURE: Listing was NOT created (empty struct returned)
```

**Expected Output** (if broken - scenario 2: storage bug):
```
Step 5:
  After creating listing:
  isActive: ❌ false
  owner: 0x1234...  (not zero address)

❌ CRITICAL: Listing data exists but isActive = false!
   This indicates a contract bug in createRentalListing()
```

**What to conclude**:
- Empty struct → Transaction not executing
- Has data but inactive → Contract bug (struct created but isActive not set)
- Works from script but not UI → Frontend issue

---

## 🔍 Diagnosis Decision Tree

```
START: Rental listing shows inactive
│
└─→ Run: quick-rental-check.ts
    │
    ├─→ allListingIds = [] ?
    │   │
    │   ├─→ YES → PROBLEM: Transactions not executing
    │   │   │
    │   │   └─→ Run: verify-rental-contract.ts
    │   │       │
    │   │       ├─→ No bytecode?
    │   │       │   └─→ FIX: Wrong contract address in .env.local
    │   │       │
    │   │       └─→ Has bytecode?
    │   │           └─→ Check transaction in block explorer
    │   │               │
    │   │               ├─→ No events?
    │   │               │   └─→ FIX: Frontend calling wrong function
    │   │               │
    │   │               └─→ Has events?
    │   │                   └─→ Run debug-rental-listing.ts for details
    │   │
    │   └─→ NO → Has listings in array
    │       │
    │       └─→ Check wrapper 0 status
    │           │
    │           ├─→ Owner = 0x000...000 ?
    │           │   └─→ YES → PROBLEM: Array has IDs but no data
    │           │       └─→ Run: test-create-listing-direct.ts
    │           │           └─→ See if direct creation works
    │           │
    │           └─→ Owner exists but inactive?
    │               └─→ YES → PROBLEM: Contract storage bug
    │                   └─→ CRITICAL: Redeploy contract required
    │
    └─→ Next: Check block explorer manually
        │
        ├─→ Transaction failed?
        │   └─→ Fix require() conditions in contract call
        │
        ├─→ No events emitted?
        │   └─→ Fix frontend to call createRentalListing
        │
        └─→ Events emitted but state not updated?
            └─→ Contract bug - review deployment
```

---

## 📊 Interpreting Test Results

### Result Pattern A: Contract Not Deployed
**Symptoms**:
- `verify-rental-contract.ts` → NO CODE
- All function calls fail
- No bytecode at address

**Diagnosis**: Wrong contract address in environment variables

**Fix**:
1. Check deployment script output for actual address
2. Update `.env.local`:
   ```
   NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<correct address>
   ```
3. Restart dev server: `pnpm run dev`
4. Re-test with `quick-rental-check.ts`

---

### Result Pattern B: Transactions Never Executed
**Symptoms**:
- `quick-rental-check.ts` → Empty listings
- `allListingIds = []`
- `debug-rental-listing.ts` → NO EVENTS FOUND
- Block explorer → No events in logs

**Diagnosis**: Frontend not calling createRentalListing or transaction reverted before execution

**Fix**:
1. Check transaction input data in block explorer
2. Decode function selector (first 4 bytes)
3. If wrong function:
   - Review `create-rental-listing.tsx`
   - Verify method signature in prepareContractCall
4. If transaction shows Failed:
   - Check require() conditions
   - Verify wrapper ownership
   - Verify wrapper not rented

---

### Result Pattern C: Contract Storage Bug
**Symptoms**:
- `quick-rental-check.ts` → Listing has owner but inactive
- `allListingIds = [0, 1, 2]`
- `debug-rental-listing.ts` → Events exist
- Block explorer → Events emitted

**Diagnosis**: Contract creates struct but doesn't set isActive = true

**Fix**:
1. Review contract source code
2. Check line 142 in RentalManagerDelegated.sol:
   ```solidity
   isActive: true,
   ```
3. Verify contract was compiled with latest code
4. If not, redeploy:
   ```bash
   npx tsx scripts/deploy-fortuna-rental.ts
   ```
5. Update `.env.local` with new address

---

### Result Pattern D: Frontend Integration Issue
**Symptoms**:
- `test-create-listing-direct.ts` → SUCCESS
- User's transactions from UI → FAILURE
- Different wrapper IDs involved

**Diagnosis**: Frontend passing wrong parameters or wrapper ID

**Fix**:
1. Add console logs to `create-rental-listing.tsx`:
   ```typescript
   console.log("Creating listing:", {
     wrapperId,
     pricePerDay: toWei(pricePerDay),
     minDays: BigInt(minValue),
     maxDays: BigInt(maxValue),
   });
   ```
2. Check if wrapper ID matches user's NFT
3. Verify user owns wrapper (not the original NFT)
4. Check if wrapper is already listed/rented

---

## ✅ Success Criteria

Tests pass when:

1. **quick-rental-check.ts**:
   - Shows `isActive: ✅ true`
   - `allListingIds` contains wrapper IDs
   - Price, owner, dates populated

2. **verify-rental-contract.ts**:
   - Both contracts have bytecode
   - All functions respond
   - Configuration correct

3. **debug-rental-listing.ts**:
   - Test 1: Listings show active
   - Test 2: Array has entries
   - Test 4: Events found
   - Test 5: New listing creates successfully

4. **test-create-listing-direct.ts**:
   - Transaction confirms
   - State changes detected
   - isActive changes from false → true
   - Wrapper ID added to array

5. **User Interface**:
   - User can create listing
   - Listing appears on rental page
   - Other users can rent NFT
   - Refresh shows updated data

---

## 🚨 Fallback Procedures

### If All Tests Fail

1. **Check network**:
   ```bash
   # Verify you're on ApeChain Mainnet
   curl -X POST https://apechain.calderachain.xyz/http \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   # Should return: {"result":"0x8173"} (33139 in hex)
   ```

2. **Test on Curtis testnet**:
   - Deploy rental contracts to Curtis
   - Update `.env.local` with testnet addresses
   - Change `apeChain` to `apeChainCurtis` in `lib/rental.ts`
   - Re-run tests
   - If testnet works → mainnet deployment issue

3. **Review recent changes**:
   - Check git history for contract changes
   - Verify no one modified RentalManagerDelegated.sol
   - Confirm deployment scripts used correct compiler version

---

### If Only Some Tests Fail

**Pattern**: Direct script works, UI doesn't
→ Frontend integration issue
→ Review create-rental-listing.tsx

**Pattern**: Events exist, isActive false
→ Contract storage bug
→ Redeploy contract

**Pattern**: No events, transaction succeeds
→ Wrong function called
→ Check transaction input data

---

## 📞 Support Resources

### Contract Addresses (Mainnet)
- RentalManager: `0x96b692b2301925e3284001E963B69F8fb2B53c1d`
- RentalWrapper: `0xc06D38353dc437d981C4C0F6E0bEac63196A4A68`

### Block Explorers
- Mainnet: https://apechain.calderaexplorer.xyz
- Testnet: https://curtis.explorer.caldera.xyz

### Useful Commands
```bash
# Quick check
npx tsx scripts/quick-rental-check.ts

# Verify deployment
npx tsx scripts/verify-rental-contract.ts

# Full diagnostics
npx tsx scripts/debug-rental-listing.ts

# Test direct creation
npx tsx scripts/test-create-listing-direct.ts 0

# Check transaction
https://apechain.calderaexplorer.xyz/tx/<HASH>
```

---

## 📚 Related Documentation

- **RENTAL_LISTING_DEBUG_GUIDE.md** - Detailed debugging guide
- **RENTAL_TESTING_SUMMARY.md** - Quick reference summary
- **DEPLOYED_CONTRACTS.md** - Contract addresses
- **CLAUDE.md** - Project context and rental system docs

---

*Last updated: October 7, 2025*
