# CLAUDE.md - Fortuna Square NFT Marketplace

## Project Overview

Fortuna Square is a cyberpunk-themed NFT marketplace built on the ApeChain Curtis testnet. This Next.js application provides a full-stack solution for NFT trading, user profiles, collections, bundles, and treasury management with Web3 wallet integration.

### Key Technologies
- **Framework**: Next.js 14.2.16 with TypeScript and App Router
- **Blockchain**: ApeChain Curtis testnet via ThirdWeb v5 SDK
- **UI**: Radix UI components with custom cyberpunk styling
- **State Management**: React Context API for auth and profiles
- **Package Manager**: PNPM
- **Styling**: Tailwind CSS with custom cyber themes

## Architecture

### Core Directories
```
app/                    # Next.js App Router pages
├── auth/              # Authentication pages (login/signup)
├── profile/[username] # Dynamic user profiles
├── profiles/          # Profile discovery page
├── settings/          # User settings page
├── collections/       # NFT collections
├── bundles/          # NFT bundles
└── treasury/         # Treasury management

components/            # Reusable React components
├── auth/             # Authentication components
├── profile/          # Profile-related components
├── bundle/           # Bundle creation/management
├── swap/             # NFT swap components
├── rental/           # NFT rental components
├── ui/               # Base UI components (Radix-based)
└── web3/             # Web3 wallet components

lib/                  # Utility libraries
├── thirdweb.ts       # Web3 configuration
├── profile-service.ts # Profile management service
├── bundle.ts         # Bundle contracts integration
├── swap.ts           # Swap contracts integration
├── rental.ts         # Rental contracts integration
├── marketplace.ts    # Marketplace integration
├── platform-fees.ts  # Platform fee configuration
└── nft-matching.ts   # NFT matching/criteria logic

contracts/            # Solidity smart contracts
├── BundleNFT.sol     # ERC721 bundle NFT contract
├── BundleManager.sol # Bundle creation/unwrapping
├── SwapManager.sol   # P2P NFT swaps
├── RentalWrapper.sol # ERC4907 rental wrapper
├── RentalManager.sol # Rental management
└── IERC4907.sol      # ERC4907 interface

scripts/              # Deployment scripts
├── deploy-bundles.ts # Deploy bundle contracts
├── deploy-swap.ts    # Deploy swap contract
└── deploy-rentals.ts # Deploy rental contracts

types/                # TypeScript type definitions
└── profile.ts        # Profile and NFT types
```

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Common Development Issues
1. **Multiple dev servers**: Kill hanging processes with `taskkill /f /im node.exe` (Windows)
2. **Port conflicts**: Use `pnpm run dev -- --port 3010` for alternative ports
3. **Date serialization**: Ensure Date objects are properly serialized in localStorage

## Web3 Integration

### ThirdWeb Configuration
- **Client ID**: Configured in `lib/thirdweb.ts`
- **Chain**: ApeChain Curtis testnet (chainId: 33111)
- **Supported Wallets**: MetaMask, Coinbase, Rainbow, Zerion

### Key Web3 Components
- `WalletConnect`: Main wallet connection component
- `useActiveAccount()`: Hook for accessing connected wallet
- Automatic profile creation on wallet connection

## Profile System

### Profile Service (`lib/profile-service.ts`)
Centralized service for profile management with localStorage persistence:

```typescript
// Key methods
ProfileService.createProfile(params)          // Create new profile
ProfileService.getProfileByUsername(username) // Get profile by username
ProfileService.updateProfile(id, updates)     // Update existing profile
ProfileService.createProfileFromWallet(addr)  // Auto-create from wallet
```

### Profile Storage
- **Key**: `fortuna_square_profiles` in localStorage
- **Format**: JSON with automatic Date object serialization
- **Auto-creation**: Profiles created automatically on login/wallet connection

### Profile Navigation
- **Avatar links**: `/profile/${user.username}` (real user profiles)
- **Profiles menu**: `/profile/crypto_collector` (mock demo profile)
- **Settings**: `/settings` (profile editing)

## Authentication System

### Auth Provider (`components/auth/auth-provider.tsx`)
React Context managing authentication state:

```typescript
// Key features
- Email/password authentication
- Wallet-only authentication
- Automatic profile creation
- Storage key: "fortuna_square_user"
```

### Auth Flow
1. User logs in via email/password or wallet
2. Profile automatically created if doesn't exist
3. User redirected to appropriate profile page
4. Profile data persists in localStorage

