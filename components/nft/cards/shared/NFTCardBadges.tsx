"use client"

import { ChainBadge } from "@/components/ui/chain-badge"
import { RarityBadge } from "./RarityBadge"
import { BundleBadge } from "./BundleBadge"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import { PortfolioNFT } from "@/types/profile"
import { CardSize } from "@/types/nft"

export interface NFTCardBadgesProps {
  /** The NFT to display badges for */
  nft: PortfolioNFT

  /** Card size - affects badge sizes and spacing */
  size?: CardSize

  /** Whether to show the watchlist toggle */
  showWatchlist?: boolean

  /** Badge layout variant - affects positioning */
  variant?: 'standard' | 'bundle'
}

/**
 * NFTCardBadges - Renders positioned badges for NFT cards
 *
 * Handles consistent badge positioning across all card types:
 * - Chain badge (top-left, position 1)
 * - Rarity/Bundle badge (top-left, position 2)
 * - Watchlist toggle (top-right)
 *
 * @example
 * ```tsx
 * <NFTCardImage src={nft.image} alt={nft.name}>
 *   <NFTCardBadges nft={nft} size="standard" showWatchlist />
 * </NFTCardImage>
 * ```
 */
export function NFTCardBadges({
  nft,
  size = 'standard',
  showWatchlist = false,
  variant = 'standard',
}: NFTCardBadgesProps) {
  // Badge sizing based on card size
  const chainBadgeSize = size === 'micro' ? 'xs' : size === 'compact' ? 'sm' : 'md'
  const secondaryBadgeSize = size === 'micro' || size === 'compact' ? 'xs' : 'sm'

  // Positioning styles based on variant
  const positioning = variant === 'bundle' ? {
    topLeft: 'absolute top-4 left-4',
    secondaryTop: 'absolute top-[40px] left-4',
    topRight: 'absolute top-4 right-4 z-50',
  } : {
    topLeft: 'absolute top-1.5 left-1.5',
    secondaryTop: size === 'micro' ? 'absolute top-5 left-1.5' : 'absolute top-7 left-1.5',
    topRight: 'absolute top-1.5 right-1.5 z-50',
  }

  return (
    <>
      {/* Chain Badge - top-left, position 1 */}
      <div className={positioning.topLeft}>
        <ChainBadge
          chainId={nft.chainId}
          size={chainBadgeSize}
        />
      </div>

      {/* Secondary Badge - top-left, position 2 */}
      {nft.rarity && !nft.isBundle && (
        <div className={positioning.secondaryTop}>
          <RarityBadge
            rarity={nft.rarity}
            size={secondaryBadgeSize}
          />
        </div>
      )}

      {/* Bundle Badge - for bundle cards */}
      {nft.bundleCount !== undefined && nft.isBundle && (
        <div className={positioning.secondaryTop}>
          <BundleBadge
            count={nft.bundleCount}
            size={secondaryBadgeSize}
          />
        </div>
      )}

      {/* Watchlist Toggle - top-right */}
      {showWatchlist && (
        <div className={positioning.topRight}>
          <WatchlistToggle
            contractAddress={nft.contractAddress}
            tokenId={nft.tokenId}
            name={nft.name}
            collection={nft.collection}
            image={nft.image}
            chainId={nft.chainId}
          />
        </div>
      )}
    </>
  )
}
