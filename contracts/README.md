# NFT Swap Smart Contract

## Overview

The `NFTSwap.sol` contract enables trustless peer-to-peer NFT swaps on the Fortuna Square marketplace.

## Features

- **Atomic Swaps**: Both NFTs transfer simultaneously or the transaction reverts
- **Flexible Criteria**: List with specific token ID or accept "Any" from a collection
- **Expiration**: Listings automatically expire after a set duration
- **Gas Efficient**: Optimized for minimal gas costs
- **Secure**: Uses OpenZeppelin's battle-tested security contracts

## Contract Functions

### For Listing NFTs

#### `createSwapListing()`
```solidity
function createSwapListing(
    address nftContract,        // Your NFT contract address
    uint256 tokenId,           // Your NFT token ID
    address wantedNftContract, // Collection you want
    uint256 wantedTokenId,     // Specific token ID (0 = "Any")
    uint256 durationInDays     // How long listing is active
) external returns (uint256 listingId)
```

**Requirements:**
- You must own the NFT
- You must approve this contract to transfer your NFT
- NFT cannot already be listed

### For Executing Swaps

#### `executeSwap()`
```solidity
function executeSwap(
    uint256 listingId,  // The listing ID you want to swap with
    uint256 myTokenId   // Your NFT token ID to offer
) external
```

**Requirements:**
- You must own the NFT you're offering
- Your NFT must match the listing criteria
- You must approve this contract to transfer your NFT
- Listing must be active and not expired
- You cannot swap with yourself

### For Managing Listings

#### `cancelSwapListing()`
```solidity
function cancelSwapListing(uint256 listingId) external
```

**Requirements:**
- You must be the original lister
- Listing must be active

#### `getSwapListing()`
```solidity
function getSwapListing(uint256 listingId) external view returns (SwapListing memory)
```

Returns all details about a listing.

#### `isListingValid()`
```solidity
function isListingValid(uint256 listingId) external view returns (bool)
```

Checks if a listing is active and not expired.

## Deployment

### ApeChain Curtis Testnet
- Network: ApeChain Curtis
- Chain ID: 33111
- Contract Address: `[To be deployed]`

### Ethereum Sepolia Testnet
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract Address: `[To be deployed]`

## Deployment Instructions

1. Install dependencies:
```bash
pnpm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create `hardhat.config.ts`:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    apechain: {
      url: "https://curtis.rpc.caldera.xyz/http",
      chainId: 33111,
      accounts: [process.env.PRIVATE_KEY!]
    },
    sepolia: {
      url: `https://ethereum-sepolia.rpc.thirdweb.com/${process.env.THIRDWEB_CLIENT_ID}`,
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
};

export default config;
```

3. Deploy to ApeChain Curtis:
```bash
npx hardhat run scripts/deploy.ts --network apechain
```

4. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Security Considerations

- ✅ Uses ReentrancyGuard to prevent reentrancy attacks
- ✅ Verifies ownership before swaps
- ✅ Checks approvals before transfers
- ✅ Implements expiration mechanism
- ✅ Prevents self-swapping
- ✅ Uses OpenZeppelin's audited contracts

## Gas Estimates

- Create Listing: ~80,000 gas
- Execute Swap: ~120,000 gas
- Cancel Listing: ~30,000 gas

## Events

```solidity
event SwapListingCreated(uint256 indexed listingId, ...);
event SwapExecuted(uint256 indexed listingId, ...);
event SwapListingCancelled(uint256 indexed listingId, ...);
```

Monitor these events to track swap activity on-chain.

## Frontend Integration

See `lib/swap.ts` for TypeScript helpers to interact with this contract.