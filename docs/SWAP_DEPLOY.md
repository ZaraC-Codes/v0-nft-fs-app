# Quick Start: Deploy Swap Contract

## Prerequisites

- Private key added to `.env.local` (already done ✅)
- Testnet funds in your wallet

## Deploy Swap Contract

```bash
# Deploy to ApeChain Curtis
npx hardhat run scripts/deploy-swap.ts --network apechain_curtis

# OR deploy to Sepolia
npx hardhat run scripts/deploy-swap.ts --network sepolia
```

## Update Frontend

After deployment, copy the SwapManager address and update `lib/swap.ts`:

```typescript
export const SWAP_CONTRACT_ADDRESSES = {
  [apeChainCurtis.id]: "PASTE_YOUR_SWAP_MANAGER_ADDRESS",
  [sepolia.id]: "0x...",
} as const;
```

## Test It!

1. Restart dev server: `pnpm run dev`
2. Go to your profile
3. Click "Create Swap Listing"
4. Select an NFT and specify what you want in return
5. Create the listing

## How Swap Works

### Create Listing
1. User selects an NFT to swap
2. Specifies wanted collection and optional token ID (or "Any")
3. Approves NFT for swap contract
4. Creates listing (valid for 30 days)

### Execute Swap
1. Another user finds your listing
2. They own an NFT that matches your criteria
3. They approve their NFT
4. Execute swap - both NFTs are exchanged atomically

### Cancel Listing
- Listing owner can cancel anytime before someone swaps

## Troubleshooting

**"Contract not approved"** → Approve your NFT for the swap contract first

**"Token ID does not match"** → If listing specifies a specific token ID, you must offer that exact token

**"Listing expired"** → Listings are valid for 30 days, after that they cannot be executed

**"Cannot swap with yourself"** → You cannot execute your own swap listings

---

For complete documentation, see: `contracts/SwapManager.sol`