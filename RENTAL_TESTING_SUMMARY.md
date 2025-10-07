# Rental Listing Testing - Quick Reference

## 🚀 Quick Start (10 Minutes)

### Step 1: Quick Check (30 seconds)
```bash
npx tsx scripts/quick-rental-check.ts
```

**What to look for**:
- ❌ `Empty listing` → Listings never created
- ⚠️ `Inactive` → Created but isActive = false
- 📋 `allListingIds: []` → Transaction not executing

---

### Step 2: Check Block Explorer (2 minutes)
Open: https://apechain.calderaexplorer.xyz/tx/0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896

**Look for**:
- ✅ Status: Success
- 📝 Logs: `RentalListingCreated` event
- 🔍 Input Data: Function = `createRentalListing`

---

### Step 3: Contract Verification (1 minute)
```bash
npx tsx scripts/verify-rental-contract.ts
```

**What to look for**:
- ✅ Contract deployed (has bytecode)
- ✅ Functions respond correctly
- ✅ Wrapper address matches env var

---

### Step 4: Full Diagnostics (3 minutes)
```bash
npx tsx scripts/debug-rental-listing.ts
```

**Tests run**:
1. Read wrappers 0, 1, 2 directly
2. Check allListingIds array
3. Analyze transaction (manual steps)
4. Fetch RentalListingCreated events
5. Create test listing live

---

## 🎯 Decision Tree

```
START: User created listing but shows inactive
│
├─→ Run: quick-rental-check.ts
│   │
│   ├─→ allListingIds = [] ?
│   │   ├─→ YES → Transaction not executing createRentalListing
│   │   │   └─→ Check transaction in block explorer
│   │   │       ├─→ No events? → Wrong function called
│   │   │       └─→ Has events? → Contract bug (unlikely)
│   │   │
│   │   └─→ NO → Continue
│   │
│   ├─→ Owner = 0x000...000 ?
│   │   ├─→ YES → Listing never created
│   │   │   └─→ Verify contract address in .env.local
│   │   │
│   │   └─→ NO → Continue
│   │
│   └─→ isActive = false but owner exists ?
│       └─→ YES → Contract storage bug
│           └─→ Run full diagnostics to confirm
│
├─→ Run: verify-rental-contract.ts
│   │
│   ├─→ No bytecode?
│   │   └─→ Wrong contract address
│   │       └─→ Check deployment logs, update .env.local
│   │
│   ├─→ Functions fail?
│   │   └─→ Contract deployment issue
│   │       └─→ Redeploy contract
│   │
│   └─→ Wrapper mismatch?
│       └─→ Config error
│           └─→ Update env vars
│
└─→ Run: debug-rental-listing.ts
    │
    ├─→ Test 4: No events?
    │   └─→ createRentalListing never executed
    │
    ├─→ Test 5: Script succeeds but user fails?
    │   └─→ Frontend integration bug
    │
    └─→ Test 5: Script fails?
        └─→ Contract or network issue
```

---

## 🔍 Common Scenarios

### Scenario A: Contract Not Deployed
**Symptoms**:
```
❌ NO CODE - Contract not deployed
```

**Fix**:
1. Check deployment scripts output
2. Verify address in `.env.local`
3. Restart dev server

---

### Scenario B: Listings Never Created
**Symptoms**:
```
Empty listing (never created)
allListingIds: []
NO EVENTS FOUND
```

**Fix**:
1. Check transaction in explorer
2. Verify function called = createRentalListing
3. Check if transaction reverted

---

### Scenario C: Listings Exist But Inactive
**Symptoms**:
```
Listing exists but inactive
allListingIds: [0, 1, 2]
Found 3 RentalListingCreated events
isActive = false
```

**Fix**:
1. This is a contract bug
2. Check contract source code
3. Redeploy if necessary

---

### Scenario D: Frontend Bug
**Symptoms**:
```
Script test works ✅
User transactions fail ❌
```

**Fix**:
1. Add console logs to create-rental-listing.tsx
2. Verify wrapper ID and params
3. Check wrapper ownership

---

## 📊 Expected Outputs

