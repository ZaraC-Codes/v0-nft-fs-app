# Quick Start: Deploy Bundle Contracts

## 1. Add Your Private Key

Create or edit `.env.local` and add:

```bash
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

**⚠️ NEVER commit this file to git!**

## 2. Get Testnet Funds

You need testnet ETH/APE to deploy contracts.

### ApeChain Curtis Testnet
Check ApeChain docs for faucet

### OR use Sepolia (alternative)
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

## 3. Deploy Contracts

```bash
# Deploy to ApeChain Curtis
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis

# OR deploy to Sepolia
npx hardhat run scripts/deploy-bundles.ts --network sepolia
```

## 4. Update Frontend

After deployment, copy the addresses shown and update `lib/bundle.ts`:

```typescript
export const BUNDLE_CONTRACT_ADDRESSES = {
  [apeChainCurtis.id]: {
    bundleNFT: "PASTE_YOUR_BUNDLE_NFT_ADDRESS",
    bundleManager: "PASTE_YOUR_BUNDLE_MANAGER_ADDRESS",
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0xaaf75c1727304f0990487517b5eb1c961b7dfade",
  },
};
```

## 5. Test It!

1. Restart dev server: `pnpm run dev`
2. Go to your profile at http://localhost:3000
3. Click "Create Bundle"
4. Select 2-3 NFTs and follow the steps

---

## Troubleshooting

**"insufficient funds"** → Get more testnet funds from faucet

**Contract not found** → Make sure you updated `lib/bundle.ts` with deployed addresses

**Transaction fails** → Check you're on the correct network in MetaMask

---

For complete documentation, see: `contracts/DEPLOYMENT_GUIDE.md`