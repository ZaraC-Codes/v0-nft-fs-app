# Deployed Contracts - Fortuna Square

## ApeChain Mainnet (Chain ID: 33139) 🚀

### FortunaSquare Bundle System ✅

**Deployment Date:** October 3, 2025

Custom ERC-6551 implementation with **60-80% gas savings** on bundle unwrapping!

**BundleNFTUnified:**
- Contract: `0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779`
- Features: Create bundles, batch unwrap, unified NFT + Manager
- Explorer: https://apechain.calderachain.xyz/address/0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779

**FortunaSquareBundleAccount (TBA Implementation):**
- Contract: `0x6F71009f0100Eb85aF10D4A3968D3fbA16069553`
- Features: Custom ERC-6551 with executeBatch for gas optimization, fixed authorization using context()
- Explorer: https://apechain.calderachain.xyz/address/0x6F71009f0100Eb85aF10D4A3968D3fbA16069553

**ERC6551 Registry:**
- Contract: `0x000000006551c19487814612e58FE06813775758`
- Standard registry (cross-chain)

**Environment Variables:**
```bash
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779
NEXT_PUBLIC_FORTUNA_BUNDLE_ACCOUNT=0x6F71009f0100Eb85aF10D4A3968D3fbA16069553
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=0x000000006551c19487814612e58FE06813775758
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x6F71009f0100Eb85aF10D4A3968D3fbA16069553
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

### Rental System with Delegate.cash ✅

**Deployment Date:** October 5, 2025

**Revolutionary rental system with zero collateral and token-gating support!**

**FortunaSquareRentalAccount (TBA Implementation):**
- Contract: `0xeB1B7Bc64b93707B57aA9128445Ae7ac2B32Ab5f`
- Features: Custom ERC-6551 TBA with Delegate.cash integration
- Explorer: https://apechain.calderaexplorer.xyz/address/0xeB1B7Bc64b93707B57aA9128445Ae7ac2B32Ab5f

**RentalWrapperDelegated (ERC721 + ERC4907):**
- Contract: `0x5b1Ae2E328B3f08FD95bD06A2ef176bfCB2aB672`
- Features: Wrap any NFT for rental, ERC4907 compliance, delegation on rent
- Explorer: https://apechain.calderaexplorer.xyz/address/0x5b1Ae2E328B3f08FD95bD06A2ef176bfCB2aB672

**RentalManagerDelegated (Rental Marketplace):**
- Contract: `0x04e6658323e423729bfA0cE90706Ab1a5e5151a0`
- Features: Custom pricing/duration, 2.5% platform fee, marketplace
- Explorer: https://apechain.calderaexplorer.xyz/address/0x04e6658323e423729bfA0cE90706Ab1a5e5151a0

**Key Features:**
- ✅ Zero collateral rentals
- ✅ Delegate.cash integration for token-gating
- ✅ Owner keeps wrapper NFT (can sell while rented)
- ✅ Custom pricing and rental duration
- ✅ Works with OpenSea, Premint, Guild.xyz, and more
- ✅ ERC4907 standard compliance
- ✅ Seamless UX: Single "List for Rent" button auto-wraps NFT and shows listing form inline

**Environment Variables:**
```bash
NEXT_PUBLIC_RENTAL_ACCOUNT_ADDRESS=0xeB1B7Bc64b93707B57aA9128445Ae7ac2B32Ab5f
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=0x5b1Ae2E328B3f08FD95bD06A2ef176bfCB2aB672
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=0x04e6658323e423729bfA0cE90706Ab1a5e5151a0
NEXT_PUBLIC_DELEGATE_REGISTRY_ADDRESS=0x00000000000000447e69651d841bD8D104Bed493
```

**Delegate.cash Registry:**
- Contract: `0x00000000000000447e69651d841bD8D104Bed493`
- Same address on all EVM chains (including ApeChain mainnet)

## Swap System (ApeChain Mainnet)

**Status:** ✅ DEPLOYED TO MAINNET - October 5, 2025

**SwapManager:**
- Contract: `0x732984EC859f4597502B9336FD3B1fCCBCD57C91`
- Network: ApeChain Mainnet (Chain ID: 33139)
- Explorer: https://apechain.calderaexplorer.xyz/address/0x732984EC859f4597502B9336FD3B1fCCBCD57C91
- Features: P2P NFT swaps, flexible matching criteria, trait-based matching

**Environment Variables:**
```bash
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=0x732984EC859f4597502B9336FD3B1fCCBCD57C91
```

---

**🚀 ALL SYSTEMS NOW ON MAINNET - PRODUCTION READY**

*Last updated: October 5, 2025*
