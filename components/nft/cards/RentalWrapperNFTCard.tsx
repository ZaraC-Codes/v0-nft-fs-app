"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { NFTCardImage } from "./shared/NFTCardImage"
import { NFTCardContent } from "./shared/NFTCardContent"
import { NFTCardBadges } from "./shared/NFTCardBadges"
import { NFTActionButtons } from "@/components/shared/NFTActionButtons"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize } from "@/types/nft"
import type { NFTAction } from "@/types/nft"

interface RentalWrapperNFTCardProps {
  nft: PortfolioNFT
  size?: CardSize
  onClick?: (nft: PortfolioNFT) => void
  onActionClick?: (action: NFTAction, nft: PortfolioNFT) => void
  showActions?: boolean
  showWatchlist?: boolean
  isOwner?: boolean
  className?: string
}

/**
 * Rental Wrapper NFT Card - Displays rental wrapper NFTs with rental status
 *
 * Layout:
 * - Wrapped NFT image
 * - Chain badge (top-left)
 * - Rarity badge (below chain)
 * - Listing badge (below rarity, if applicable)
 * - Rental status badge (below listing)
 * - Watchlist toggle (top-right)
 * - Action overlay on hover
 * - Footer: name, collection, rental price per day
 *
 * @example
 * <RentalWrapperNFTCard
 *   nft={rentalNFT}
 *   size="compact"
 *   onClick={(nft) => openModal(nft)}
 * />
 */
export function RentalWrapperNFTCard({
  nft,
  size = 'standard',
  onClick,
  onActionClick,
  showActions = true,
  showWatchlist = true,
  isOwner = false,
  className = ''
}: RentalWrapperNFTCardProps) {
  // Determine rental status
  const isRented = nft.rentalListing?.currentRenter &&
    nft.rentalListing.currentRenter !== '0x0000000000000000000000000000000000000000'

  const rentalStatusColor = isRented
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : 'bg-green-500/20 text-green-400 border-green-500/30'

  const rentalStatusLabel = isRented ? 'Rented' : 'Available'

  // Format rental price for display
  const rentalPriceDisplay = nft.rentalListing?.pricePerDay
    ? `${(Number(nft.rentalListing.pricePerDay) / 1e18).toFixed(2)} APE/day`
    : nft.listing?.rent?.pricePerDay
      ? `${nft.listing.rent.pricePerDay} APE/day`
      : undefined

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
