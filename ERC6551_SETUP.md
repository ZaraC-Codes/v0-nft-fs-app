# ERC-6551 Setup for ApeChain Curtis

## Overview
ERC-6551 (Token Bound Accounts) is required for the Bundle and Rental features to work. This guide will help you set up ERC-6551 infrastructure on ApeChain Curtis testnet.

## Canonical ERC-6551 Addresses

These addresses are **the same across all EVM chains** where ERC-6551 is deployed:

```
Registry:                  0x000000006551c19487814612e58FE06813775758
Account Proxy:             0x55266d75D1a14E4572138116aF39863Ed6596E7F
Account Implementation:    0x41C8f39463A868d3A88af00cd0fe7102F30E44eC
```

## Step 1: Check if ERC-6551 is Already Deployed on Curtis

Visit the ApeChain Curtis explorer and check if the Registry exists:
- Explorer: https://curtis.apescan.io/
- Search for: `0x000000006551c19487814612e58FE06813775758`

### If It Exists ✅
Add these to your `.env.local`:

```env
# ERC6551 Infrastructure (Canonical Addresses)
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x41C8f39463A868d3A88af00cd0fe7102F30E44eC
```

**You're done!** Skip to Step 3.

### If It Doesn't Exist ❌
You'll need to deploy it yourself. Continue to Step 2.

## Step 2: Deploy ERC-6551 to ApeChain Curtis (If Needed)

### Option A: Use ThirdWeb Deploy (Recommended)

1. Visit https://thirdweb.com/thirdweb.eth/TokenBoundAccount
2. Click "Deploy"
3. Select "ApeChain Curtis Testnet" as the network
4. Deploy the contracts
5. Copy the deployed addresses to `.env.local`

### Option B: Deploy Using Hardhat

We've provided a deployment script in `scripts/deploy-erc6551.ts`

```bash
# Deploy ERC-6551 infrastructure
npx hardhat run scripts/deploy-erc6551.ts --network apechain_curtis
```

After deployment, add the addresses to `.env.local`:

```env
# ERC6551 Infrastructure (Your Deployed Addresses)
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=<your-registry-address>
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=<your-account-implementation-address>
```

## Step 3: Update Contract Libraries

After adding the ERC-6551 addresses to `.env.local`, update these files:

### Update `lib/bundle.ts`:
```typescript
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS
const ERC6551_ACCOUNT_IMPLEMENTATION = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION
```

### Update `lib/rental.ts`:
```typescript
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS
const ERC6551_ACCOUNT_IMPLEMENTATION = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION
```

## Step 4: Deploy Bundle & Rental Contracts

Once ERC-6551 is set up, deploy the bundle and rental contracts:

```bash
# Deploy Bundle contracts
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis

# Deploy Rental contracts
npx hardhat run scripts/deploy-rentals.ts --network apechain_curtis
```

After deployment, add the contract addresses to `.env.local`:

```env
# Bundle System
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=<bundle-nft-address>
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=<bundle-manager-address>

# Rental System
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=<rental-wrapper-address>
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<rental-manager-address>
```

## Step 5: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
pnpm run dev
```

## Verification

After setup, verify everything is working:

1. **Check Explorer**: Visit https://curtis.apescan.io/ and search for your deployed contract addresses
2. **Test Bundle Creation**: Try creating a bundle in the UI
3. **Test Rental Wrapping**: Try wrapping an NFT for rental

## Troubleshooting

### "Registry address not configured" error
- Make sure `.env.local` has `NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS`
- Restart your dev server after adding environment variables

### "Account implementation not found" error
- Make sure `.env.local` has `NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION`
- Verify the address exists on Curtis testnet

### Deployment fails with "nonce too low"
- Your wallet may have pending transactions
- Wait a minute and try again
- Check your wallet on the Curtis explorer

### Out of gas errors
- Make sure you have enough testnet APE
- Get more from the Curtis faucet: https://curtis-faucet.caldera.xyz/ (or similar)

## Need Help?

- ApeChain Docs: https://docs.apechain.com/
- ThirdWeb Docs: https://portal.thirdweb.com/
- ERC-6551 Spec: https://eips.ethereum.org/EIPS/eip-6551
- Tokenbound Docs: https://docs.tokenbound.org/

## Summary

**Minimum Required Environment Variables:**

```env
# ThirdWeb (Already configured)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
THIRDWEB_SECRET_KEY=your-secret-key

# Marketplace (Already configured)
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9

# ERC6551 Infrastructure (Add these)
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x41C8f39463A868d3A88af00cd0fe7102F30E44eC

# Contract Addresses (Add after deployment)
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=<deploy-bundles-first>
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=<deploy-bundles-first>
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=<deploy-rentals-first>
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<deploy-rentals-first>
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=<deploy-swap-first>

# Deployment (Already configured)
PRIVATE_KEY=your-private-key
```
