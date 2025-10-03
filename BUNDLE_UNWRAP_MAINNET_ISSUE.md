# Bundle Unwrap Issue on ApeChain Mainnet

## Summary
Bundle NFTs are created successfully on ApeChain mainnet, but unwrapping fails. The bundle NFT gets burned but the NFTs inside are not returned to the user's wallet.

## Environment
- **Chain**: ApeChain Mainnet (Chain ID: 33139)
- **Bundle Contract**: `0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e` (BundleNFTUnified)
- **ERC6551 Registry**: `0x000000006551c19487814612e58FE06813775758` (Standard)
- **ERC6551 Implementation**: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` (Curtis implementation that exists on mainnet)

## What Works
✅ Bundle creation succeeds
✅ TBA (Token Bound Account) is created and deployed
✅ NFTs are transferred into the TBA
✅ TBA address is correctly calculated via `getBundleAccount(bundleId)` contract call
✅ Bundle NFT shows in user's wallet
✅ Can view bundle contents (NFTs in TBA)

## What Fails
❌ Unwrapping the bundle
❌ NFTs are NOT returned to user's wallet
❌ Bundle NFT gets burned (disappears)
❌ NFTs remain stuck in the TBA

## Technical Details

### Example Bundle
- **Bundle ID**: 2
- **TBA Address**: `0x9631dE21a8893461D97851f42ef2332b0C4E9117`
- **NFTs in Bundle**: 3 NFTs
- **TBA Bytecode**: Exists (348 bytes) - verified deployed

### Console Output on Unwrap Attempt
```
📦 Unwrap Bundle clicked!
🔗 Using chain for unwrap: ApeChain (ID: 33139)
📍 TBA Address: 0x9631dE21a8893461D97851f42ef2332b0C4E9117
🔍 TBA Code Length: 348
🔍 TBA Deployed: true
📦 Found 3 NFTs in bundle
🚨 Emergency unwrap - bypassing executeCall, attempting direct transfer...
Unwrap error: TransactionError: Execution Reverted: {"code":-32000,"message":"execution reverted"}
```

## Contract Functions We've Tried

### 1. `demoUnwrapBundle()` (Currently works but doesn't transfer NFTs)
```solidity
function demoUnwrapBundle(
    uint256 bundleId,
    address[] calldata nftContracts,
    uint256[] calldata tokenIds
) external nonReentrant {
    // Only verifies NFTs and burns bundle - DEMO ONLY
    // Does NOT transfer NFTs back
}
```
**Result**: Burns bundle NFT, NFTs stay in TBA ❌

### 2. `unwrapBundle()` (Standard approach - FAILED)
```solidity
function unwrapBundle(
    uint256 bundleId,
    address[] calldata nftContracts,
    uint256[] calldata tokenIds
) external nonReentrant {
    // Uses TBA.executeCall() to transfer NFTs
    for (uint256 i = 0; i < nftContracts.length; i++) {
        bytes memory transferData = abi.encodeWithSignature(
            "safeTransferFrom(address,address,uint256)",
            tbaAddress, bundleOwner, tokenIds[i]
        );
        tba.executeCall(nftContracts[i], 0, transferData);
    }
}
```
**Result**: Transaction reverts with "execution reverted" ❌

### 3. `emergencyUnwrapBundle()` (Bypass executeCall - ALSO FAILED)
```solidity
function emergencyUnwrapBundle(
    uint256 bundleId,
    address[] calldata nftContracts,
    uint256[] calldata tokenIds
) external nonReentrant {
    // Tries direct transfer from TBA
    for (uint256 i = 0; i < nftContracts.length; i++) {
        IERC721 nft = IERC721(nftContracts[i]);
        require(nft.ownerOf(tokenIds[i]) == tbaAddress, "NFT not in TBA");

        try nft.safeTransferFrom(tbaAddress, bundleOwner, tokenIds[i]) {
            // Success
        } catch {
            revert("NFT extraction failed - contact support");
        }
    }
}
```
**Result**: Transaction reverts with "execution reverted" ❌

## Key Questions

1. **Why is `executeCall()` failing?**
   - The TBA implementation `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` is deployed on mainnet
   - This is the same implementation used on Curtis testnet
   - Should the standard ERC6551 implementation work differently on mainnet?

2. **Why is direct transfer failing?**
   - The `emergencyUnwrapBundle()` tries `nft.safeTransferFrom(tbaAddress, bundleOwner, tokenId)`
   - The TBA owns the NFTs (verified via `ownerOf()`)
   - Why can't we transfer from the TBA directly?

3. **Is the TBA implementation the issue?**
   - We're using Curtis implementation `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` on mainnet
   - Should we deploy the standard mainnet implementation `0x2d25602551487c3f3354dd80d76d54383a243358`?
   - But that implementation doesn't exist on ApeChain mainnet currently

4. **Alternative approaches?**
   - Is there a way to recover NFTs from a TBA without `executeCall()`?
   - Should the bundle owner be able to call the TBA's `executeCall()` directly?
   - Is there a permission/ownership issue preventing transfers?

## Blockchain Evidence

### Bundle Contract Verification
```bash
curl -X POST https://apechain.calderachain.xyz/http \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e","latest"],"id":1}'
```
Returns bytecode ✅

### TBA Verification
```bash
curl -X POST https://apechain.calderachain.xyz/http \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x9631dE21a8893461D97851f42ef2332b0C4E9117","latest"],"id":1}'
```
Returns bytecode (348 bytes) ✅

## Files

### Contract
- `contracts/BundleNFTUnified_Updated.sol` - Main bundle contract with all 3 unwrap functions

### Frontend Integration
- `components/nft/nft-details-modal.tsx` - Unwrap button logic
- `lib/bundle.ts` - Bundle contract configuration and helpers

### Configuration
- Mainnet contract: `0x2784a09eaA5f03eaa2C49C0FfBAC57277f5B765e`
- Uses Curtis implementation on mainnet (because standard implementation doesn't exist on ApeChain)

## What We Need Help With

**Primary Question**: How do we extract NFTs from the TBA when both `executeCall()` and direct `safeTransferFrom()` are failing?

**Possible Solutions to Explore**:
1. Deploy the standard mainnet ERC6551 implementation to ApeChain mainnet
2. Find an alternative transfer method that works with the Curtis implementation
3. Modify the TBA or bundle contract to enable direct transfers
4. Use a different ERC6551 pattern that's proven to work on ApeChain mainnet

Thank you for any insights!
