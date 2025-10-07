"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NFTCardImage } from "./shared/NFTCardImage"
import { ChainBadge } from "./shared/ChainBadge"
import { RarityBadge } from "./shared/RarityBadge"
import { NFTCardContent } from "./shared/NFTCardContent"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import { ShoppingCart, Calendar, ArrowLeftRight } from "lucide-react"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize } from "@/types/nft"

interface IndividualNFTCardProps {
  nft: PortfolioNFT
  size?: CardSize
  onClick?: (nft: PortfolioNFT) => void
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
              {/* Buy Button - for sale listings (non-owner) */}
              {nft.listing?.type === 'sale' && !isOwner && (
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBuyClick?.(nft)
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy for {nft.listing.sale.price} APE
                </Button>
              )}

              {/* Rent Button - for rental listings (non-owner) */}
              {nft.listing?.type === 'rent' && !isOwner && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRentClick?.(nft)
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Rent {nft.listing.rent.pricePerDay} APE/Day
                </Button>
              )}

              {/* Swap Button - for swap listings (non-owner) */}
              {nft.listing?.type === 'swap' && !isOwner && (
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSwapClick?.(nft)
                  }}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Propose Swap
                </Button>
              )}

              {/* View Details Button - for non-listed or owner viewing own listing */}
              {(!nft.listing || nft.listing.type === 'none' || isOwner) && (
                <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow">
                  View Details
                </Button>
              )}
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
