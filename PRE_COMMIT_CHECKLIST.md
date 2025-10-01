# 📋 Pre-Commit Checklist for GitHub

Before committing and pushing to GitHub, complete these steps to ensure all features are functional.

## ✅ Step 1: Environment Configuration

### Check `.env.local` (ALREADY ADDED TO `.gitignore` ✓)

Make sure you have these environment variables:

```env
# ✅ Already Configured
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=67ac338a3f1dda0f31634dcb98e3ef8c
THIRDWEB_SECRET_KEY=y9Y-BCEc2dmbGKd4e6F2Hc9Nlenv27sI5KhfhppQRaom5PPY4dWoh9g3EQbfL8QGjATaeUixs6pTNkhF3RHOKQ
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9
PRIVATE_KEY=987a7592bb2c1aaf6a68f39010df7a551bc470bd2736e37671d5af11cb6bd5dd

# ⚠️ Need to Add (See Step 2)
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=

# ⚠️ Need to Add (See Step 3-5)
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=
```

**⚠️ IMPORTANT:** Never commit `.env.local` to GitHub! It's already in `.gitignore`.

---

## ✅ Step 2: Check/Deploy ERC-6551 Infrastructure

### Run the Check Script

```bash
npx hardhat run scripts/check-erc6551.ts --network apechain_curtis
```

### If ERC-6551 is Deployed ✅
Copy the addresses and add to `.env.local`:
```env
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x41C8f39463A868d3A88af00cd0fe7102F30E44eC
```

### If ERC-6551 is NOT Deployed ❌
See `ERC6551_SETUP.md` for deployment instructions.

---

## ✅ Step 3: Deploy Bundle Contracts

### Prerequisites
- ✅ ERC-6551 addresses in `.env.local`
- ✅ Testnet APE in your wallet

### Deploy
```bash
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis
```

### After Deployment
Add the addresses to `.env.local`:
```env
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=<your-deployed-address>
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=<your-deployed-address>
```

---

## ✅ Step 4: Deploy Swap Contract

### Deploy
```bash
npx hardhat run scripts/deploy-swap.ts --network apechain_curtis
```

### After Deployment
Add the address to `.env.local`:
```env
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=<your-deployed-address>
```

---

## ✅ Step 5: Deploy Rental Contracts

### Prerequisites
- ✅ ERC-6551 addresses in `.env.local`
- ✅ Testnet APE in your wallet

### Deploy
```bash
npx hardhat run scripts/deploy-rentals.ts --network apechain_curtis
```

### After Deployment
Add the addresses to `.env.local`:
```env
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=<your-deployed-address>
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=<your-deployed-address>
```

---

## ✅ Step 6: Update Contract Library Files

After adding all addresses to `.env.local`, update these files:

### `lib/bundle.ts`
```typescript
// Add at the top:
const BUNDLE_NFT_ADDRESS = process.env.NEXT_PUBLIC_BUNDLE_NFT_ADDRESS
const BUNDLE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS
const ERC6551_ACCOUNT_IMPLEMENTATION = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION
```

### `lib/swap.ts`
```typescript
// Add at the top:
const SWAP_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_SWAP_MANAGER_ADDRESS
```

### `lib/rental.ts`
```typescript
// Add at the top:
const RENTAL_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS
const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS
const ERC6551_ACCOUNT_IMPLEMENTATION = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION
```

---

## ✅ Step 7: Test All Features

### Restart Dev Server
```bash
# Stop current server (Ctrl+C)
pnpm run dev
```

### Test Checklist

**Basic Features (No deployment needed):**
- [ ] Wallet connects successfully
- [ ] Profile system works
- [ ] Navigation works
- [ ] Watchlist add/remove works

**Marketplace Features (Marketplace contract required):**
- [ ] Can open List for Sale modal
- [ ] Can enter price and see fee breakdown
- [ ] Can open Buy NFT modal
- [ ] Can see purchase confirmation

**Swap Features (Swap contract required):**
- [ ] Can open Create Swap modal
- [ ] Can select NFT and set criteria
- [ ] Can propose swaps

**Bundle Features (Bundle + ERC6551 required):**
- [ ] Can open Create Bundle modal
- [ ] Can select multiple NFTs
- [ ] Can create bundle

**Rental Features (Rental + ERC6551 required):**
- [ ] Can open Wrap for Rental modal
- [ ] Can set rental terms
- [ ] Can wrap NFT for rental

