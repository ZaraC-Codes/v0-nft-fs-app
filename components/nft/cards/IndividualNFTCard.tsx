"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NFTCardImage } from "./shared/NFTCardImage"
import { ChainBadge } from "./shared/ChainBadge"
import { RarityBadge } from "./shared/RarityBadge"
import { ListingBadge } from "./shared/ListingBadge"
import { NFTCardContent } from "./shared/NFTCardContent"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize } from "@/types/nft"

interface IndividualNFTCardProps {
  nft: PortfolioNFT
  size?: CardSize
  onClick?: (nft: PortfolioNFT) => void
  showActions?: boolean
  showWatchlist?: boolean
  className?: string
}

/**
 * Individual NFT Card - Standard NFT display
 *
 * Layout:
 * - Square aspect image
 * - Chain badge (top-left)
 * - Rarity badge (below chain)
 * - Listing badge (below rarity, if applicable)
 * - Watchlist toggle (top-right)
 * - Action overlay on hover (bottom)
 * - Footer: name, collection, price
 *
 * @example
 * <IndividualNFTCard
 *   nft={nft}
 *   size="compact"
 *   onClick={(nft) => openModal(nft)}
 *   showActions={true}
 * />
 */
export function IndividualNFTCard({
  nft,
  size = 'standard',
  onClick,
  showActions = true,
  showWatchlist = true,
  className = ''
}: IndividualNFTCardProps) {
  return (
    <Card
      className={`group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer ${className}`}
      onClick={() => onClick?.(nft)}
    >
      <NFTCardImage
        src={nft.image}
        alt={nft.name}
        size={size}
        onImageClick={() => onClick?.(nft)}
      >
        {/* Chain Badge - top-left, position 1 */}
        <div className="absolute top-1.5 left-1.5">
          <ChainBadge chainId={nft.chainId} size={size === 'compact' ? 'sm' : 'md'} />
        </div>

        {/* Rarity Badge - top-left, position 2 */}
        {nft.rarity && (
          <div className="absolute top-7 left-1.5">
            <RarityBadge rarity={nft.rarity} size={size === 'compact' ? 'xs' : 'sm'} />
          </div>
        )}

        {/* Listing Badge - top-left, position 3 */}
        {nft.listing && nft.listing.type !== 'none' && (
          <div className="absolute top-[52px] left-1.5">
            <ListingBadge
              listingType={nft.listing.type}
              size={size === 'compact' ? 'xs' : 'sm'}
            />
          </div>
        )}

        {/* Watchlist Toggle - top-right */}
        {showWatchlist && (
          <div className="absolute top-1.5 right-1.5 z-50">
            <WatchlistToggle
              contractAddress={nft.contractAddress}
              tokenId={nft.tokenId}
              name={nft.name}
              collection={nft.collection}
              image={nft.image}
              chainId={nft.chainId}
              className="bg-black/50 hover:bg-black/70 text-white"
            />
          </div>
        )}

        {/* Action Overlay - bottom (on hover) */}
        {showActions && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
            <div className="p-4 w-full pointer-events-auto">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow">
                View Details
              </Button>
            </div>
          </div>
        )}
      </NFTCardImage>

      <NFTCardContent
        title={nft.name}
        collection={nft.collection}
        price={nft.listing?.sale?.price?.toString()}
        size={size}
      />
    </Card>
  )
}
