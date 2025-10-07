# Rental Listing Debugging Guide

## Problem Summary

**Issue**: User creates rental listing, transaction confirms successfully, but `getRentalInfo()` returns `isActive: false`.

**Known Facts**:
- ✅ Transaction succeeds: `0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896`
- ✅ `waitForReceipt()` confirms transaction mined
- ✅ User confirmed transaction in MetaMask 3 times
- ❌ ALL wrappers (0, 1, 2) show `isActive: false` when queried
- ❌ No listings appear on rental browsing page

## Diagnostic Scripts

Three scripts have been created to systematically diagnose this issue:

### 1. Quick Check (Run this first)

```bash
npx tsx scripts/quick-rental-check.ts
```

**What it does**:
- Checks wrappers 0, 1, 2 for listing data
- Checks `allListingIds` array
- Shows if listings exist but are inactive vs. never created

**Expected outputs**:
- `Empty listing` = Listing was NEVER created
- `Listing exists but inactive` = Created but isActive = false (contract bug)
- `allListingIds: []` = createRentalListing() not executing properly

**Time**: < 30 seconds

---

### 2. Contract Verification (Run if quick check fails)

```bash
npx tsx scripts/verify-rental-contract.ts
```

**What it does**:
- Verifies contracts are deployed at correct addresses
- Tests all critical contract functions
- Checks contract configuration (fees, ownership)
- Reads storage slots directly

**Expected outputs**:
- Confirms contracts deployed with bytecode
- Verifies `getRentalInfo()`, `allListingIds()`, etc. work
- Shows contract owner, fees, wrapper address
- Reads `listings[0]` storage directly

**Time**: ~1 minute

---

### 3. Full Diagnostics (Run for comprehensive analysis)

```bash
npx tsx scripts/debug-rental-listing.ts
```

**What it does**:
- Runs 5 comprehensive tests:
  - **Test 1**: Direct contract storage reads for wrappers 0-2
  - **Test 2**: Checks `allListingIds` array for entries
  - **Test 3**: Analyzes known transaction (manual verification steps)
  - **Test 4**: Fetches `RentalListingCreated` events from blockchain
  - **Test 5**: Creates NEW listing from script and verifies immediately

**Expected outputs**:
- Detailed listing data for each wrapper
- Complete `allListingIds` array contents
- Manual steps to verify transaction in block explorer
- Historical events (if any were emitted)
- Live test creating listing and reading back instantly

**Time**: ~2-3 minutes (includes creating test transaction)

---

## Testing Priority Order

### Phase 1: Quick Diagnosis (5 minutes)

1. **Run quick check**:
   ```bash
   npx tsx scripts/quick-rental-check.ts
   ```

2. **Check block explorer**:
   - Open: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896
   - Look for:
     - Transaction status (should be SUCCESS)
     - Logs/Events tab (look for `RentalListingCreated`)
     - Input Data (verify function called and params)

**Decision Point**:
- If `allListingIds` is empty → Problem is in transaction execution
- If listings show empty owner → Transactions never executed createRentalListing
- If listings exist but inactive → Contract storage bug (unlikely)

---

### Phase 2: Contract Verification (if Phase 1 shows issues)

3. **Verify contract deployment**:
   ```bash
   npx tsx scripts/verify-rental-contract.ts
   ```

**Check for**:
- Contract has bytecode (not empty)
- Functions respond correctly
- `rentalWrapper()` matches env var
- Can read `listings[0]` mapping

**Decision Point**:
- If NO CODE → Wrong contract address in `.env.local`
- If functions fail → Contract deployment issue
- If wrapper address mismatch → Config error

---

### Phase 3: Deep Dive (if still unclear)

4. **Run full diagnostics**:
   ```bash
   npx tsx scripts/debug-rental-listing.ts
   ```

5. **Manual event inspection**:
   - Use Test 4 output to see if ANY `RentalListingCreated` events exist
   - If events exist → Listings were created
   - If no events → createRentalListing never executed successfully

6. **Live test** (Test 5):
   - Script creates listing with known params
   - Immediately reads back
   - Confirms if contract logic works

**Decision Point**:
- Test 5 succeeds but user's failed → Frontend integration issue
- Test 5 fails → Contract deployment or network issue
- Events found but isActive false → Critical contract bug

---

## Possible Root Causes

### Scenario A: Wrong Contract Address
**Symptoms**:
- Contract verification shows NO CODE
- All function calls fail

**Fix**:
1. Check deployed contract address in deployment logs
2. Update `.env.local` with correct address
3. Restart dev server

---

### Scenario B: Transaction Not Calling createRentalListing
**Symptoms**:
- `allListingIds` array is empty
- No `RentalListingCreated` events
- Transaction succeeds but does nothing

**Fix**:
1. Check transaction input data in block explorer
2. Verify function selector matches createRentalListing
3. Check if frontend is calling wrong function

---

### Scenario C: Silent Revert (Unlikely)
**Symptoms**:
- Transaction shows SUCCESS but no state change
- Receipt status is `1` (success)
- No events emitted

**Fix**:
1. Check for require() statements that might pass but not execute
2. Verify wrapper ownership before calling
3. Check if wrapper is already rented

---

### Scenario D: Frontend Integration Bug
**Symptoms**:
- Script test (Test 5) works
- User's transactions fail
- Different wrapper IDs

**Fix**:
1. Verify wrapper ID passed to createRentalListing
2. Check if user owns wrapper
3. Check if wrapper is already listed/rented
4. Verify price/duration parameters are valid

---

