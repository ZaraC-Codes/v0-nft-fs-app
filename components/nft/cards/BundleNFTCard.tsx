"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NFTCardContent } from "./shared/NFTCardContent"
import { NFTCardBadges } from "./shared/NFTCardBadges"
import { NFTActionButtons } from "@/components/shared/NFTActionButtons"
import { ShoppingCart, Calendar, ArrowLeftRight, Package } from "lucide-react"
import type { PortfolioNFT } from "@/types/profile"
import type { CardSize, NFTAction } from "@/types/nft"

interface BundleNFTCardProps {
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
 * Bundle NFT Card - Displays bundle NFTs with FS logo and thumbnails
 *
 * Layout:
 * - Square aspect ratio (aspect-square)
 * - Gradient background (purple → black → blue)
 * - FS logo watermark (center, opacity 20%)
 * - Chain badge (top-left)
 * - Bundle badge with count (below chain)
 * - 3 thumbnail previews (bottom)
 * - Watchlist toggle (top-right)
 * - Action overlay on hover
 *
 * @example
 * <BundleNFTCard
 *   nft={bundleNFT}
 *   size="compact"
 *   onClick={(nft) => openModal(nft)}
 * />
 */
export function BundleNFTCard({
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
}: BundleNFTCardProps) {
  const thumbnails = nft.bundlePreviewImages?.slice(0, 3) || []

  return (
    <Card
      className={`group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer ${className}`}
      onClick={() => onClick?.(nft)}
    >
      {/* Bundle Background */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
        {/* FS Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img
            src="/fs-temp-logo.png"
            alt="Fortuna Square"
            className={size === 'micro' ? 'w-12 h-12' : size === 'compact' ? 'w-16 h-16' : 'w-32 h-32'}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges - chain, bundle, and watchlist */}
        <NFTCardBadges
          nft={nft}
          size={size}
          showWatchlist={showWatchlist}
          variant="bundle"
        />

        {/* Preview Thumbnails - bottom center */}
        {thumbnails.length > 0 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5">
            {thumbnails.map((preview, idx) => (
              <div
                key={idx}
                className={`${size === 'micro' ? 'w-6 h-6' : size === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0`}
              >
                <img
                  src={preview.image || "/placeholder.svg"}
                  alt={preview.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

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
      </div>

      <NFTCardContent
        title={nft.name}
        collection="Fortuna Square Bundle NFTs"
        bundleCount={nft.bundleCount}
        nft={nft}
        size={size}
      />
    </Card>
  )
}