### ✅ Working System:
```bash
# quick-rental-check.ts
Wrapper 0:
   isActive: ✅ true
   owner: 0x1234...
   price: 100000000000000000 wei
   ✅ Active listing

allListingIds: [0, 1, 2]
```

### ❌ Broken System:
```bash
# quick-rental-check.ts
Wrapper 0:
   isActive: ❌ false
   owner: 0x0000000000000000000000000000000000000000
   ⚠️ Empty listing (never created)

allListingIds: []
⚠️ NO LISTINGS
```

---

## 🛠️ Manual Steps

### Check Transaction Manually:

1. **Open in Explorer**:
   ```
   https://apechain.calderaexplorer.xyz/tx/<HASH>
   ```

2. **Verify**:
   - ✅ Status = Success
   - ✅ To = RentalManager address
   - ✅ Function = createRentalListing
   - ✅ Events include RentalListingCreated

3. **Decode Input**:
   - wrapperId = correct?
   - pricePerDay = correct?
   - minDays, maxDays = correct?

---

## 🎓 Understanding the Issue

### How createRentalListing Works:

```solidity
function createRentalListing(...) {
    // 1. Validate ownership
    require(rentalWrapper.ownerOf(wrapperId) == msg.sender);

    // 2. Create listing struct
    listings[wrapperId] = RentalListing({
        wrapperId: wrapperId,
        owner: msg.sender,
        pricePerDay: pricePerDay,
        isActive: true,  // ← Should be true!
        ...
    });

    // 3. Add to array
    allListingIds.push(wrapperId);  // ← Should add ID

    // 4. Emit event
    emit RentalListingCreated(...);  // ← Should log
}
```

### What Can Go Wrong:

1. **Transaction reverts** → Receipt status = 0
   - Check: Transaction status in explorer

2. **Wrong function called** → No event emitted
   - Check: Input data in explorer

3. **Contract not deployed** → All calls fail
   - Check: Contract has bytecode

4. **Storage bug** → Data doesn't persist
   - Check: Read listings[id] directly

---

## 📞 Support Commands

### Check contract bytecode:
```bash
npx tsx -e "
import { createThirdwebClient, eth_getCode } from 'thirdweb';
import { getRpcClient } from 'thirdweb/rpc';
import { apeChain } from 'thirdweb/chains';

const client = createThirdwebClient({ clientId: 'YOUR_ID' });
const rpc = getRpcClient({ client, chain: apeChain });
const code = await eth_getCode(rpc, { address: '0x96b692b2301925e3284001E963B69F8fb2B53c1d' });
console.log('Has code:', code !== '0x');
"
```

### Read listing directly:
```bash
npx tsx -e "
import { createThirdwebClient, getContract, readContract } from 'thirdweb';
import { apeChain } from 'thirdweb/chains';

const client = createThirdwebClient({ clientId: 'YOUR_ID' });
const contract = getContract({ client, chain: apeChain, address: '0x96b692b2301925e3284001E963B69F8fb2B53c1d' });
const info = await readContract({ contract, method: 'function getRentalInfo(uint256) view returns (...)', params: [0n] });
console.log(info);
"
```

---

## ✅ Success Checklist

After fixes, verify:
- [ ] `quick-rental-check.ts` shows active listings
- [ ] `allListingIds` contains wrapper IDs
- [ ] Block explorer shows events
- [ ] User can create listing from UI
- [ ] Listing appears on rental page
- [ ] Other users can rent NFT

---

## 📚 Related Files

**Scripts**:
- `scripts/quick-rental-check.ts` - Fast status check
- `scripts/verify-rental-contract.ts` - Contract verification
- `scripts/debug-rental-listing.ts` - Full diagnostics

**Documentation**:
- `RENTAL_LISTING_DEBUG_GUIDE.md` - Detailed guide
- `DEPLOYED_CONTRACTS.md` - Contract addresses
- `CLAUDE.md` - Project context

**Code**:
- `lib/rental.ts` - Rental integration
- `components/rental/create-rental-listing.tsx` - UI component
- `contracts/RentalManagerDelegated.sol` - Smart contract

---

*For detailed instructions, see RENTAL_LISTING_DEBUG_GUIDE.md*
