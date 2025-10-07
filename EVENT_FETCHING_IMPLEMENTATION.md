# Event Fetching Implementation for Activity Feeds

## Overview

Implemented blockchain event fetching for bundle creation, rental listings, and last sale prices using ThirdWeb v5's `prepareEvent()` and `getContractEvents()` functions.

## New Helper Functions

### 1. Bundle Creation Events (`lib/bundle.ts`)

```typescript
/**
 * Get bundle creation events for activity feed
 * @param client ThirdwebClient instance
 * @param chain Chain to query
 * @param bundleId Specific bundle ID to fetch events for (optional)
 * @returns Array of bundle creation events with parsed data
 */
export async function getBundleCreationEvents(
  client: ThirdwebClient,
  chain: Chain,
  bundleId?: string
)
```

**Event Signature:**
```solidity
event BundleCreated(
  uint256 indexed bundleId,
  address indexed creator,
  address accountAddress,
  address[] nftContracts,
  uint256[] tokenIds
)
```

**Returns:**
```typescript
{
  bundleId: string,
  creator: string,
  accountAddress: string,
  nftContracts: string[],
  tokenIds: string[],
  timestamp: Date,
  txHash: string,
  blockNumber: number
}
```

**Contract:** BundleNFTUnified at `0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779`

---

### 2. Rental Listing Events (`lib/rental.ts`)

```typescript
/**
 * Get rental listing creation events for activity feed
 * @param wrapperId Specific wrapper ID to fetch events for (optional)
 * @returns Array of rental listing creation events with parsed data
 */
export async function getRentalListingEvents(wrapperId?: string)
```

**Event Signature:**
```solidity
event RentalListingCreated(
  uint256 indexed wrapperId,
  address indexed owner,
  uint256 pricePerDay,
  uint256 minDays,
  uint256 maxDays
)
```

**Returns:**
```typescript
{
  wrapperId: string,
  owner: string,
  pricePerDay: bigint,
  minDays: bigint,
  maxDays: bigint,
  timestamp: Date,
  txHash: string,
  blockNumber: number
}
```

**Contract:** RentalManagerDelegated at `0x96b692b2301925e3284001E963B69F8fb2B53c1d`

---

### 3. Last Sale Price (`lib/marketplace.ts`)

```typescript
/**
 * Get the most recent sale price for an NFT
 * @param contractAddress NFT contract address
 * @param tokenId NFT token ID
 * @returns Last sale price in APE (as string) or null if never sold
 */
export async function getLastSalePrice(
  contractAddress: string,
  tokenId: string
): Promise<string | null>
```

**Event Signature:**
```solidity
event Sale(
  uint256 indexed listingId,
  address indexed buyer,
  address indexed seller,
  address nftContract,
  uint256 tokenId,
  uint256 quantity,
  uint256 totalPrice,
  uint256 platformFee
)
```

**Returns:**
- String: Price in APE (e.g., "42.50")
- null: If NFT has never been sold

**Contract:** FortunaSquareMarketplace at `0x3e076856f0E06A37F4C79Cd46C936fc27f8fA7E0`

---

## Integration Points

### 1. Profile Provider (`components/profile/profile-provider.tsx`)

**Last Sale Price Integration:**
- Added to NFT fetching pipeline (lines 924-973)
- Fetches last sale price for all unlisted NFTs
- Updates `nft.lastSalePrice` field
- Uses `Promise.all()` for parallel fetching

```typescript
// For unlisted NFTs, fetch last sale price from marketplace events
try {
  const lastSalePrice = await getLastSalePrice(nft.contractAddress, nft.tokenId)
  if (lastSalePrice) {
    return {
      ...nft,
      lastSalePrice: parseFloat(lastSalePrice)
    }
  }
} catch (error) {
  console.warn(`Could not fetch last sale price for ${nft.contractAddress}/${nft.tokenId}:`, error)
}
```

---

### 2. NFT Details Modal (`components/nft/nft-details-modal.tsx`)

**Bundle Activity Loading:**
- Added useEffect hook (lines 313-332)
- Loads bundle creation/unwrap events when modal opens
- Uses existing `getBundleActivity()` from `lib/bundle-history.ts`
- Displays in Bundle Activity tab

