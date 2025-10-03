# Deployed Contracts - Fortuna Square

## ApeChain Mainnet (Chain ID: 33139) 🚀

### FortunaSquare Bundle System ✅

**Deployment Date:** October 3, 2025

Custom ERC-6551 implementation with **60-80% gas savings** on bundle unwrapping!

**BundleNFTUnified:**
- Contract: `0x981f10B577925b37a5f912f3BF93D7bF656697ab`
- Features: Create bundles, batch unwrap, unified NFT + Manager
- Explorer: https://apechain.calderachain.xyz/address/0x981f10B577925b37a5f912f3BF93D7bF656697ab

**FortunaSquareBundleAccount (TBA Implementation):**
- Contract: `0xDED767f24D941BDEf18c1cceacfbA64CF83ab919`
- Features: Custom ERC-6551 with executeBatch for gas optimization
- Explorer: https://apechain.calderachain.xyz/address/0xDED767f24D941BDEf18c1cceacfbA64CF83ab919

**ERC6551 Registry:**
- Contract: `0x000000006551c19487814612e58FE06813775758`
- Standard registry (cross-chain)

**Environment Variables:**
```bash
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=0x981f10B577925b37a5f912f3BF93D7bF656697ab
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=0x981f10B577925b37a5f912f3BF93D7bF656697ab
NEXT_PUBLIC_FORTUNA_BUNDLE_ACCOUNT=0xDED767f24D941BDEf18c1cceacfbA64CF83ab919
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0xDED767f24D941BDEf18c1cceacfbA64CF83ab919
```

---

## ApeChain Curtis Testnet (Chain ID: 33111)

### FortunaSquareMarketplace ✅

**Contract Address:** `0x3109db997d454625af2f7678238c75dc6fa90367`

**Deployment Date:** October 2, 2025

**Features:**
- Direct listings (buy/sell NFTs)
- ERC721 and ERC1155 support
- Bundle NFT detection (ERC6551)
- Platform fee: 2.5%
- Clear error messages with "FortunaSquare:" prefix
- Gas optimized

**Environment Variable:**
```bash
NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS=0x3109db997d454625af2f7678238c75dc6fa90367
```

**Contract on Explorer:**
https://curtis.explorer.caldera.xyz/address/0x3109db997d454625af2f7678238c75dc6fa90367

### Other Curtis Testnet Contracts

**Swap System:**
- SwapManager: `0x36cf50b633b4095c19ac5677b24d9f9bb4c5c179`

**Rental System:**
- RentalWrapper: `0xf6a12c5723350db10d0661d9636582728ab06dea`
- RentalManager: `0xb399203384aa1509d31688a93b8d8ec835bf7cb6`

---

*Last updated: October 3, 2025*
