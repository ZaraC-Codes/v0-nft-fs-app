"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NFTCardImage } from "./shared/NFTCardImage"
import { NFTCardContent } from "./shared/NFTCardContent"
import { NFTCardBadges } from "./shared/NFTCardBadges"
import { NFTActionButtons } from "@/components/shared/NFTActionButtons"
import { ShoppingCart, Calendar, ArrowLeftRight } from "lucide-react"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize, NFTAction } from "@/types/nft"

interface IndividualNFTCardProps {
  nft: PortfolioNFT
  size?: CardSize
  onClick?: (nft: PortfolioNFT) => void
  onActionClick?: (action: NFTAction, nft: PortfolioNFT) => void
  onBuyClick?: (nft: PortfolioNFT) => void
  onRentClick?: (nft: PortfolioNFT) => void
  onSwapClick?: (nft: PortfolioNFT) => void
  showActions?: boolean
  showWatchlist?: boolean
  isOwner?: boolean
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
  onActionClick,
  onBuyClick,
  onRentClick,
  onSwapClick,
  showActions = true,
  showWatchlist = true,
  isOwner = false,
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
        {/* Badges - chain, rarity, and watchlist */}
        <NFTCardBadges
          nft={nft}
          size={size}
          showWatchlist={showWatchlist}
          variant="standard"
        />

        {/* Action Overlay - bottom (on hover) */}
        {showActions && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
            <div className="p-4 w-full pointer-events-auto">
              <NFTActionButtons
                nft={nft}
                isOwner={isOwner}
                onActionClick={onActionClick}
                size="md"
              />
            </div>
          </div>
        )}
      </NFTCardImage>

      <NFTCardContent
        title={nft.name}
        collection={nft.collection}
        nft={nft}
        size={size}
      />
    </Card>
  )
}
