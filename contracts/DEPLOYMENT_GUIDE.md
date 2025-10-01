# Bundle NFT System - Deployment Guide

## Overview

The bundle system uses ERC6551 Token Bound Accounts to allow users to create NFT bundles. Each bundle is an ERC721 token that owns other NFTs through its Token Bound Account (TBA).

## Smart Contracts

### 1. BundleNFT.sol
- **Type**: ERC721 NFT Contract
- **Purpose**: Represents bundle NFTs that users can trade
- **Features**:
  - Mints bundle NFTs with metadata
  - Burns bundles when unwrapped
  - Tracks bundle metadata (name, item count, creator, creation time)

### 2. BundleManager.sol
- **Type**: Manager Contract
- **Purpose**: Handles bundle creation and unwrapping logic
- **Features**:
  - Creates bundles by minting Bundle NFT and transferring NFTs to TBA
  - Unwraps bundles by returning NFTs and burning the bundle
  - Batch approval helper for NFT contracts
  - Integration with ERC6551 Registry

## Prerequisites

Before deploying, you need:

1. **ThirdWeb Account** - Get your Client ID from https://thirdweb.com/dashboard
2. **ERC6551 Infrastructure**:
   - ERC6551 Registry contract address
   - ERC6551 Account Implementation address
   - ThirdWeb may have these already deployed on your target chain

3. **Testnet Funds**:
   - ApeChain Curtis testnet: Get from faucet
   - Sepolia testnet: Get from faucet

## Deployment Steps

### Step 1: Install Dependencies

```bash
# Install Hardhat and OpenZeppelin
pnpm add --save-dev hardhat @nomicfoundation/hardhat-toolbox
pnpm add @openzeppelin/contracts
```

