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
 * - Responsive grid: 2/3/5/8/10 columns
 * - Loading skeleton state
 * - Empty state message
 * - Click handler for all cards
 *
 * Grid Breakpoints:
 * - xs (< 640px): 2 columns
 * - sm (640-768px): 3 columns
 * - md (768-1024px): 5 columns
 * - lg (1024-1280px): 8 columns
 * - xl (1280px+): 10 columns
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
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 ${className}`}>
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
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 ${className}`}>
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