## UI Design System

### Cyberpunk Theme
Custom CSS classes for consistent styling:

```css
/* Key theme classes */
.cyber-grid          # Animated background grid
.neon-glow          # Glowing neon effects
.neon-text          # Neon text styling
.glass-card         # Glassmorphism cards
```

### Color System
```css
/* NFT Rarity Colors */
.rarity-legendary   # Yellow-orange gradient
.rarity-epic        # Purple-pink gradient
.rarity-rare        # Blue-cyan gradient
.rarity-uncommon    # Green gradient
.rarity-common      # Gray/white
```

### Component Library
Built on Radix UI with custom styling:
- **Cards**: Glassmorphism with border effects
- **Buttons**: Gradient backgrounds with hover effects
- **Inputs**: Dark theme with neon accents
- **Avatars**: Gradient fallbacks for initials

## Type Definitions

### Core Profile Types
```typescript
interface UserProfile {
  id: string
  username: string
  email?: string
  bio?: string
  avatar?: string
  coverImage?: string
  walletAddress?: string
  createdAt: Date
  updatedAt: Date
  verified: boolean
  followersCount: number
  followingCount: number
  isPublic: boolean
  showWalletAddress: boolean
  showEmail: boolean
}
```

### NFT Types
```typescript
interface PortfolioNFT {
  contractAddress: string
  tokenId: string
  name: string
  image?: string
  collection: string
  rarity?: string
  listing?: NFTListing
  isBundle?: boolean
}
```

## Common Development Patterns

### Component Creation
1. Use existing UI components from `components/ui/`
2. Follow cyberpunk design patterns
3. Implement proper TypeScript interfaces
4. Add proper error handling

### Profile Integration
```typescript
// Get current user profile
const { userProfile } = useProfile()

// Create new profile
await ProfileService.createProfile({
  id: userId,
  username: "example",
  email: "user@example.com"
})
```

### Wallet Integration
```typescript
// Check wallet connection
const account = useActiveAccount()

// Handle wallet events
useEffect(() => {
  if (account) {
    // Wallet connected logic
  }
}, [account])
```

## Testing Strategy

### Manual Testing Flows
1. **Profile Creation**: Logout → Login → Verify profile created
2. **Navigation**: Test avatar links vs. profiles menu links
3. **Settings**: Update profile information and verify persistence
4. **Wallet Connection**: Connect/disconnect wallet and verify profile updates

### Mock Data
- Located in `app/profile/[username]/page.tsx`
- Used for demonstrations and testing
- Includes sample users: `cybernaut`, `crypto_collector`, `nft_trader`

## Important Notes

### Date Handling
- Always use `new Date()` for timestamps
- ProfileService handles Date serialization automatically
- Avoid manual date string manipulation

### Storage Keys
- Profiles: `fortuna_square_profiles`
- Current user: `fortuna_square_user`
- Consistent naming prevents conflicts

### Navigation Logic
- User avatars → Real user profiles
- Profiles menu → Mock demo profiles
- Settings always accessible when logged in

### Development Server
- Default port: 3000
- Alternative ports available if conflicts occur
- Multiple server instances can cause hanging issues

### Multi-Wallet System (Critical Implementation)
**Status**: ✅ Fully functional

**Overview**:
Users can create an account with an embedded wallet (email/social auth) and link external wallets (MetaMask, etc.) to their profile. They can switch between wallets for transactions while maintaining a single account identity.

**Architecture**:
- **Primary Wallet**: Embedded wallet created on signup (stored as `type: 'embedded'` in profile)
- **Linked Wallets**: External wallets (MetaMask, etc.) linked via Settings (stored as `type: 'metamask'`)
- **Wallet Metadata**: All wallets stored in `userProfile.wallets` array with address, type, and addedAt timestamp
- **Active Wallet**: ThirdWeb SDK manages which wallet is active for transactions

**Key Components**:
- `components/wallet/wallet-switcher.tsx` - Wallet switching context and UI
- `components/wallet/link-external-wallet.tsx` - Links external wallets to profile
- `components/header.tsx` - Header dropdown shows all wallets with labels and active indicator
- `lib/profile-service.ts` - `linkAdditionalWallet()` method for storing wallet metadata