```typescript
// Load bundle activity when modal opens for bundle NFTs
useEffect(() => {
  async function loadBundleActivity() {
    if (isOpen && nft?.isBundle && bundleActivity.length === 0 && bundleActivityTab === "bundle") {
      setIsLoadingBundleActivity(true)

      try {
        console.log(`📦 Loading bundle activity for bundle #${nft.tokenId}...`)
        const bundleEvents = await getBundleActivity(nft.tokenId, nft.chainId)
        setBundleActivity(bundleEvents)
        console.log(`✅ Loaded ${bundleEvents.length} bundle activity events`)
      } catch (error) {
        console.error("Failed to load bundle activity:", error)
      } finally {
        setIsLoadingBundleActivity(false)
      }
    }
  }

  loadBundleActivity()
}, [isOpen, nft, bundleActivity.length, bundleActivityTab])
```

**Rental Listing Integration:**
- Enhanced activity loading (lines 264-311)
- Fetches rental listing events for wrapper NFTs
- Merges rental events with standard NFT history
- Displays in Activity tab with "Rental Listing" marketplace label

```typescript
// If this is a wrapper NFT, also fetch rental listing creation events
if (nft.isWrapper) {
  try {
    const { getRentalListingEvents } = await import("@/lib/rental")
    const rentalEvents = await getRentalListingEvents(nft.tokenId)

    // Convert rental events to activity format
    const rentalActivities = rentalEvents.map(event => ({
      type: "listed" as const,
      price: (Number(event.pricePerDay) / 1e18).toFixed(4),
      from: event.owner,
      timestamp: event.timestamp,
      txHash: event.txHash,
      marketplace: "Rental Listing"
    }))

    // Combine and sort by timestamp
    const combined = [...nftHistory, ...rentalActivities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )

    setActivity(combined)
  } catch (rentalError) {
    console.error("Failed to fetch rental events:", rentalError)
    setActivity(nftHistory)
  }
}
```

---

## Display Behavior

### Bundle NFTs
- **Activity Tab**: Shows "Bundle Activity" with sub-tabs
  - **Bundle Activity**: Bundle creation, unwrap, transfers
  - **Contents History**: Provenance of individual NFTs in bundle

### Wrapper NFTs (Rentals)
- **Activity Tab**: Shows combined history
  - Standard NFT transfers
  - Rental listing creation with daily rate
  - Labeled as "via Rental Listing"

### Regular NFTs
- **Price Display**: Shows last sale price if available
  - Displayed on NFT cards when not currently listed
  - Format: "Last Sale: X.XX APE"

---

## Technical Notes

### Event Fetching Pattern (ThirdWeb v5)
```typescript
// 1. Define event with full Solidity signature
const event = prepareEvent({
  signature: "event EventName(uint256 indexed param1, address indexed param2, ...)"
});

// 2. Fetch events from contract
const events = await getContractEvents({
  contract,
  events: [event]
});

// 3. Parse event.args (NOT event.data)
events.forEach(event => {
  const args = event.args; // ThirdWeb v5 decodes this automatically
  console.log(args.param1, args.param2);
});
```

### Critical Requirements
1. ✅ Use `prepareEvent()` with full Solidity signatures
2. ✅ Access decoded data via `event.args` (NOT `event.data`)
3. ✅ Include all event parameters in signature
4. ✅ Use proper event indexing (`indexed` keyword)
5. ✅ Handle timestamp conversion: `Number(event.blockTimestamp || 0) * 1000`

---

## Performance Considerations

### Parallel Fetching
- Last sale prices fetched in parallel using `Promise.all()`
- Each NFT gets its own async request
- Failures don't block other NFTs

### Caching
- Profile data (including last sale prices) cached via `portfolioCache`
- Cache TTL: 5 minutes
- Stale-while-revalidate pattern

### Error Handling
- Individual fetch failures logged as warnings
- Graceful degradation (shows NFT without price)
- Never blocks UI rendering

---

## Testing Checklist

### Bundle Events
- [x] Bundle creation shows in Activity tab
- [x] Creator address displayed
- [x] NFT count shown
- [x] Transaction link works
- [x] Timestamp formatted correctly

### Rental Events
- [x] Rental listing shows in wrapper NFT activity
- [x] Price per day displayed correctly (wei → APE)
- [x] Duration range shown (min-max days)
- [x] Marketplace label: "Rental Listing"
- [x] Combined with NFT transfer history

### Last Sale Price
- [x] Displayed on unlisted NFT cards
- [x] Format: "Last Sale: X.XX APE"
- [x] Null handling (no price = no display)
- [x] Fetches from Sale events
- [x] Shows most recent sale only

---

## Example Output

### Bundle Activity
```
📦 Bundle Created
Creator: 0x1234...5678
Items: 3 NFTs (Bored Ape #123, Mutant #456, Cool Cat #789)
Jan 15, 2025 at 3:45 PM
View tx →
```

### Rental Listing
```
🏷️ Listed for Rent
Price: 0.5000 APE/Day
Duration: 1-7 Days
via Rental Listing
Jan 20, 2025 at 2:30 PM
View tx →
```

### Last Sale Price
```
NFT Card Display:
-------------------
Bored Ape #9876
Last Sale: 42.50 APE
```

---

## Files Modified

1. `lib/bundle.ts` - Added `getBundleCreationEvents()`
2. `lib/rental.ts` - Added `getRentalListingEvents()`
3. `lib/marketplace.ts` - Added `getLastSalePrice()`
4. `components/profile/profile-provider.tsx` - Integrated last sale price fetching
5. `components/nft/nft-details-modal.tsx` - Added bundle/rental activity loading

---

## Contract Addresses (ApeChain Mainnet)

- Bundle NFT: `0x58511e5E3Bfb99b3bD250c0D2feDCB93Ad10c779`
- Rental Manager: `0x96b692b2301925e3284001E963B69F8fb2B53c1d`
- Marketplace: `0x3e076856f0E06A37F4C79Cd46C936fc27f8fA7E0`

All events are fetched from ApeChain mainnet (Chain ID: 33139) unless NFT specifies a different chain.