---

## ✅ Step 8: Document Deployment Addresses

Create a `DEPLOYED_ADDRESSES.md` (safe to commit):

```markdown
# Deployed Contract Addresses - ApeChain Curtis Testnet

## Infrastructure
- Marketplace: 0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9
- ERC6551 Registry: <your-address>
- ERC6551 Account Implementation: <your-address>

## Feature Contracts
- Bundle NFT: <your-address>
- Bundle Manager: <your-address>
- Swap Manager: <your-address>
- Rental Wrapper: <your-address>
- Rental Manager: <your-address>

## Deployment Date
- Date: <today's date>
- Chain: ApeChain Curtis Testnet (Chain ID: 33111)
- Deployer Address: <your-wallet-address>
```

---

## ✅ Step 9: Final Code Checks

### Check for Console Logs
```bash
# Search for console.log statements you may want to remove
grep -r "console.log" components/ lib/ app/
```

### Check for TODO Comments
```bash
# Search for TODO comments
grep -r "TODO" components/ lib/ app/
```

### Check Build
```bash
# Make sure the app builds without errors
pnpm run build
```

---

## ✅ Step 10: Commit to GitHub

### Check Git Status
```bash
git status
```

### Verify `.gitignore`
Make sure `.env.local` is in `.gitignore` and NOT showing in `git status`:
- ✅ `.env.local` should NOT appear
- ✅ Only code files should appear

### Stage and Commit
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add complete marketplace functionality with list/buy, swap, bundle, and rental features"

# Push to GitHub
git push origin main
```

---

## 📊 Feature Status After Deployment

| Feature | Required Contracts | Status |
|---------|-------------------|--------|
| **List for Sale** | Marketplace | ✅ Ready (contract deployed) |
| **Buy NFT** | Marketplace | ✅ Ready (contract deployed) |
| **Swap NFTs** | SwapManager | ⏳ Deploy in Step 4 |
| **Create Bundles** | BundleNFT, BundleManager, ERC6551 | ⏳ Deploy in Step 2 & 3 |
| **Rent NFTs** | RentalWrapper, RentalManager, ERC6551 | ⏳ Deploy in Step 2 & 5 |
| **Profile System** | None | ✅ Ready (no contracts needed) |
| **Watchlist** | None | ✅ Ready (localStorage) |

---

## 🚀 Quick Deploy All (After ERC6551 Setup)

If you want to deploy everything at once:

```bash
# Check ERC6551
npx hardhat run scripts/check-erc6551.ts --network apechain_curtis

# Deploy all contracts
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis
npx hardhat run scripts/deploy-swap.ts --network apechain_curtis
npx hardhat run scripts/deploy-rentals.ts --network apechain_curtis
```

Then update `.env.local` with all the deployed addresses!

---

## ⚠️ Common Issues

### "Missing environment variable" error
- Check `.env.local` has all required variables
- Restart dev server after adding variables

### Deployment fails
- Make sure you have testnet APE for gas
- Check wallet has correct network (Curtis testnet)
- Verify private key in `.env.local` is correct

### Features don't work
- Check contract addresses are correct in `.env.local`
- Verify contracts are deployed on Curtis testnet
- Check browser console for errors

---

## 🎯 What's Safe to Commit to GitHub

**✅ SAFE:**
- All code files (`.tsx`, `.ts`, `.sol`)
- Configuration files (`hardhat.config.ts`, `next.config.mjs`)
- Documentation files (`*.md`)
- Package files (`package.json`, `pnpm-lock.yaml`)
- `DEPLOYED_ADDRESSES.md` (contract addresses are public)

**❌ NEVER COMMIT:**
- `.env.local` (contains secrets)
- `PRIVATE_KEY` (in any file)
- `THIRDWEB_SECRET_KEY` (in any file)
- Node modules (`node_modules/`)
- Build artifacts (`.next/`, `artifacts/`, `cache/`)

---

## Need Help?

- Check `ERC6551_SETUP.md` for ERC-6551 deployment
- Check deployment guides: `BUNDLE_DEPLOY.md`, `SWAP_DEPLOY.md`, `RENTAL_DEPLOY.md`
- ApeChain Docs: https://docs.apechain.com/
- ThirdWeb Portal: https://portal.thirdweb.com/