**How It Works**:
1. User creates account with embedded wallet (email/social login)
2. User links external wallet (MetaMask) via Settings → "Link Wallet" button
3. External wallet signs a message to verify ownership
4. Wallet metadata stored in profile with `type: 'metamask'`
5. User switches wallets via header dropdown (gear icon)
6. ThirdWeb's `useConnect()` and `useSetActiveWallet()` handle wallet switching
7. ThirdWeb persists active wallet selection across page reloads
8. All transactions use the currently active wallet

**CRITICAL: Always Use ThirdWeb's Wallet Management**:
- ✅ Use `useConnect()` to connect wallets
- ✅ Use `useSetActiveWallet()` to switch active wallet
- ✅ Use `useActiveAccount()` to get current wallet
- ✅ Use `useDisconnect()` to disconnect wallets
- ❌ NEVER use manual `window.ethereum` connections
- ❌ NEVER use page reloads to switch wallets
- ❌ NEVER bypass ThirdWeb's wallet system

**Implementation Pattern**:
```typescript
// Switching to MetaMask (correct approach)
const { connect } = useConnect()
const setActiveWallet = useSetActiveWallet()

const metaMaskWallet = createWallet("io.metamask")
await connect(async () => {
  const acc = await metaMaskWallet.connect({ client })
  setActiveWallet(metaMaskWallet)  // Critical - persists selection
  return acc
})
```

**Files**:
- `components/wallet/wallet-switcher.tsx` - Main wallet switching logic
- `components/wallet/link-external-wallet.tsx` - External wallet linking
- `components/header.tsx` - Wallet dropdown UI
- `lib/profile-service.ts` - Profile methods: `linkAdditionalWallet()`, `getAllWallets()`
- `types/profile.ts` - `WalletMetadata` interface

**Testing**:
1. Create account with embedded wallet
2. Link MetaMask via Settings
3. Switch to MetaMask via header dropdown
4. Verify transactions use MetaMask (e.g., mint NFT)
5. Refresh page - should stay connected to MetaMask
6. Switch back to embedded wallet - verify it works

### Watchlist Buttons (Recent Fix)
**Issue**: Watchlist eye icons on NFT cards were not clickable due to CSS stacking context and pointer-events issues.

**Solution Applied**:
- `components/profile/add-to-watchlist.tsx`: Replaced Radix UI `Button` component with native HTML `<button>` element
- Added inline style `zIndex: 9999` to force watchlist buttons above all other elements
- Changed hover overlays from `inset-0` to `inset-x-0 bottom-0` in featured-nfts.tsx, bundles/page.tsx, and profile-tabs.tsx
- This ensures overlays only cover bottom portion, not the top where watchlist buttons are located

**Testing After Restart**:
1. Ensure you're logged in (watchlist requires authentication)
2. Click eye icons on NFT cards - should add/remove from watchlist with toast notification
3. If not logged in, shows "Login Required" toast

## File Locations

### Critical Files
- `lib/thirdweb.ts` - Web3 configuration
- `lib/profile-service.ts` - Profile management
- `components/auth/auth-provider.tsx` - Authentication
- `components/header.tsx` - Main navigation
- `types/profile.ts` - Type definitions

### Pages
- `app/page.tsx` - Homepage
- `app/profile/[username]/page.tsx` - User profiles
- `app/settings/page.tsx` - Profile settings
- `app/profiles/page.tsx` - Profile discovery

## Smart Contract Features

### FortunaSquareMarketplace (Custom NFT Marketplace)
**Status**: ✅ DEPLOYED - Production Ready

**Contract Address**: `0x3109db997d454625af2f7678238c75dc6fa90367`
**Network**: ApeChain Curtis Testnet (Chain ID: 33111)
**Deployed**: October 2, 2025 (Updated with getTotalListings function)

Custom-built NFT marketplace optimized specifically for Fortuna Square:
- Direct listings (create, buy, cancel, update price)
- ERC721 and ERC1155 support with auto-detection
- Bundle NFT detection via ERC6551 `isBundleNFT()` function
- Platform fee: 2.5% (configurable by owner)
- Clear error messages with "FortunaSquare:" prefix
- Gas optimized (no unused features from generic marketplaces)
- Owner-controlled fee management and configuration
- Public `getTotalListings()` function for fetching listing count

**Key Advantages Over ThirdWeb MarketplaceV3**:
- ✅ Simpler approval flow (no complex role system)
- ✅ Clear, helpful error messages
- ✅ 20-30% gas savings
- ✅ Full control and customization
- ✅ Built-in bundle detection
- ✅ Cyberpunk branding in all messages

