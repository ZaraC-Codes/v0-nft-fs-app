"use client"

import { isBundleNFT, isRentalWrapperNFT } from "@/types/nft"
import { IndividualNFTCard } from "./IndividualNFTCard"
import { BundleNFTCard } from "./BundleNFTCard"
import { RentalWrapperNFTCard } from "./RentalWrapperNFTCard"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize } from "@/types/nft"

interface NFTCardGridProps {
  nfts: PortfolioNFT[]
  size?: CardSize
  emptyMessage?: string
  loading?: boolean
  onCardClick?: (nft: PortfolioNFT) => void
  showActions?: boolean
  showWatchlist?: boolean
  className?: string
}

/**
 * NFT Card Grid - Responsive grid wrapper with auto card type detection
 *
 * Features:
 * - Auto-detects NFT type and renders correct card variant
 * - Responsive grid: 2/3/4/5/6 columns (optimized for bundle thumbnail visibility)
 * - Loading skeleton state
 * - Empty state message
 * - Click handler for all cards
 *
 * Grid Breakpoints (optimized for viewing bundle thumbnails and action buttons):
 * - xs (< 640px): 2 columns (~170px cards)
 * - sm (640-768px): 3 columns (~210px cards)
 * - md (768-1024px): 4 columns (~190px cards)
 * - lg (1024-1280px): 5 columns (~200px cards)
 * - xl (1280px+): 6 columns (~210px cards)
 *
 * @example
 * <NFTCardGrid
 *   nfts={portfolioNFTs}
 *   size="compact"
 *   onCardClick={(nft) => setSelectedNFT(nft)}
 *   loading={false}
 * />
 */
export function NFTCardGrid({
  nfts,
  size = 'compact',
  emptyMessage = "No NFTs found",
  loading = false,
  onCardClick,
  showActions = true,
  showWatchlist = true,
  className = ''
}: NFTCardGridProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 ${className}`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card/30 h-32 rounded-t-lg" />
            <div className="bg-card/20 h-20 rounded-b-lg" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (nfts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Render NFT grid with correct card variant
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 ${className}`}>
      {nfts.map((nft) => {
        const key = `${nft.contractAddress}-${nft.tokenId}`

        // Bundle NFT
        if (isBundleNFT(nft)) {
          return (
            <BundleNFTCard
              key={key}
              nft={nft}
              size={size}
              onClick={onCardClick}
              showActions={showActions}
              showWatchlist={showWatchlist}
            />
          )
        }

        // Rental Wrapper NFT
        if (isRentalWrapperNFT(nft)) {
          return (
            <RentalWrapperNFTCard
              key={key}
              nft={nft}
              size={size}
              onClick={onCardClick}
              showActions={showActions}
              showWatchlist={showWatchlist}
            />
          )
        }

        // Individual NFT (default)
        return (
          <IndividualNFTCard
            key={key}
            nft={nft}
            size={size}
            onClick={onCardClick}
            showActions={showActions}
            showWatchlist={showWatchlist}
          />
        )
      })}
    </div>
  )
}