### Scenario E: Contract Storage Bug (Very Unlikely)
**Symptoms**:
- Events show listing created
- `allListingIds` has entries
- BUT `listings[id].isActive` = false

**Fix**:
1. Verify contract source code
2. Check if contract was compiled correctly
3. Redeploy contract if necessary

---

## Expected Test Results

### If Everything Works:

**Quick Check**:
```
Wrapper 0:
   isActive: ✅ true
   owner: 0x...
   price: 100000000000000000 wei
   ✅ Active listing

allListingIds: [0, 1, 2]
```

**Contract Verification**:
```
✅ Deployed (12345 bytes of bytecode)
✅ getRentalInfo() - works
✅ allListingIds() - works
Platform fee: 2.5%
```

**Full Diagnostics**:
```
Test 1: isActive = true for wrapper 0
Test 2: allListingIds contains 0, 1, 2
Test 4: Found 3 RentalListingCreated events
Test 5: ✅ SUCCESS - Listing is active immediately
```

---

### If Listings Were Never Created:

**Quick Check**:
```
Wrapper 0:
   isActive: ❌ false
   owner: 0x0000000000000000000000000000000000000000
   ⚠️ Empty listing (never created)

allListingIds: []
⚠️ NO LISTINGS - createRentalListing() may not be executing!
```

**Full Diagnostics**:
```
Test 1: Empty listing for all wrappers
Test 2: allListingIds is empty
Test 4: NO EVENTS FOUND!
```

**Action**: Check transaction in block explorer for input data and logs.

---

### If Listings Exist But Inactive:

**Quick Check**:
```
Wrapper 0:
   isActive: ❌ false
   owner: 0x1234...
   price: 100000000000000000 wei
   ❌ Listing exists but inactive

allListingIds: [0, 1, 2]
```

**Full Diagnostics**:
```
Test 1: isActive = false (owner exists, price set)
Test 2: allListingIds contains 0, 1, 2
Test 4: Found 3 RentalListingCreated events
```

**Action**: This suggests a contract bug. Redeploy contract or check source code.

---

## Manual Verification Steps

### Check Transaction in Block Explorer:

1. **Open transaction**:
   ```
   https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896
   ```

2. **Check Overview**:
   - Status: Should be `Success` (green checkmark)
   - Block: Should have confirmation number
   - To: Should be RentalManager address

3. **Check Input Data**:
   - Click "Decode Input Data" (if available)
   - Function: Should show `createRentalListing`
   - Parameters: Should show wrapperId, pricePerDay, minDays, maxDays

4. **Check Logs/Events**:
   - Should see `RentalListingCreated` event
   - Topics should include wrapperId and owner
   - If NO events → Transaction didn't execute createRentalListing

5. **Check State Changes** (if available):
   - Shows storage slots that changed
   - Should see listings mapping update
   - Should see allListingIds array push

---

## Fallback Testing (if above inconclusive)

### Test with Hardhat Console:

1. **Create script**:
   ```typescript
   // scripts/test-rental-direct.ts
   import { ethers } from "hardhat";

   async function main() {
     const manager = await ethers.getContractAt(
       "RentalManagerDelegated",
       "0x96b692b2301925e3284001E963B69F8fb2B53c1d"
     );

     // Read listing
     const info = await manager.getRentalInfo(0);
     console.log("Listing 0:", info);

     // Read array
     const count = await manager.allListingIds.length; // If public
     console.log("Total listings:", count);
   }

   main();
   ```

2. **Run**:
   ```bash
   npx hardhat run scripts/test-rental-direct.ts --network apechain
   ```

---

### Test on Testnet:

1. **Switch to Curtis testnet**:
   - Update `.env.local` with Curtis contract addresses
   - Change network in `lib/rental.ts` to `apeChainCurtis`

2. **Try creating listing on testnet**:
   - If testnet works but mainnet doesn't → Mainnet deployment issue
   - If both fail → Code issue

---

## Next Steps After Diagnosis

### If Contract Issue:
1. Review contract source code
2. Compile with correct Solidity version
3. Redeploy to mainnet
4. Update `.env.local` addresses
5. Test with quick check script

### If Frontend Issue:
1. Add more console logs to `create-rental-listing.tsx`
2. Log wrapper ID, params before transaction
3. Log receipt after transaction
4. Verify wrapper ownership before calling

### If Transaction Issue:
1. Check if transaction is calling correct function
2. Verify params are formatted correctly (BigInt)
3. Test with script directly (bypass frontend)

---

## Success Criteria

✅ **Tests Pass When**:
- Quick check shows `isActive: true`
- `allListingIds` contains wrapper IDs
- Contract verification shows deployed contracts
- Events query returns `RentalListingCreated` events
- Test 5 creates listing successfully

✅ **Fixed When**:
- User can create listing from UI
- Listing immediately shows on rental page
- `getRentalInfo()` returns `isActive: true`
- Other users can rent the NFT

---

## Emergency Contact Info

**Block Explorer**:
- https://apechain.calderaexplorer.xyz

**Contract Addresses** (Mainnet):
- RentalManager: `0x96b692b2301925e3284001E963B69F8fb2B53c1d`
- RentalWrapper: `0xc06D38353dc437d981C4C0F6E0bEac63196A4A68`
- RentalAccount: `0x718D032B42ff34a63A5100B9dFc897EC04c139be`

**Network**:
- Chain ID: 33139 (ApeChain Mainnet)
- RPC: https://apechain.calderachain.xyz/http

---

*Last updated: October 7, 2025*