**Files**:
- `contracts/FortunaSquareMarketplace.sol` - Main marketplace contract (432 lines)
- `lib/marketplace.ts` - Primary marketplace integration with FortunaSquareMarketplace
- `lib/fortuna-marketplace.ts` - Alternative TypeScript SDK (not currently used)
- `components/profile/profile-provider.tsx` - Fetches and merges listings with NFT data
- `scripts/deploy-fortuna-marketplace.ts` - Deployment script
- `FORTUNA_MARKETPLACE_DEPLOY.md` - Deployment guide
- `DEPLOYED_CONTRACTS.md` - Contract address registry

**Environment Variables**:
```bash
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x3109db997d454625af2f7678238c75dc6fa90367
NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS=0x3109db997d454625af2f7678238c75dc6fa90367
```

**Integration Status**: ✅ Fully Working (as of Oct 2, 2025)
- **Approval flow**: Checks both `getApproved(tokenId)` and `isApprovedForAll()` for ERC721
- **Listing creation**: Uses direct contract call with correct function signature
- **Listing display**: Fetches listings via `getTotalListings()` function and merges with NFT data
- **Active listings**: Shown with "For Sale" badge and price on profile page
- **Auto-refresh**: Profile page auto-refreshes after successful listing creation
- **Activity feed**: NFT detail modals show marketplace activity (listings, sales, cancellations, price updates)
- **Cancel/Edit listings**: Users can cancel or update price of their active listings from NFT modal
- **Owner protection**: Buy/Rent/Swap buttons hidden when viewing own listings

**Contract Functions**:
- `createListing(address nftContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint256 duration)` - List NFT for sale
- `buyFromListing(uint256 _listingId, address _buyFor, uint256 _quantity, address _currency, uint256 _expectedTotalPrice)` - Purchase listed NFT
- `cancelListing(uint256 _listingId)` - Cancel your listing
- `updateListingPrice(uint256 _listingId, uint256 _newPricePerToken)` - Update listing price
- `getListing(uint256 listingId)` - Get listing details (returns Listing struct)
- `getUserListings(address _user)` - Get user's listing IDs
- `getTotalListings()` - Get total number of listings created (added Oct 2, 2025)
- `isBundleNFT(address _nftContract, uint256 tokenId)` - Check if NFT is a bundle
- `isListingValid(uint256 listingId)` - Check if listing is active and not expired
- `updateSaleFee(uint256 _newFeePercent)` - Update platform fee (owner only)
- `updateFeeRecipient(address _newRecipient)` - Update fee recipient (owner only)

**Critical Implementation Notes**:
1. ✅ Use `getTotalListings()` to get total listing count, then iterate from 0 to count-1
2. ⚠️ Contract does NOT have `getAllListings()` - must iterate and call `getListing(i)` for each
3. Listing struct fields: `listingId, seller, nftContract, tokenId, quantity, currency, pricePerToken, startTime, endTime, active, tokenType`
4. Check `listing.active` field to filter active listings (NOT `status`)
5. ERC721 approval requires checking BOTH `getApproved(tokenId)` AND `isApprovedForAll()`
6. ⚠️ **Event fetching with ThirdWeb v5**: Must use `prepareEvent()` with full Solidity signatures
   ```typescript
   const listingCreatedEvent = prepareEvent({
     signature: "event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 pricePerToken, uint8 tokenType)"
   });
   const events = await getContractEvents({ contract, events: [listingCreatedEvent] });
   ```
7. ⚠️ Without proper event signatures, `event.args` will be undefined - ThirdWeb needs the full ABI to decode events
8. Contract events: `ListingCreated`, `Sale`, `ListingCancelled`, `ListingUpdated` (see contract for full signatures)

### Bundle System (Custom ERC6551)
**Status**: ✅ DEPLOYED TO PRODUCTION - Fully Functional on ApeChain Mainnet (Oct 3, 2025)

Custom ERC6551 implementation with **60-80% gas savings** on unwrapping:
- Bundle multiple NFTs into single tradeable NFT
- Each bundle gets its own Token Bound Account (TBA)
- Custom `FortunaSquareBundleAccount` with `executeBatch()` function
- Batch unwrap via `batchUnwrapBundle()` for massive gas savings
- NFTs stored securely in bundle's TBA
- Trade entire bundle as one NFT
- Unwrap to retrieve individual NFTs

