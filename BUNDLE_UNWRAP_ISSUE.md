# Bundle Unwrap Issue - Need Help

## Problem
Bundle NFTs can be created successfully on ApeChain mainnet, but unwrapping fails because the frontend calculates the wrong TBA (Token Bound Account) address.

## Root Cause
The contract uses implementation address `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` (verified in deployment bytecode) to create TBAs, but the frontend code (`lib/bundle.ts`) is calculating TBA addresses using a different implementation address.

## Evidence

### Contract Deployment
- **Contract**: `0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e`
- **Constructor params** (from bytecode):
  - Registry: `0x000000006551c19487814612e58FE06813775758`
  - Implementation: `0x41c8f39463a868d3a88af00cd0fe7102f30e44ec` ✅

### Actual TBA Created by Contract
From blockchain events for bundle #0:
- TBA: `0xba26c489a70d8a8c18d556572a3219cf9a5c91d6`
- Contains 2 NFTs (verified on-chain)

### TBA Calculated by Frontend
- TBA: `0x9BbFFc4bf684aE5B836cF561746C9fbbAA320d56` ❌
- Empty (no NFTs)

### Latest Bundle (#1)
- Actual TBA (from preview fetch): `0x273605cd531dAc2f52535f2b08DB11Ba18d4F6CD`
- Frontend calculates: `0xb69945b1f3594552088334197653a4c1a212fA26` ❌

## What We've Tried

1. ✅ Updated `lib/bundle.ts` line 17 to use `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`
2. ✅ Committed and pushed to GitHub
3. ❌ Vercel deployment hasn't picked up the change yet (or there's a caching issue)

## Current Code (lib/bundle.ts lines 12-18)
```typescript
[apeChain.id]: {
  bundleNFT: "0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e",
  bundleManager: "0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e",
  erc6551Registry: "0x000000006551c19487814612e58FE06813775758",
  accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC", // Curtis implementation
},
```

## ERC-6551 TBA Address Calculation
TBA address is computed using:
```
CREATE2(
  deployer: registry (0x000000006551c19487814612e58FE06813775758),
  salt: keccak256(abi.encodePacked(implementation, SALT, chainId, tokenContract, tokenId)),
  initcode: ...
)
```

Where:
- implementation = `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` (what contract uses)
- SALT = `bytes32(0)`
- chainId = `33139` (ApeChain mainnet)
- tokenContract = `0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e` (bundle contract)
- tokenId = `0` or `1`

## Questions for Another AI

1. **Is the code in `lib/bundle.ts` actually being used to calculate TBA addresses?** Maybe there's another place where TBA calculation happens?

2. **Could there be a build/cache issue?** The code is updated on GitHub but Vercel deployment might not have rebuilt.

3. **Is there a function we're missing that calculates TBA address differently?** Search for `getBundleAccount` or TBA calculation functions.

4. **Could the issue be in how ThirdWeb's ERC-6551 functions work?** Maybe they have their own TBA calculation that ignores our config?

## Files to Check
- `lib/bundle.ts` - Bundle configuration and TBA calculation
- `components/nft/nft-details-modal.tsx` - Unwrap UI
- Any file that calls `getBundleAccount` or calculates TBA addresses

## Blockchain Explorer Links
- Bundle contract: https://apechain.calderaexplorer.xyz/address/0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e
- Bundle #0 TBA (actual): https://apechain.calderaexplorer.xyz/address/0xba26c489a70d8a8c18d556572a3219cf9a5c91d6
- ERC-6551 Registry: https://apechain.calderaexplorer.xyz/address/0x000000006551c19487814612e58FE06813775758

## Expected Behavior
When user clicks "Unwrap Bundle", it should:
1. Calculate correct TBA address using the same parameters the contract used
2. Fetch NFTs from that TBA
3. Call `unwrapBundle()` to transfer NFTs back to user
4. Burn the bundle NFT

## Actual Behavior
1. Calculates WRONG TBA address
2. Finds 0 NFTs
3. Shows error "No NFTs found in bundle"