### Step 2: Create Hardhat Config

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    apechain_curtis: {
      url: "https://curtis.rpc.caldera.xyz/http",
      chainId: 33111,
      accounts: [process.env.PRIVATE_KEY!],
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
```

### Step 3: Create Deployment Script

Create `scripts/deploy-bundles.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // ERC6551 addresses (update with actual addresses for your chain)
  const ERC6551_REGISTRY = "0x..."; // ThirdWeb's ERC6551 Registry
  const ACCOUNT_IMPLEMENTATION = "0x..."; // ThirdWeb's Account Implementation

  // Deploy BundleNFT
  console.log("Deploying BundleNFT...");
  const BundleNFT = await ethers.getContractFactory("BundleNFT");
  const bundleNFT = await BundleNFT.deploy();
  await bundleNFT.waitForDeployment();
  const bundleNFTAddress = await bundleNFT.getAddress();
  console.log("BundleNFT deployed to:", bundleNFTAddress);

  // Deploy BundleManager
  console.log("Deploying BundleManager...");
  const BundleManager = await ethers.getContractFactory("BundleManager");
  const bundleManager = await BundleManager.deploy(
    ERC6551_REGISTRY,
    ACCOUNT_IMPLEMENTATION
  );
  await bundleManager.waitForDeployment();
  const bundleManagerAddress = await bundleManager.getAddress();
  console.log("BundleManager deployed to:", bundleManagerAddress);

  // Set BundleManager in BundleNFT
  console.log("Setting BundleManager in BundleNFT...");
  await bundleNFT.setBundleManager(bundleManagerAddress);
  console.log("BundleManager set successfully");

  // Set BundleNFT in BundleManager
  console.log("Setting BundleNFT in BundleManager...");
  await bundleManager.setBundleNFT(bundleNFTAddress);
  console.log("BundleNFT set successfully");

  console.log("\n=== Deployment Summary ===");
  console.log("BundleNFT:", bundleNFTAddress);
  console.log("BundleManager:", bundleManagerAddress);
  console.log("\nUpdate lib/bundle.ts with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 4: Deploy Contracts

```bash
# Set your private key in .env
echo "PRIVATE_KEY=your_private_key_here" >> .env.local

# Deploy to ApeChain Curtis
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis

# Deploy to Sepolia (optional)
npx hardhat run scripts/deploy-bundles.ts --network sepolia
```

### Step 5: Update Frontend Configuration

After deployment, update `lib/bundle.ts` with your contract addresses:

```typescript
export const BUNDLE_CONTRACT_ADDRESSES = {
  [apeChainCurtis.id]: {
    bundleNFT: "0xYOUR_BUNDLE_NFT_ADDRESS",
    bundleManager: "0xYOUR_BUNDLE_MANAGER_ADDRESS",
    erc6551Registry: "0xTHIRDWEB_REGISTRY_ADDRESS",
    accountImplementation: "0xTHIRDWEB_ACCOUNT_IMPLEMENTATION",
  },
  // ... other chains
};
```

### Step 6: Verify Contracts (Optional but Recommended)

```bash
# Verify BundleNFT
npx hardhat verify --network apechain_curtis 0xYOUR_BUNDLE_NFT_ADDRESS

# Verify BundleManager
npx hardhat verify --network apechain_curtis 0xYOUR_BUNDLE_MANAGER_ADDRESS \
  "0xREGISTRY_ADDRESS" "0xACCOUNT_IMPLEMENTATION_ADDRESS"
```

## Finding ERC6551 Addresses

### Option 1: ThirdWeb Documentation
Check ThirdWeb's official docs for deployed ERC6551 infrastructure:
https://portal.thirdweb.com/smart-wallet/references

### Option 2: Official ERC6551 Registry
The official registry is deployed at the same address across all chains:
- Registry: `0x000000006551c19487814612e58FE06813775758`
- Check if it's deployed on your chain: https://erc6551.org/

### Option 3: Ask ThirdWeb Support
Contact ThirdWeb support to get the official addresses for your target chain.

## Testing the Bundle System

### 1. Create a Bundle

1. Go to your profile page
2. Click "Create Bundle"
3. Select 2-3 NFTs from your portfolio
4. Name your bundle
5. Approve contracts (one-time per contract)
6. Create the bundle
7. Verify the bundle NFT appears in your wallet

### 2. Unwrap a Bundle

1. Go to bundle detail page
2. Click "Unwrap Bundle"
3. Confirm the transaction
4. Verify all NFTs returned to your wallet
5. Verify bundle NFT was burned

### 3. Trade a Bundle

1. List bundle for sale (use existing marketplace features)
2. Another user buys the bundle
3. Buyer receives bundle NFT
4. Buyer now controls all NFTs inside via the TBA

## Important Notes

### Gas Costs

Bundle creation involves multiple transactions:
1. Batch approvals (one-time per contract)
2. Bundle creation (mints NFT + creates TBA + transfers NFTs)

Unwrapping involves:
1. Transferring all NFTs from TBA back to user
2. Burning the bundle NFT

Plan for ~$5-20 in gas costs per bundle on mainnet (much cheaper on L2s and testnets).

### Bundle Limits

- Maximum 50 NFTs per bundle (configurable in BundleManager.sol)
- All NFTs must be on the same chain
- NFTs must be ERC721 compliant

### Security Considerations

1. **Approval Scope**: Users approve the BundleManager contract, not individual users
2. **Bundle Ownership**: Only bundle owner can unwrap
3. **Automatic Burn**: Bundles are always burned when unwrapped
4. **TBA Security**: TBAs inherit security from ERC6551 standard

## Troubleshooting

### "Only bundle manager can mint"
- Ensure you called `setBundleManager()` on BundleNFT after deployment

### "Bundle Manager not deployed on chain"
- Update `BUNDLE_CONTRACT_ADDRESSES` in `lib/bundle.ts` with your deployed addresses

### "Not NFT owner"
- Ensure you own the NFTs you're trying to bundle
- Check that you're connected with the correct wallet

### Approval fails
- Ensure NFT contracts implement standard ERC721 approval functions
- Try approving contracts individually if batch approval fails

## Future Enhancements

### Platform Fees (Optional)

To add platform fees, modify `BundleManager.sol`:

```solidity
uint256 public bundleCreationFee = 0.001 ether;
address public feeRecipient;

function createBundle(...) external payable {
    require(msg.value >= bundleCreationFee, "Insufficient fee");

    // ... existing bundle creation code ...

    if (msg.value > 0) {
        payable(feeRecipient).transfer(msg.value);
    }
}
```

### IPFS Metadata

Currently uses data URIs for bundle metadata. For production:

1. Install IPFS client: `pnpm add ipfs-http-client`
2. Update `generateBundleMetadataURI()` in `lib/bundle.ts` to upload to IPFS
3. Return `ipfs://` URI instead of data URI

### Cross-Chain Bundles

To support cross-chain bundles:
1. Deploy bridge contract for cross-chain messaging
2. Use Layerzero or similar for cross-chain communication
3. Track NFTs across multiple chains in bundle metadata

## Support

For issues or questions:
1. Check ThirdWeb documentation: https://portal.thirdweb.com
2. ERC6551 Reference: https://eips.ethereum.org/EIPS/eip-6551
3. Create issue in project repository

---

**Remember**: Always test on testnets before deploying to mainnet!