# ✅ Contracts Ready for Deployment

## Compilation Status: SUCCESS

All 5 contracts have been successfully compiled with Solidity 0.8.20 and saved to `./artifacts/`

### Compiled Contracts

1. **BundleNFT.sol** ✅
   - ABI entries: 43
   - Bytecode size: 7,170 bytes
   - Location: `artifacts/BundleNFT.json`

2. **BundleManager.sol** ✅
   - ABI entries: 22
   - Bytecode size: 4,579 bytes
   - Location: `artifacts/BundleManager.json`
   - Constructor parameters needed:
     - `_registry`: `0x000000006551c19487814612e58FE06813775758`
     - `_implementation`: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`

3. **SwapManager.sol** ✅
   - ABI entries: 18
   - Bytecode size: 4,284 bytes
   - Location: `artifacts/SwapManager.json`

4. **RentalWrapper.sol** ✅
   - ABI entries: 48
   - Bytecode size: 7,639 bytes
   - Location: `artifacts/RentalWrapper.json`
   - Constructor parameters needed:
     - `_registry`: `0x000000006551c19487814612e58FE06813775758`
     - `_implementation`: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`

5. **RentalManager.sol** ✅
   - ABI entries: 28
   - Bytecode size: 6,631 bytes
   - Location: `artifacts/RentalManager.json`
   - Constructor parameters needed (after RentalWrapper deployed):
     - `_rentalWrapper`: (address of deployed RentalWrapper)

## Contract Fixes Applied

The following fixes were made to ensure OpenZeppelin v5 compatibility:

1. **BundleNFT.sol** - Removed deprecated `Counters` library, replaced with simple uint256 counter
2. **BundleManager.sol** - Fixed `safeTransferFrom` selector issue by using `abi.encodeWithSignature`
3. **SwapManager.sol** - Updated `ReentrancyGuard` import path (`security/` → `utils/`)
4. **RentalManager.sol** - Updated `ReentrancyGuard` import, moved `IERC6551Registry` interface outside contract
5. **All contracts** - Enabled `viaIR` optimizer to fix "stack too deep" errors

## Deployment Options

### Option 1: ThirdWeb Dashboard (Recommended)

Visit https://thirdweb.com/dashboard/contracts/deploy

For each contract:
1. Click "Deploy Contract"
2. Upload the JSON file from `artifacts/`
3. Select "ApeChain Curtis Testnet" (Chain ID: 33111)
4. Enter constructor parameters (see above)
5. Deploy with your wallet
6. Save the deployed address

### Option 2: Remix IDE

1. Visit https://remix.ethereum.org/
2. Create new files and copy contract source from `contracts/` folder
3. Compile with Solidity 0.8.20, enable optimizer with viaIR
4. Deploy using "Injected Provider - MetaMask"
5. Select ApeChain Curtis network
6. Deploy in order and save addresses

### Option 3: Hardhat (Advanced - requires fixing ESM/CommonJS issues)

Currently blocked by Hardhat configuration conflicts. Would require:
- Resolving package.json module type conflicts
- Updating hardhat.config.ts for compatibility
- Or downgrading to Hardhat 2.x with CommonJS

## Deployment Order

Deploy contracts in this specific order:

1. ✅ **BundleNFT** (no dependencies)
2. ✅ **BundleManager** (requires ERC6551 addresses)
3. ⚙️ Link them: Call `setBundleManager()` on BundleNFT and `setBundleNFT()` on BundleManager
4. ✅ **SwapManager** (no dependencies)
5. ✅ **RentalWrapper** (requires ERC6551 addresses)
6. ✅ **RentalManager** (requires RentalWrapper address)

## After Deployment

### 1. Update `.env.local`

```env
# Already configured
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x41C8f39463A868d3A88af00cd0fe7102F30E44eC

# Add deployed addresses
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=<deployed_address>
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=<deployed_address>
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=<deployed_address>
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=<deployed_address>
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<deployed_address>
```

### 2. Update Integration Files

Update the contract addresses in:
- `lib/bundle.ts` - Bundle contract addresses
- `lib/swap.ts` - Swap contract address
- `lib/rental.ts` - Rental contract addresses

### 3. Test Features

After updating addresses and restarting the dev server:

```bash
pnpm run dev
```

Test all features:
- ✅ Create a bundle (bundles page)
- ✅ List NFT for sale (profile page → NFT modal)
- ✅ Create swap listing (profile page → NFT modal)
- ✅ Wrap NFT for rental (profile page → NFT modal)

### 4. Commit to GitHub

Once all features are working:

```bash
git add .
git commit -m "Deploy contracts to ApeChain Curtis testnet"
git push origin main
```

## ERC-6551 Infrastructure

Already deployed and verified on ApeChain Curtis:
- ✅ Registry: `0x000000006551c19487814612e58FE06813775758`
- ✅ Account Implementation: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`

## Compilation Command

To recompile contracts:
```bash
node scripts/compile-and-deploy.js
```

This will regenerate all artifacts in `./artifacts/` directory.

---

**Status**: Ready for deployment! 🚀

All contracts are compiled, fixed for OpenZeppelin v5, and ready to deploy to ApeChain Curtis testnet. Choose your preferred deployment method above and follow the steps.