**Deployed Contracts (ApeChain Mainnet - Chain ID: 33139)**:
- BundleNFTUnified: `0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779`
- FortunaSquareBundleAccount: `0x6F71009f0100Eb85aF10D4A3968D3fbA16069553`
- ERC6551 Registry: `0x000000006551c19487814612e58FE06813775758`

**Environment Variables**:
```bash
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779
NEXT_PUBLIC_FORTUNA_BUNDLE_ACCOUNT=0x6F71009f0100Eb85aF10D4A3968D3fbA16069553
NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=0x6F71009f0100Eb85aF10D4A3968D3fbA16069553
```

**Critical Technical Notes**:
1. **Authorization Fix**: Uses ERC6551 `context()` function to get bundle contract address from TBA's immutable bytecode instead of storage
2. **Why This Matters**: ERC6551 minimal proxies don't support initialization - they're deployed via registry as simple delegatecall proxies
3. **The Solution**: `context()` returns `(chainId, tokenContract, tokenId)` where `tokenContract` IS the bundle contract
4. **Gas Optimization**: `batchUnwrapBundle()` uses `executeBatch()` for 60-80% gas savings vs individual transfers
5. **User Experience**: Unwrap button works seamlessly from NFT detail modals and bundle listings

**Integration Status**: ✅ Fully Working
- Bundle creation: Working on mainnet
- Bundle unwrapping: Working with batchUnwrapBundle
- Authorization: Fixed using context() function
- Frontend: All components updated and deployed

**Files**:
- `contracts/BundleNFTUnified_Updated.sol` - ERC721 bundle NFT with batchUnwrapBundle
- `contracts/FortunaSquareBundleAccount.sol` - Custom TBA with executeBatch and context-based authorization
- `lib/bundle.ts` - TypeScript integration with mainnet addresses
- `components/bundle/unwrap-bundle-button.tsx` - Unwrap UI with mainnet support
- `components/nft/nft-details-modal.tsx` - NFT modal with batchUnwrapBundle
- `scripts/deploy-fortuna-bundle-mainnet.ts` - Mainnet deployment script
- `DEPLOYED_CONTRACTS.md` - Contract address registry

### Swap System
**Status**: ✅ Complete, ready for deployment

Peer-to-peer NFT swaps with flexible matching:
- Create swap listings with specific criteria
- Match by exact token ID or any from collection
- Optional trait-based matching
- Atomic swaps (both NFTs exchange simultaneously)
- 30-day listing duration

**Files**:
- `contracts/SwapManager.sol` - Swap contract
- `lib/swap.ts` - TypeScript integration
- `components/swap/` - UI components
- `scripts/deploy-swap.ts` - Deployment
- `SWAP_DEPLOY.md` - Deployment guide

### Rental System with Delegate.cash (ERC4907 + ERC6551 + Delegation)
**Status**: ✅ DEPLOYED TO CURTIS TESTNET - Fully Functional (Oct 5, 2025)

Revolutionary rental system with **zero collateral** and **token-gating support** via Delegate.cash:
- Works with ANY ERC721 NFT (not just ERC4907)
- Wrap NFTs in ERC4907-compatible wrapper
- Original NFT stored in wrapper's TBA
- Owner retains ownership, renter gets delegation rights
- Token-gating compatible (OpenSea, Premint, Guild.xyz, Snapshot, etc.)
- Zero collateral required
- Automatic expiration, no manual intervention
- Re-rentable without unwrapping
- Custom pricing and duration (owner sets per-day rate and min/max days)

**Deployed Contracts (ApeChain Curtis Testnet - Chain ID: 33111)**:
- FortunaSquareRentalAccount: `0xF3435A43471123933AEE2E871C3530761a085502`
- RentalWrapperDelegated: `0x4D33C409A3C898AF6E155Eb2f727b9c033f448D6`
- RentalManagerDelegated: `0x6c45305a90427cAF108108Af2f44D5b1dA9809F5`
- Delegate.cash Registry: `0x00000000000000447e69651d841bD8D104Bed493`

**Environment Variables**:
```bash
NEXT_PUBLIC_RENTAL_ACCOUNT_ADDRESS=0xF3435A43471123933AEE2E871C3530761a085502
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=0x4D33C409A3C898AF6E155Eb2f727b9c033f448D6
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=0x6c45305a90427cAF108108Af2f44D5b1dA9809F5
NEXT_PUBLIC_DELEGATE_REGISTRY_ADDRESS=0x00000000000000447e69651d841bD8D104Bed493
```

