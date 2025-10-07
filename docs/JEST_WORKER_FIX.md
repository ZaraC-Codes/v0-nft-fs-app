# Jest Worker Error - Permanent Fix

## Problem
Recurring error when starting the Next.js development server:
```
Error: Jest worker encountered 2 child process exceptions, exceeding retry limit
```

This error occurs particularly on Windows systems when accessing profile pages or other pages after starting the dev server.

## Root Cause ⚠️ REAL ISSUE IDENTIFIED

### The Actual Problem:
**EXCESSIVE BUNDLE SIZE** causing compilation timeouts:
- Profile page was compiling **11,723 modules** in **82+ seconds**
- Jest workers timeout after 60-90 seconds → crash
- Heavy modal components importing entire thirdweb SDK
- All modals loaded upfront even when not used

### Secondary Issues:
1. Worker thread crashes on Windows
2. Cache corruption in `.next` directory
3. Memory pressure from parallel processing
4. No code splitting or lazy loading

## Permanent Solutions Implemented

### 1. **Lazy Loading Heavy Components** (PRIMARY FIX)
Implemented in `components/profile/profile-tabs.tsx`:

```javascript
// Lazy load modal components only when opened
const NFTDetailsModal = lazy(() => import("@/components/nft/nft-details-modal").then(m => ({ default: m.NFTDetailsModal })))
const SwapModal = lazy(() => import("@/components/swap/swap-modal").then(m => ({ default: m.SwapModal })))
const CreateSwapModal = lazy(() => import("@/components/swap/create-swap-modal").then(m => ({ default: m.CreateSwapModal })))
// ... and more modals

// Wrapped in Suspense and only render when needed
<Suspense fallback={<div className="hidden" />}>
  {isModalOpen && <NFTDetailsModal ... />}
  {createSwapModalOpen && <CreateSwapModal ... />}
</Suspense>
```

**Impact:** Reduces initial bundle size from 11,723+ modules to much smaller core bundle. Modals load on-demand.

### 2. Next.js Configuration (`next.config.mjs`)

### 1. Next.js Configuration (`next.config.mjs`)
Updated configuration with these key changes:

```javascript
// Disable SWC minification (causes worker crashes on Windows)
swcMinify: false,

// Disable worker threads and limit CPU usage
experimental: {
  workerThreads: false,
  cpus: 1,
},

webpack: (config, { isServer, dev }) => {
  // Reduce parallelism to prevent crashes
  config.parallelism = 1

  // Disable cache in development to prevent corruption
  if (dev) {
    config.cache = false
  }

  return config
}
```

### 2. Clean Start Scripts
Added npm scripts to `package.json`:

- **`pnpm run dev:clean`** - Cleans `.next` directory and starts dev server
- **`pnpm clean`** - Cleans both `.next` and `node_modules/.cache` directories

### 3. Windows Batch Script (`dev-clean.bat`)
Created a convenient batch script that:
1. Kills any running Node.js processes
2. Removes `.next` and cache directories
3. Starts the dev server fresh

## How to Use

### When Starting the Project

**Option 1: Use the clean start script (Recommended)**
```bash
pnpm run dev:clean
```

**Option 2: Use the batch file (Windows only)**
```bash
dev-clean.bat
```

**Option 3: Manual clean start**
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Clean cache
pnpm clean

# Start dev server
pnpm dev
```

### If Error Occurs During Development

1. Stop the dev server (Ctrl+C)
2. Run `pnpm run dev:clean`
3. The error should not recur with the new configuration

## Additional Notes

- The `swcMinify: false` setting may be deprecated in future Next.js versions
- If you still encounter issues, try deleting `node_modules` and running `pnpm install` again
- The configuration prioritizes stability over build speed (single-threaded compilation)

### 4. **Safe Chain Metadata Access**
Added defensive checks for chain metadata to prevent runtime errors:

```typescript
// lib/thirdweb.ts - Helper function for safe access
export function getChainMetadata(chainId: number | undefined) {
  if (!chainId || !CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA]) {
    return null;
  }
  return CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA];
}

// Usage in components - only render if chainId exists
{getChainMetadata(nft.chainId) && (
  <Badge className={`bg-gradient-to-r ${getChainMetadata(nft.chainId)!.color}`}>
    {getChainMetadata(nft.chainId)!.icon}
  </Badge>
)}
```

**Impact:** Prevents "Cannot read properties of undefined" errors when NFTs lack chainId data.

### 5. **API Route chainId Mapping**
Fixed NFT data transformation to include chainId:

```typescript
// app/api/wallet-nfts/route.ts
const nfts = nftData.map((nft: any) => ({
  contractAddress: nft.contractAddress || nft.contract_address,
  tokenId: nft.tokenId || nft.token_id,
  name: nft.name || `Token #${nft.tokenId}`,
  image: nft.image_url || nft.image,
  chainId: nft.chain_id || nft.chainId || parseInt(chainId), // ← Added
  collectionName: nft.contract?.name || nft.collection?.name,
}))
```

**Files Updated:**
- `app/api/wallet-nfts/route.ts` - API response mapping
- `components/profile/profile-provider.tsx` - Portfolio NFT mapping
- `lib/thirdweb.ts` - Safe getter function
- All NFT display components (profile-tabs, nft-details-modal, featured-nfts, swap-modal, create-swap-modal, create-bundle-modal, nft-detail, related-nfts)

## Testing
The fix has been tested and verified to:
- ✅ Eliminate Jest worker errors on startup
- ✅ Allow profile pages to load without crashes
- ✅ Prevent cache corruption between restarts
- ✅ Work reliably on Windows systems
- ✅ Handle missing chainId gracefully without errors
- ✅ Display NFTs correctly with chain badges when chainId is present

## References
- Next.js Worker Configuration: https://nextjs.org/docs/app/api-reference/next-config-js
- Jest Worker Issues: https://github.com/vercel/next.js/issues/48324
- Windows Compatibility: https://github.com/vercel/next.js/discussions/46544
