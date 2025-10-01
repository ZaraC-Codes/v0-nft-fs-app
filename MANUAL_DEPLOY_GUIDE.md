# Manual Deployment Guide - ThirdWeb Dashboard

Due to Hardhat configuration conflicts, here's how to deploy your contracts using the ThirdWeb dashboard:

## Prerequisites
✅ You have testnet APE in your wallet
✅ ERC-6551 infrastructure is already deployed on Curtis (confirmed)
✅ ThirdWeb secret key is configured in `.env.local`

## Deployment Steps

### Option 1: Deploy via ThirdWeb Dashboard (Recommended)

1. **Go to ThirdWeb Dashboard**
   - Visit: https://thirdweb.com/dashboard/contracts/deploy
   - Login with your wallet that has testnet APE

2. **Upload Contract Source Code**
   - Click "Deploy Contract"
   - Select "Deploy from Source Code"
   - Upload each contract file from `contracts/` folder:
     - `BundleNFT.sol`
     - `BundleManager.sol`
     - `SwapManager.sol`
     - `RentalWrapper.sol`
     - `RentalManager.sol`

3. **Deploy in Order**

   **Step 1: Deploy BundleNFT**
   - Contract: `BundleNFT.sol`
   - Network: ApeChain Curtis Testnet (Chain ID: 33111)
   - Constructor: No parameters needed
   - Click "Deploy"
   - ✏️ **Save the deployed address**

   **Step 2: Deploy BundleManager**
   - Contract: `BundleManager.sol`
   - Network: ApeChain Curtis Testnet
   - Constructor parameters:
     - `_registry`: `0x000000006551c19487814612e58FE06813775758`
     - `_implementation`: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`
   - Click "Deploy"
   - ✏️ **Save the deployed address**

   **Step 3: Link BundleNFT and BundleManager**
   - Go to BundleNFT contract on dashboard
   - Find `setBundleManager` function
   - Call with BundleManager address
   - Then go to BundleManager contract
   - Find `setBundleNFT` function
   - Call with BundleNFT address

   **Step 4: Deploy SwapManager**
   - Contract: `SwapManager.sol`
   - Network: ApeChain Curtis Testnet
   - Constructor: No parameters needed
   - Click "Deploy"
   - ✏️ **Save the deployed address**

   **Step 5: Deploy Rental Contracts**
   - First deploy `RentalWrapper.sol`:
     - Constructor:
       - `_registry`: `0x000000006551c19487814612e58FE06813775758`
       - `_implementation`: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`
     - ✏️ **Save the deployed address**

   - Then deploy `RentalManager.sol`:
     - Constructor:
       - `_rentalWrapper`: (RentalWrapper address from above)
     - ✏️ **Save the deployed address**

4. **Update Environment Variables**

   Add these addresses to `.env.local`:
   ```env
   NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=<BundleNFT_address>
   NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=<BundleManager_address>
   NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=<SwapManager_address>
   NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=<RentalWrapper_address>
   NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<RentalManager_address>
   ```

### Option 2: Use Remix IDE (Alternative)

If ThirdWeb dashboard doesn't work:

1. Go to https://remix.ethereum.org/
2. Create new files for each contract in `contracts/` folder
3. Compile with Solidity 0.8.20
4. Deploy using "Injected Provider - MetaMask"
5. Select ApeChain Curtis network in MetaMask
6. Deploy in the same order as above

## After Deployment

1. **Update lib files with contract addresses**:
   - `lib/bundle.ts`
   - `lib/swap.ts`
   - `lib/rental.ts`

2. **Restart development server**:
   ```bash
   pnpm run dev
   ```

3. **Test all features**:
   - Create a bundle
   - List an NFT for sale
   - Create a swap listing
   - Wrap an NFT for rental

4. **Commit to GitHub** once everything works!

## Troubleshooting

- **Transaction fails**: Check you have enough testnet APE for gas
- **Contract not found**: Verify you're on Curtis testnet (Chain ID: 33111)
- **Permission denied**: Make sure you're calling setup functions (setBundleManager, etc.) with the deployer wallet

## Contract Addresses to Track

- ✅ ERC6551 Registry: `0x000000006551c19487814612e58FE06813775758`
- ✅ ERC6551 Account Implementation: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC`
- ⏳ BundleNFT: (deploy first)
- ⏳ BundleManager: (deploy second)
- ⏳ SwapManager: (deploy third)
- ⏳ RentalWrapper: (deploy fourth)
- ⏳ RentalManager: (deploy fifth)

---

**Note**: The Hardhat environment is having ESM/CommonJS configuration conflicts. The manual deployment approach above is the fastest way to get your contracts deployed and tested.