**Critical Technical Notes**:
1. **Delegate.cash Integration**: When rental starts, TBA delegates original NFT to renter via `delegateERC721()`
2. **Token-Gating**: Renters can access token-gated content because delegation is recognized by Delegate.cash-enabled platforms
3. **Authorization**: Uses same `context()` pattern as bundle system for TBA authorization
4. **Custom Pricing**: Owners set their own price per day (in APE)
5. **Custom Duration**: Owners set min/max rental days, renters choose within that range
6. **No Early End**: Rentals run for full duration (as specified)
7. **Platform Fee**: 2.5% on all rental payments

**How It Works**:
1. Owner wraps NFT → Creates wrapper NFT with TBA → Original NFT stored in TBA
2. Owner creates rental listing → Sets price per day, min/max duration
3. Renter pays rental fee → TBA delegates original NFT to renter via Delegate.cash
4. Renter gains delegation rights → Can access token-gated content
5. Rental expires → `userOf()` returns address(0), delegation can be manually revoked
6. Owner can unwrap (if not rented) → Returns original NFT, burns wrapper

**Integration Status**: ✅ Fully Working
- Smart contracts deployed and tested
- Frontend components complete
- Browse rentals page: `/rentals`
- NFT modal integration: Owners can wrap/list directly from profile
- Full user flow functional from both profile and rentals page

**User Flow from Profile**:
1. Owner clicks on their NFT → Opens NFT details modal
2. Modal shows "Wrap for Rental" button (for regular NFTs)
3. After wrapping, refresh and click wrapper NFT → Shows "Create Rental Listing" form
4. Owner sets custom price per day + min/max duration → Creates listing
5. Listing appears on `/rentals` page for renters to browse

**Files**:
- `contracts/IERC4907.sol` - ERC4907 interface
- `contracts/IDelegateRegistry.sol` - Delegate.cash v2 interface
- `contracts/FortunaSquareRentalAccount.sol` - Custom TBA with delegation support
- `contracts/RentalWrapperDelegated.sol` - ERC721 + ERC4907 wrapper with delegation
- `contracts/RentalManagerDelegated.sol` - Rental marketplace with custom pricing
- `lib/rental.ts` - TypeScript integration with all rental functions
- `components/rental/wrap-nft-button.tsx` - Wrap NFT for rental
- `components/rental/create-rental-listing.tsx` - Create listing with custom price/duration
- `components/rental/rent-nft-button.tsx` - Rent NFT with payment
- `components/rental/unwrap-nft-button.tsx` - Unwrap NFT to get original back
- `components/nft/nft-details-modal.tsx` - Integrated wrap/listing buttons for owners
- `app/rentals/page.tsx` - Browse active rental listings
- `scripts/deploy-fortuna-rental.ts` - Deployment script
- `DEPLOYED_CONTRACTS.md` - Contract address registry

### Platform Fees
**Status**: ✅ Configured, integrated

Consistent fee structure across all features:
- **Marketplace**: 2.5% on purchases
- **Rentals**: 2.5% on rental payments
- **Swaps**: $1.00 USD in APE (fixed for testnet)
- Fee recipient configurable via environment variables

**Files**:
- `lib/platform-fees.ts` - Fee configuration and helpers

## Deployment

### Prerequisites
1. Add `PRIVATE_KEY` to `.env.local`
2. Get testnet funds (ApeChain Curtis faucet)
3. Ensure ERC6551 infrastructure addresses are set

### Deploy Contracts
```bash
# Deploy bundles
npx hardhat run scripts/deploy-bundles.ts --network apechain_curtis

# Deploy swaps
npx hardhat run scripts/deploy-swap.ts --network apechain_curtis

# Deploy rentals
npx hardhat run scripts/deploy-rentals.ts --network apechain_curtis
```

### After Deployment
1. Update contract addresses in respective `lib/*.ts` files
2. Restart dev server: `pnpm run dev`
3. Test features on testnet before mainnet deployment

## Future Development

### In Progress
- Treasury management dashboard
- Analytics and revenue tracking

### Planned Features
- Collection management
- Social features (follow/unfollow)
- Rental marketplace page
- Cross-chain support
- Delegate.cash integration

### Areas for Enhancement
- Real-time NFT data integration
- Advanced search and filtering
- Mobile responsiveness improvements
- Performance optimizations
- Error boundary implementations

---

*This documentation is maintained for Claude Code instances working on the Fortuna Square NFT marketplace. Update as needed when making significant architectural changes.*
